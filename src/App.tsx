import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import {
  Mic,
  Square,
  Settings,
  Clock,
  FileText,
  Copy,
  Check,
  X,
  Trash,
  Lightbulb,
} from "lucide-react";
import { Modal } from "./components/Modal";

// 類型定義
interface AudioDevice {
  name: string;
  is_default: boolean;
}

interface RecordingStatus {
  is_recording: boolean;
  recording_id: string | null;
}

interface AppConfig {
  chatgpt_token: string;
  oai_client_build_number: string;
  oai_client_version: string;
  oai_device_id: string;
  hotkey: string;
  recording_format: string;
  audio_device: string | null;
}

// 轉錄歷史記錄
interface TranscriptionHistory {
  id: string;
  text: string;
  duration: number; // 錄音時長（秒）
  timestamp: number; // 轉錄完成時間戳
}

// 狀態步驟
type StepStatus = "pending" | "active" | "completed";

interface Step {
  id: string;
  label: string;
  status: StepStatus;
}

function App() {
  // 狀態
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>({
    is_recording: false,
    recording_id: null,
  });
  const [config, setConfig] = useState<AppConfig>({
    chatgpt_token: "",
    oai_client_build_number: "",
    oai_client_version: "",
    oai_device_id: "",
    hotkey: "Ctrl+Shift+R",
    recording_format: "wav",
    audio_device: null,
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [tempBuildNumber, setTempBuildNumber] = useState("");
  const [tempClientVersion, setTempClientVersion] = useState("");
  const [tempDeviceId, setTempDeviceId] = useState("");
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);

  // 新增：轉錄歷史
  const [history, setHistory] = useState<TranscriptionHistory[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  // 流程步驟狀態
  const [steps, setSteps] = useState<Step[]>([
    { id: "record", label: "錄音中", status: "pending" },
    { id: "save", label: "保存檔案", status: "pending" },
    { id: "transcribe", label: "API 轉錄中", status: "pending" },
    { id: "done", label: "完成", status: "pending" },
  ]);

  // 時間追蹤
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);
  const [finalTime, setFinalTime] = useState<number>(0);  // 保存最終時長

  // 更新步驟狀態的輔助函數
  const updateStep = (stepId: string, status: StepStatus) => {
    setSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, status } : step
    ));
  };

  // 重置所有步驟
  const resetSteps = () => {
    setSteps([
      { id: "record", label: "錄音中", status: "pending" },
      { id: "save", label: "保存檔案", status: "pending" },
      { id: "transcribe", label: "API 轉錄中", status: "pending" },
      { id: "done", label: "完成", status: "pending" },
    ]);
    setStartTime(null);
    setElapsed(0);
    setFinalTime(0);
    setTranscriptionResult(null);
  };

  // 載入設備列表和配置
  useEffect(() => {
    const initApp = async () => {
      await loadDevices();
      await loadConfig();
      await loadHistory();

      // 配置載入後再設置熱鍵監聽
      const unlisten = listen<any>("hotkey-triggered", (event) => {
        console.log("收到熱鍵事件 payload:", event.payload, "類型:", typeof event.payload);
        const isPressed = event.payload === true;
        console.log("解析後 isPressed:", isPressed);

        if (isPressed) {
          // Pressed: 檢查是否已在等待 Released（防止重複觸發）
          if (hotkeyStateRef.current.isWaitingForReleased) {
            console.log("[快捷鍵] 已在等待 Released，忽略此 Pressed");
            return;
          }
          // 標記正在等待 Released，並記錄時間
          hotkeyStateRef.current.isWaitingForReleased = true;
          hotkeyStateRef.current.lastPressedTime = Date.now();
          handleMouseDown();
        } else {
          // Released: 檢查是否有效（必須有對應的 Pressed）
          if (!hotkeyStateRef.current.isWaitingForReleased) {
            console.log("[快捷鍵] 沒有對應的 Pressed，忽略此 Released");
            return;
          }
          // 清除標記並執行停止
          hotkeyStateRef.current.isWaitingForReleased = false;
          handleMouseUp();
        }
      });

      return () => {
        unlisten.then((fn) => fn());
      };
    };

    initApp();
  }, []);

  // 計時器：每秒更新經過時間（只在轉錄過程中）
  useEffect(() => {
    let interval: number | null = null;
    if (startTime && status.includes("轉錄")) {
      interval = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [startTime, status]);

  const loadDevices = async () => {
    try {
      const result = await invoke<AudioDevice[]>("list_audio_devices");
      setDevices(result);
    } catch (err) {
      setError(`無法載入設備列表: ${err}`);
    }
  };

  const loadConfig = async () => {
    try {
      const result = await invoke<AppConfig>("get_config_command");
      setConfig(result);
      setTempToken(result.chatgpt_token);
      setTempBuildNumber(result.oai_client_build_number);
      setTempClientVersion(result.oai_client_version);
      setTempDeviceId(result.oai_device_id);
      if (result.audio_device) {
        setSelectedDevice(result.audio_device);
      }
    } catch (err) {
      console.error("無法載入配置:", err);
    }
  };

  // 新增：載入轉錄歷史
  const loadHistory = async () => {
    try {
      const result = await invoke<TranscriptionHistory[]>("get_transcription_history");
      setHistory(result);
    } catch (err) {
      console.error("無法載入歷史:", err);
    }
  };

  // 長按錄音狀態
  const [isPressing, setIsPressing] = useState(false);
  // @ts-expect-error - isStartingRecording is used indirectly via setIsStartingRecording
  const [isStartingRecording, setIsStartingRecording] = useState(false);

  // 快捷鍵狀態鎖：確保 Pressed → Released 順序
  const hotkeyStateRef = useRef({
    isWaitingForReleased: false,
    lastPressedTime: 0,
  });

  // 開始錄音（長按觸發）
  const handleMouseDown = async () => {
    console.log("[handleMouseDown] 開始");
    setIsPressing(true);
    setIsStartingRecording(true);

    try {
      setError("");
      resetSteps();
      updateStep("record", "active");
      setStatus("正在啟動錄音...");

      const deviceId = selectedDevice || undefined;
      const recordingId = await invoke<string>("start_recording", {
        deviceName: deviceId,
      });

      console.log("[handleMouseDown] 錄音啟動成功:", recordingId);
      setIsStartingRecording(false);
      setRecordingStatus({
        is_recording: true,
        recording_id: recordingId,
      });

      updateStep("record", "completed");
      setStatus("🎙️ 錄音中... (鬆開停止)");
    } catch (err) {
      console.log("[handleMouseDown] 錄音啟動失敗:", err);
      setIsStartingRecording(false);
      setIsPressing(false);

      // 啟動錄音失敗，重新同步後端狀態
      try {
        const actualStatus = await invoke<RecordingStatus>("get_recording_status");
        console.log("[handleMouseDown] 後端實際狀態:", actualStatus);
        setRecordingStatus({
          is_recording: actualStatus.is_recording,
          recording_id: actualStatus.recording_id,
        });

        if (actualStatus.is_recording) {
          updateStep("record", "completed");
          setStatus("🎙️ 錄音中... (鬆開停止)");
        } else {
          setError(`無法開始錄音: ${err}`);
          setStatus("❌ 開始錄音失敗");
        }
      } catch (statusErr) {
        console.log("[handleMouseDown] 獲取狀態也失敗:", statusErr);
        setError(`無法開始錄音: ${err}`);
        setStatus("❌ 開始錄音失敗");
      }
    }
  };

  // 停止錄音（鬆開或滑出觸發）
  const handleMouseUp = async () => {
    setIsPressing(false);

    // 如果正在啟動錄音，等待一下讓它完成
    // 使用函數式更新確保獲取最新狀態
    let shouldWait = false;
    setIsStartingRecording(prev => {
      shouldWait = prev;
      return prev; // 不改變狀態
    });

    if (shouldWait) {
      console.log("[handleMouseUp] 等待錄音啟動完成...");
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    setIsStartingRecording(false);

    // 直接嘗試停止錄音（不管前端狀態是什麼）
    try {
      console.log("[handleMouseUp] 開始停止錄音");
      setError("");
      setStatus("正在停止錄音...");

      const result = await invoke<{audio_path: string; duration: number}>("stop_recording");
      console.log("[handleMouseUp] stop_recording 成功:", result);

      // 只有成功停止才更新狀態
      setRecordingStatus({
        is_recording: false,
        recording_id: null,
      });

      updateStep("save", "completed");
      setStatus(`✓ 錄音已保存 (時長: ${formatTime(result.duration)})`);

      // 檢查 Token 配置（直接從後端檢查）
      try {
        const currentConfig = await invoke<AppConfig>("get_config_command");
        if (!currentConfig.chatgpt_token) {
          console.log("[handleMouseUp] 沒有 Token，跳過轉錄");
          setError("請先在設定中配置 ChatGPT Token");
          setStatus("⚠️ 錄音已保存，但未設定 Token 無法轉錄");
          return;
        }
        console.log("[handleMouseUp] Token 有，開始轉錄");
      } catch (configErr) {
        console.log("[handleMouseUp] 檢查 Token 失敗:", configErr);
        setError("無法檢查 Token 配置");
        setStatus("⚠️ 錄音已保存，但無法確認 Token");
        return;
      }

      // 開始轉錄流程
      updateStep("transcribe", "active");
      setStatus("🔄 正在轉錄文字...");
      setPendingCount(prev => prev + 1);

      const transcriptionStartTime = Date.now();
      setStartTime(transcriptionStartTime);

      try {
        const text = await invoke<string>("transcribe_audio", { audioPath: result.audio_path });
        console.log("[handleMouseUp] 轉錄成功:", text);

        // 保存最終時長
        const calculatedFinalTime = Math.floor((Date.now() - transcriptionStartTime) / 1000);
        setFinalTime(calculatedFinalTime);
        setStartTime(null);  // 停止計時器更新

        // 檢查轉錄結果是否為空
        const trimmedText = text.trim();
        if (!trimmedText) {
          setError("轉錄結果為空，請確認錄音內容");
          setStatus("⚠️ 轉錄完成但無內容");
          setPendingCount(prev => prev - 1);
          // 標記為完成狀態
          updateStep("transcribe", "completed");
          updateStep("done", "completed");
          return;
        }

        // 保存到歷史
        const newRecord: TranscriptionHistory = {
          id: Date.now().toString(),
          text: trimmedText,
          duration: result.duration,
          timestamp: Date.now(),
        };

        setHistory(prev => [newRecord, ...prev].slice(0, 5));
        setTranscriptionResult(trimmedText);

        updateStep("transcribe", "completed");
        updateStep("done", "completed");

        // 使用 Tauri clipboard API，因為快捷鍵操作時視窗可能沒有焦點
        await invoke("copy_to_clipboard", { text: trimmedText });
        setStatus(`✓ 轉錄完成！已複製到剪貼簿 (耗時 ${formatTime(finalTime)})`);

        setPendingCount(prev => prev - 1);
      } catch (transcribeErr) {
        console.log("[handleMouseUp] 轉錄失敗:", transcribeErr);
        setError(`轉錄失敗: ${transcribeErr}`);
        setStatus("❌ 轉錄失敗（錄音已保存）");
        setStartTime(null);
        setPendingCount(prev => prev - 1);
      }
    } catch (err) {
      console.log("[handleMouseUp] stop_recording 失敗:", err);
      const errorMsg = String(err);
      if (errorMsg.includes("沒有進行中的錄音會話")) {
        const actualStatus = await invoke<RecordingStatus>("get_recording_status");
        setRecordingStatus({
          is_recording: actualStatus.is_recording,
          recording_id: actualStatus.recording_id,
        });
        if (!actualStatus.is_recording) {
          setError("");
          setStatus("就緒");
        }
      } else {
        setError(`無法停止錄音: ${err}`);
        setStatus("❌ 停止錄音失敗");
      }
      setStartTime(null);
    }
  };

  // 格式化時間顯示
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}秒`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  // 格式化時間戳
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "剛剛";
    if (diffMins < 60) return `${diffMins}分鐘前`;
    if (diffHours < 24) return `${diffHours}小時前`;
    return `${diffDays}天前`;
  };

  const saveConfig = async () => {
    try {
      const newConfig = {
        ...config,
        chatgpt_token: tempToken,
        oai_client_build_number: tempBuildNumber,
        oai_client_version: tempClientVersion,
        oai_device_id: tempDeviceId,
        audio_device: selectedDevice
      };
      await invoke("set_config", { config: newConfig });
      setConfig(newConfig);
      setIsSettingsOpen(false);
      setStatus("配置已保存");
    } catch (err) {
      setError(`無法保存配置: ${err}`);
    }
  };

  const cleanupOldRecordings = async () => {
    try {
      const result = await invoke<string>("cleanup_old_recordings", { days: 7 });
      setStatus(result);
    } catch (err) {
      setError(`清理失敗: ${err}`);
    }
  };

  // 新增：刪除歷史記錄
  const deleteHistoryItem = async (id: string) => {
    try {
      await invoke("delete_history_item", { id });
      setHistory(prev => prev.filter(item => item.id !== id));
      setStatus("記錄已刪除");
    } catch (err) {
      setError(`刪除失敗: ${err}`);
    }
  };

  // 新增：清空所有歷史
  const clearAllHistory = async () => {
    try {
      await invoke("clear_all_history");
      setHistory([]);
      setStatus("歷史記錄已清空");
    } catch (err) {
      setError(`清空失敗: ${err}`);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>GPT-Typeless</h1>
          <div className="recording-status">
            <span className={`status-dot ${recordingStatus.is_recording ? "recording" : ""}`} />
            <span className="status-text">
              {recordingStatus.is_recording ? "錄音中" : "就緒"}
            </span>
            {(startTime || finalTime > 0) && (
              <span className="status-timer">
                <Clock /> {formatTime(startTime ? elapsed : finalTime)}
              </span>
            )}
          </div>
        </div>

        <div className="header-right">
          {/* 顯示處理數量 */}
          {pendingCount > 0 && (
            <span className="pending-badge">
              {pendingCount}
            </span>
          )}

          <button
            className={`record-btn ${recordingStatus.is_recording ? "recording" : ""} ${isPressing ? "pressing" : ""}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={(e) => { e.preventDefault(); handleMouseDown(); }}
            onTouchEnd={(e) => { e.preventDefault(); handleMouseUp(); }}
          >
            {recordingStatus.is_recording ? (
              <>
                <Square />
                停止
              </>
            ) : (
              <>
                <Mic />
                錄音
              </>
            )}
          </button>

          <span className="hotkey-hint">
            <Lightbulb />
            {config.hotkey}
          </span>

          <button
            className="settings-btn"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <Settings />
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* 狀態訊息 */}
        {status && (
          <section className="status-section">
            <p className="status-message">{status}</p>
          </section>
        )}

        {/* 流程步驟 - 路線圖風格（常駐顯示） */}
        <section className="roadmap-container">
          <div className="roadmap-steps">
            {steps.map((step, index) => (
              <div key={step.id} className={`roadmap-step ${step.status}`}>
                <div className="roadmap-step-content">
                  <div className="roadmap-step-icon">
                    {step.status === "completed" ? (
                      <Check />
                    ) : step.status === "active" ? (
                        <span className="spin">⟳</span>
                      ) : (
                        <span className="step-number">{index + 1}</span>
                      )}
                    </div>
                    <span className="roadmap-step-label">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`roadmap-connector ${
                      step.status === "completed" ? "completed" : ""
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </section>

        {/* 錯誤訊息 */}
        {error && (
          <section className="error-section">
            <p className="error-message">{error}</p>
            <button onClick={() => setError("")}>
              <X />
            </button>
          </section>
        )}

        {/* 轉錄結果 */}
        {transcriptionResult && (
          <section className="transcription-section">
            <div className="transcription-header">
              <h3><FileText /> 轉錄結果</h3>
              <button
                className="copy-result-btn"
                onClick={async () => {
                  await invoke("copy_to_clipboard", { text: transcriptionResult });
                  // 不設置 status，避免重渲染
                }}
              >
                <Copy />
                複製
              </button>
            </div>
            <div className="transcription-content">
              {transcriptionResult}
            </div>
          </section>
        )}

        {/* 新增：轉錄歷史 */}
        {history.length > 0 && (
          <section className="history-section">
            <div className="history-header">
              <h3>📜 最近轉錄記錄</h3>
              <button
                className="clear-history-btn"
                onClick={clearAllHistory}
                title="清空所有記錄"
              >
                清空全部
              </button>
            </div>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-item-main">
                    <div className="history-item-text">
                      {item.text}
                    </div>
                    <div className="history-item-meta">
                      <span className="history-time">⏱️ {formatTime(item.duration)}</span>
                      <span className="history-date">{formatTimestamp(item.timestamp)}</span>
                      <button
                        className="history-copy-btn"
                        onClick={async () => {
                          await invoke("copy_to_clipboard", { text: item.text });
                          // 不設置 status，避免重渲染
                        }}
                        title="複製"
                      >
                        <Copy />
                      </button>
                      <button
                        className="history-delete-btn"
                        onClick={() => deleteHistoryItem(item.id)}
                        title="刪除"
                      >
                        <Trash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 設定 Modal - 加入設備選擇 */}
        <Modal
          isOpen={isSettingsOpen}
          onClose={() => {
            setIsSettingsOpen(false);
            setTempToken(config.chatgpt_token);
            setTempBuildNumber(config.oai_client_build_number);
            setTempClientVersion(config.oai_client_version);
            setTempDeviceId(config.oai_device_id);
          }}
          title="設定"
        >
          <div className="modal-form-group">
            <label htmlFor="token-input">
              ChatGPT Token
              <span style={{ color: 'var(--danger)', fontWeight: 'normal', marginLeft: '0.25rem' }}>*</span>
            </label>
            <input
              id="token-input"
              type="password"
              value={tempToken}
              onChange={(e) => setTempToken(e.target.value)}
              placeholder="eyJhbGciOiJSUzI1NiIsImtpZCI6..."
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.75rem' }}
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="build-input">
              oai-client-build-number
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                (選填)
              </span>
            </label>
            <input
              id="build-input"
              type="text"
              value={tempBuildNumber}
              onChange={(e) => setTempBuildNumber(e.target.value)}
              placeholder="4228200"
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.75rem' }}
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="version-input">
              oai-client-version
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                (選填)
              </span>
            </label>
            <input
              id="version-input"
              type="text"
              value={tempClientVersion}
              onChange={(e) => setTempClientVersion(e.target.value)}
              placeholder="prod-113d17ee277d09e29075aec611394c0efe23d0e0"
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.75rem' }}
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="device-input">
              oai-device-id
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                (選填)
              </span>
            </label>
            <input
              id="device-input"
              type="text"
              value={tempDeviceId}
              onChange={(e) => setTempDeviceId(e.target.value)}
              placeholder="8f0b7aa2-af16-4225-a667-69a9be96d046"
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.75rem' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.375rem' }}>
              💡 F12 → Network → 找 /backend-api/ 請求 → 查看 Headers
            </div>
          </div>

          <div className="modal-form-group">
            <label htmlFor="hotkey-input">快捷鍵：</label>
            <input
              id="hotkey-input"
              type="text"
              value={config.hotkey}
              onChange={(e) => setConfig({ ...config, hotkey: e.target.value })}
              placeholder="例如：Ctrl+Shift+R"
            />
          </div>

          {/* 新增：設備選擇 */}
          <div className="modal-form-group">
            <label htmlFor="device-select">錄音設備：</label>
            <select
              id="device-select"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
            >
              {devices.map((device) => (
                <option key={device.name} value={device.name}>
                  {device.name} {device.is_default ? "(預設)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button className="modal-save-btn" onClick={saveConfig}>
              儲存設定
            </button>
          </div>

          <div className="modal-cleanup-section">
            <h3>維護</h3>
            <button className="modal-cleanup-btn" onClick={cleanupOldRecordings}>
              <Trash />
              清理 7 天前的錄音
            </button>
          </div>
        </Modal>
      </main>

      <footer className="app-footer">
        <p>GPT-Typeless v1.0.0</p>
      </footer>
    </div>
  );
}

export default App;

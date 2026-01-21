import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import {
  MicIcon,
  StopIcon,
  SettingsIcon,
  ClockIcon,
  DocumentIcon,
  CopyIcon,
  CheckIcon,
  CloseIcon,
  TrashIcon,
  LightbulbIcon,
} from "./components/Icons";
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
  hotkey: string;
  recording_format: string;
  audio_device: string | null;
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
    hotkey: "Ctrl+Shift+R",
    recording_format: "wav",
    audio_device: null,
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);

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
    setStartTime(null);  // 不在錄音開始時設定時間
    setElapsed(0);
    setTranscriptionResult(null);
  };

  // 載入設備列表
  useEffect(() => {
    loadDevices();
    loadConfig();

    // 監聽熱鍵事件
    const unlisten = listen<string>("hotkey-triggered", (event) => {
      console.log("收到熱鍵事件:", event.payload);
      toggleRecording();
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // 計時器：每秒更新經過時間（只在轉錄過程中）
  useEffect(() => {
    let interval: number | null = null;
    // 只在轉錄過程中顯示計時，不在錄音時
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
      const defaultDevice = result.find((d) => d.is_default);
      if (defaultDevice) {
        setSelectedDevice(defaultDevice.name);
      }
    } catch (err) {
      setError(`無法載入設備列表: ${err}`);
    }
  };

  const loadConfig = async () => {
    try {
      const result = await invoke<AppConfig>("get_config_command");
      setConfig(result);
      setTempToken(result.chatgpt_token);
    } catch (err) {
      console.error("無法載入配置:", err);
    }
  };

  const startRecording = async () => {
    try {
      setError("");
      resetSteps();
      updateStep("record", "active");
      setStatus("正在啟動錄音...");

      const deviceId = selectedDevice || undefined;
      const recordingId = await invoke<string>("start_recording", {
        deviceName: deviceId,
      });

      setRecordingStatus({
        is_recording: true,
        recording_id: recordingId,
      });

      updateStep("record", "completed");
      setStatus("🎙️ 錄音中... (再按一次停止)");
    } catch (err) {
      setError(`無法開始錄音: ${err}`);
      setStatus("❌ 開始錄音失敗");
    }
  };

  const stopRecording = async () => {
    try {
      setError("");
      setStatus("正在停止錄音...");

      // 獲取錄音檔案路徑
      const audioPath = await invoke<string>("stop_recording");

      setRecordingStatus({
        is_recording: false,
        recording_id: null,
      });

      updateStep("save", "completed");
      setStatus(`✓ 錄音已保存`);

      // 檢查 Token 配置
      if (!config.chatgpt_token) {
        setError("請先在設定中配置 ChatGPT Token");
        setStatus("⚠️ 錄音已保存，但未設定 Token 無法轉錄");
        return;
      }

      // 開始轉錄流程（合併上傳和轉錄為一個步驟）
      updateStep("transcribe", "active");
      setStatus("🔄 正在轉錄文字...");

      // **從這裡開始計時**（用戶真正等待的時間）
      const transcriptionStartTime = Date.now();
      setStartTime(transcriptionStartTime);

      try {
        const result = await invoke<string>("transcribe_audio", { audioPath });

        // 直接計算最終耗時
        const finalTime = Math.floor((Date.now() - transcriptionStartTime) / 1000);
        setStartTime(null);

        updateStep("transcribe", "completed");
        updateStep("done", "completed");
        setTranscriptionResult(result);
        setStatus(`✓ 轉錄完成！已複製到剪貼簿 (耗時 ${formatTime(finalTime)})`);
        console.log("轉錄結果:", result);
      } catch (transcribeErr) {
        setError(`轉錄失敗: ${transcribeErr}`);
        setStatus("❌ 轉錄失敗（錄音已保存）");
        // 轉錄失敗時也要停止計時器
        setStartTime(null);
      }
    } catch (err) {
      setError(`無法停止錄音: ${err}`);
      setStatus("❌ 停止錄音失敗");
      setStartTime(null);
    }
  };

  // 格式化時間顯示
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} 秒`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} 分 ${secs} 秒`;
  };

  const toggleRecording = async () => {
    if (recordingStatus.is_recording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const saveConfig = async () => {
    try {
      const newConfig = { ...config, chatgpt_token: tempToken };
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>GPTService</h1>
        <button
          className="settings-btn"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        >
          <SettingsIcon />
          <span>設定</span>
        </button>
      </header>

      <main className="app-main">
        {/* 錄音控制區 */}
        <section className="control-section">
          <div className="status-indicator">
            <span className={`status-dot ${recordingStatus.is_recording ? "recording" : ""}`} />
            <span className="status-text">
              {recordingStatus.is_recording ? "錄音中" : "就緒"}
            </span>
          </div>

          <div className="device-selector">
            <label htmlFor="device-select">錄音設備：</label>
            <select
              id="device-select"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              disabled={recordingStatus.is_recording}
            >
              {devices.map((device) => (
                <option key={device.name} value={device.name}>
                  {device.name} {device.is_default ? "(預設)" : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            className={`record-btn ${recordingStatus.is_recording ? "recording" : ""}`}
            onClick={toggleRecording}
          >
            {recordingStatus.is_recording ? (
              <>
                <StopIcon />
                停止錄音
              </>
            ) : (
              <>
                <MicIcon />
                開始錄音
              </>
            )}
          </button>

          <p className="hotkey-hint">
            <LightbulbIcon />
            快捷鍵：{config.hotkey}
          </p>
        </section>

        {/* 狀態訊息 */}
        {status && (
          <section className="status-section">
            <p className="status-message">{status}</p>
          </section>
        )}

        {/* 流程步驟 */}
        {(recordingStatus.is_recording || status.includes("錄音") || status.includes("轉錄")) && (
          <section className="status-steps">
            {/* 經過時間顯示 */}
            {startTime && (
              <div className="elapsed-time">
                <ClockIcon />
                已用時: {formatTime(elapsed)}
              </div>
            )}
            {steps.map((step) => (
              <div key={step.id} className={`status-step ${step.status}`}>
                <span className="status-step-icon">
                  {step.status === "completed" ? <CheckIcon /> : step.status === "active" ? "⟳" : "○"}
                </span>
                <span>{step.label}</span>
              </div>
            ))}
          </section>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <section className="error-section">
            <p className="error-message">{error}</p>
            <button onClick={() => setError("")}>
              <CloseIcon />
            </button>
          </section>
        )}

        {/* 轉錄結果 */}
        {transcriptionResult && (
          <section className="transcription-section">
            <div className="transcription-header">
              <h3><DocumentIcon /> 轉錄結果</h3>
              <button
                className="copy-result-btn"
                onClick={() => {
                  navigator.clipboard.writeText(transcriptionResult);
                  setStatus("已複製到剪貼簿");
                }}
              >
                <CopyIcon />
                複製
              </button>
            </div>
            <div className="transcription-content">
              {transcriptionResult}
            </div>
          </section>
        )}

        {/* 設定 Modal */}
        <Modal
          isOpen={isSettingsOpen}
          onClose={() => {
            setIsSettingsOpen(false);
            setTempToken(config.chatgpt_token);
          }}
          title="設定"
        >
          <div className="modal-form-group">
            <label htmlFor="token-input">ChatGPT Token：</label>
            <input
              id="token-input"
              type="password"
              value={tempToken}
              onChange={(e) => setTempToken(e.target.value)}
              placeholder="輸入您的 ChatGPT Token"
            />
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

          <div className="modal-actions">
            <button className="modal-save-btn" onClick={saveConfig}>
              儲存設定
            </button>
          </div>

          <div className="modal-cleanup-section">
            <h3>維護</h3>
            <button className="modal-cleanup-btn" onClick={cleanupOldRecordings}>
              <TrashIcon />
              清理 7 天前的錄音
            </button>
          </div>
        </Modal>
      </main>

      <footer className="app-footer">
        <p>GPTService v0.1.0</p>
      </footer>
    </div>
  );
}

export default App;

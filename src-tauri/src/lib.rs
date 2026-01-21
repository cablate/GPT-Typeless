// GPTService Tauri - Main Library

mod audio;
mod api;
mod hotkey;

use serde::{Deserialize, Serialize};
use serde_json;
use std::sync::Mutex;
use std::path::PathBuf;
use tauri::{State, Emitter, Manager};
use audio::{AudioManager, AudioDevice};
use api::{TranscribeClient};
use hotkey::{HotkeyManager, AppHotkey};

// 配置文件路徑
fn get_config_path() -> PathBuf {
    let mut path = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    path.push("gptservice-config.json");
    path
}

// 應用狀態
pub struct AppState {
    pub audio_manager: Mutex<AudioManager>,
    // HotkeyManager 不是 Send，需要用 Arc 包裝
    // 注意：實際的熱鍵處理需要在單獨的線程中運行
}

// 錄音狀態
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordingStatus {
    pub is_recording: bool,
    pub recording_id: Option<String>,
}

// 配置結構
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub chatgpt_token: String,
    pub hotkey: String,
    pub recording_format: String,
    pub audio_device: Option<String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            chatgpt_token: String::new(),
            hotkey: "Ctrl+Shift+R".to_string(),
            recording_format: "wav".to_string(),
            audio_device: None,
        }
    }
}

// 健康狀態結構
#[derive(Debug, Serialize, Deserialize)]
pub struct HealthStatus {
    pub status: String,
    pub version: String,
    pub can_record: bool,
}

// 獲取配置（內部函數）
fn get_config() -> Result<AppConfig, String> {
    let config_path = get_config_path();

    // 如果配置文件不存在，返回默認配置
    if !config_path.exists() {
        return Ok(AppConfig::default());
    }

    // 讀取配置文件
    let content = std::fs::read_to_string(&config_path)
        .map_err(|e| format!("無法讀取配置文件: {}", e))?;

    // 解析 JSON
    serde_json::from_str(&content)
        .map_err(|e| format!("配置文件格式錯誤: {}", e))
}

// 保存配置（內部函數）
fn save_config(config: &AppConfig) -> Result<(), String> {
    let config_path = get_config_path();

    // 序列化為 JSON
    let content = serde_json::to_string_pretty(config)
        .map_err(|e| format!("配置序列化失敗: {}", e))?;

    // 寫入文件
    std::fs::write(&config_path, content)
        .map_err(|e| format!("無法寫入配置文件: {}", e))
}

// Commands module
mod commands {
    use super::*;

    #[tauri::command]
    pub fn start_recording(
        device_name: Option<String>,
        state: State<'_, AppState>,
    ) -> Result<String, String> {
        let manager = state.audio_manager.lock()
            .map_err(|e| format!("無法存取 AudioManager: {}", e))?;

        manager.start_recording(device_name)
    }

    #[tauri::command]
    pub fn stop_recording(state: State<'_, AppState>) -> Result<String, String> {
        let manager = state.audio_manager.lock()
            .map_err(|e| format!("無法存取 AudioManager: {}", e))?;

        let file_path = manager.stop_recording()?;
        // 返回完整的檔案路徑字符串，供前端使用
        Ok(file_path.to_string_lossy().to_string())
    }

    #[tauri::command]
    pub fn get_recording_status(state: State<'_, AppState>) -> Result<RecordingStatus, String> {
        let manager = state.audio_manager.lock()
            .map_err(|e| format!("無法存取 AudioManager: {}", e))?;

        let recording_id = manager.get_recording_status()?;

        Ok(RecordingStatus {
            is_recording: recording_id.is_some(),
            recording_id,
        })
    }

    #[tauri::command]
    pub fn list_audio_devices(state: State<'_, AppState>) -> Result<Vec<AudioDevice>, String> {
        let manager = state.audio_manager.lock()
            .map_err(|e| format!("無法存取 AudioManager: {}", e))?;

        manager.list_devices()
    }

    #[tauri::command]
    pub async fn transcribe_audio(
        audio_path: String,
        _state: State<'_, AppState>,
    ) -> Result<String, String> {
        // 使用 spawn_blocking 在背景執行阻塞的 API 請求
        let result = tokio::task::spawn_blocking(move || {
            // 讀取配置
            let config = super::get_config()?;
            if config.chatgpt_token.is_empty() {
                return Err("ChatGPT Token 未設定".to_string());
            }

            // 建立 API 客戶端
            let client = TranscribeClient::from_config_and_token(config.chatgpt_token)
                .map_err(|e| format!("無法建立 API 客戶端: {}", e))?;

            // 執行轉錄
            let result = client.transcribe(std::path::Path::new(&audio_path))?;

            // 自動複製到剪貼簿
            let mut clipboard = arboard::Clipboard::new()
                .map_err(|e| format!("無法初始化剪貼簿: {}", e))?;

            clipboard.set_text(&result.text)
                .map_err(|e| format!("無法複製到剪貼簿: {}", e))?;

            Ok::<String, String>(result.text)
        })
        .await
        .map_err(|e| format!("任務執行失敗: {}", e))??;

        Ok(result)
    }

    #[tauri::command]
    pub fn copy_to_clipboard(text: String) -> Result<(), String> {
        use arboard::Clipboard;

        let mut clipboard = Clipboard::new()
            .map_err(|e| format!("無法初始化剪貼簿: {}", e))?;

        clipboard.set_text(&text)
            .map_err(|e| format!("無法複製到剪貼簿: {}", e))?;

        Ok(())
    }

    #[tauri::command]
    pub fn get_config_command() -> Result<AppConfig, String> {
        super::get_config()
    }

    #[tauri::command]
    pub fn set_config(config: AppConfig) -> Result<(), String> {
        super::save_config(&config)
    }

    #[tauri::command]
    pub fn cleanup_old_recordings(
        days: Option<u64>,
        state: State<'_, AppState>,
    ) -> Result<String, String> {
        let manager = state.audio_manager.lock()
            .map_err(|e| format!("無法存取 AudioManager: {}", e))?;

        let days = days.unwrap_or(7);
        let count = manager.cleanup_old_recordings(days)?;

        Ok(format!("已清理 {} 個舊錄音檔案", count))
    }

    #[tauri::command]
    pub fn health_check(state: State<'_, AppState>) -> Result<HealthStatus, String> {
        let can_record = state.audio_manager.lock()
            .map(|m| m.list_devices().is_ok())
            .unwrap_or(false);

        Ok(HealthStatus {
            status: "healthy".to_string(),
            version: "0.1.0".to_string(),
            can_record,
        })
    }

    #[tauri::command]
    pub fn greet(name: &str) -> String {
        format!("Hello, {}! You've been greeted from Rust!", name)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 初始化 AudioManager
    let audio_manager = AudioManager::new()
        .expect("無法建立 AudioManager");

    // 初始化熱鍵管理器
    let mut hotkey_manager = hotkey::HotkeyManager::new()
        .expect("無法建立熱鍵管理器");

    // 從配置讀取熱鍵
    let config = get_config().unwrap_or_default();
    let hotkey_str = &config.hotkey;

    // 註冊切換錄音的熱鍵
    let app_hotkey = hotkey::AppHotkey::from_string("recording_toggle".to_string(), hotkey_str)
        .unwrap_or_default();

    // 獲取熱鍵事件接收器
    let hotkey_receiver = hotkey::get_hotkey_event_receiver();

    // 嘗試註冊熱鍵，如果失敗則顯示警告但不中斷啟動
    if let Err(e) = hotkey_manager.register_hotkey(app_hotkey, std::sync::Arc::new(std::sync::Mutex::new(Box::new(|| {
        // 熱鍵觸發時的回調
        println!("熱鍵觸發！");
    })))) {
        eprintln!("⚠️  無法註冊熱鍵: {}，應用程式將繼續運行但熱鍵功能不可用", e);
        eprintln!("💡 提示：可能另一個 GPTService 實例正在運行，請先關閉它");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {
            // 在 setup 中設置熱鍵事件監聽
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                loop {
                    match hotkey_receiver.recv() {
                        Ok(event) => {
                            println!("收到熱鍵事件: {:?}", event);
                            // 發送 Tauri 事件到前端，觸發錄音切換
                            let _ = handle.emit("hotkey-triggered", "recording_toggle");
                        }
                        Err(_) => {
                            eprintln!("熱鍵接收器錯誤");
                            break;
                        }
                    }
                }
            });

            // 設置系統托盤（使用 tray-icon crate）
            #[cfg(target_os = "windows")]
            {
                use tray_icon::{TrayIconBuilder, menu::Menu, menu::MenuItem};

                let path = std::path::PathBuf::from("src-tauri/icons/icon.ico");

                let _ = TrayIconBuilder::new()
                    .with_tooltip("GPTService - 按熱鍵開始錄音")
                    .build()
                    .map_err(|e| format!("無法創建托盤圖示: {}", e));

                // TODO: 添加托盤選單（需要在 Phase 6 前端完成後實作）
            }

            Ok(())
        })
        .manage(AppState {
            audio_manager: Mutex::new(audio_manager),
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::start_recording,
            commands::stop_recording,
            commands::get_recording_status,
            commands::list_audio_devices,
            commands::transcribe_audio,
            commands::copy_to_clipboard,
            commands::get_config_command,
            commands::set_config,
            commands::cleanup_old_recordings,
            commands::health_check,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

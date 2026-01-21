// GPTService Tauri - Audio Recording Module

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{Device, Host, SampleFormat, SupportedStreamConfig};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

// 錄音設備資訊
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDevice {
    pub name: String,
    pub is_default: bool,
}

// 錄音會話
pub struct RecordingSession {
    pub id: String,
    pub file_path: PathBuf,
    pub spec: SupportedStreamConfig,
    _stream: cpal::Stream,
}

// 錄音管理器（不存儲 Host，因為 Host 不是 Send）
pub struct AudioManager {
    pub current_session: Arc<Mutex<Option<RecordingSession>>>,
    pub temp_dir: PathBuf,
}

// 安全實現 Send
unsafe impl Send for AudioManager {}

impl AudioManager {
    /// 創建新的錄音管理器
    pub fn new() -> Result<Self, String> {
        // 建立暫存目錄
        let temp_dir = std::env::temp_dir();
        let app_temp = temp_dir.join("gptservice");
        std::fs::create_dir_all(&app_temp)
            .map_err(|e| format!("無法建立暫存目錄: {}", e))?;

        Ok(Self {
            current_session: Arc::new(Mutex::new(None)),
            temp_dir: app_temp,
        })
    }

    /// 取得 Host
    fn get_host(&self) -> Host {
        cpal::default_host()
    }

    /// 列舉所有可用的錄音設備
    pub fn list_devices(&self) -> Result<Vec<AudioDevice>, String> {
        let mut devices = Vec::new();

        let host = self.get_host();
        let input_devices = host.input_devices()
            .map_err(|e| format!("無法取得輸入設備: {}", e))?;

        // 嘗試取得預設設備
        let default_device: Option<String> = host.default_input_device()
            .and_then(|d| d.name().ok());

        for device in input_devices {
            let name = device.name()
                .unwrap_or_else(|_| "Unknown Device".to_string());

            let is_default = default_device.as_ref() == Some(&name);

            devices.push(AudioDevice {
                name,
                is_default,
            });
        }

        Ok(devices)
    }

    /// 取得預設輸入設備
    pub fn get_default_device(&self) -> Result<Device, String> {
        let host = self.get_host();
        host.default_input_device()
            .ok_or_else(|| "沒有可用的錄音設備".to_string())
    }

    /// 根據名稱取得設備
    pub fn get_device_by_name(&self, name: &str) -> Result<Device, String> {
        let host = self.get_host();
        let devices = host.input_devices()
            .map_err(|e| format!("無法取得輸入設備: {}", e))?;

        for device in devices {
            if let Ok(device_name) = device.name() {
                if device_name == name {
                    return Ok(device);
                }
            }
        }

        Err(format!("找不到設備: {}", name))
    }

    /// 開始錄音
    pub fn start_recording(&self, device_name: Option<String>) -> Result<String, String> {
        // 檢查是否已有錄音會話
        let mut session = self.current_session.lock()
            .map_err(|e| format!("無法存取會話: {}", e))?;

        if session.is_some() {
            return Err("已有錄音會話進行中".to_string());
        }

        // 取得設備
        let device = if let Some(name) = device_name {
            self.get_device_by_name(&name)?
        } else {
            self.get_default_device()?
        };

        // 取得設備配置
        let config = device.default_input_config()
            .map_err(|e| format!("無法取得設備配置: {}", e))?;

        // 生成錄音 ID 和檔案路徑
        let recording_id = format!("rec_{}", chrono::Utc::now().timestamp_millis());
        let file_path = self.temp_dir.join(format!("{}.wav", recording_id));

        // 建立錄音串流
        let stream = match config.sample_format() {
            SampleFormat::I16 => self.create_stream_i16(&device, &config, &file_path)?,
            SampleFormat::U16 => self.create_stream_u16(&device, &config, &file_path)?,
            SampleFormat::F32 => self.create_stream_f32(&device, &config, &file_path)?,
            _ => return Err("不支援的取樣格式".to_string()),
        };

        // 保存會話
        *session = Some(RecordingSession {
            id: recording_id.clone(),
            file_path,
            spec: config,
            _stream: stream,
        });

        Ok(recording_id)
    }

    /// 建立錄音串流（內部函數）
    fn create_stream_i16(
        &self,
        device: &Device,
        config: &SupportedStreamConfig,
        file_path: &PathBuf,
    ) -> Result<cpal::Stream, String> {
        let err_fn = |err| eprintln!("錄音錯誤: {}", err);

        let spec = hound::WavSpec {
            channels: config.channels() as _,
            sample_rate: config.sample_rate().0,
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };

        let writer = Arc::new(Mutex::new(
            hound::WavWriter::create(file_path, spec)
                .map_err(|e| format!("無法建立 WAV 檔案: {}", e))?
        ));

        let stream_config: cpal::StreamConfig = config.clone().into();
        let stream = device.build_input_stream(
            &stream_config,
            {
                let writer = Arc::clone(&writer);
                move |data: &[i16], _: &cpal::InputCallbackInfo| {
                    if let Ok(mut w) = writer.lock() {
                        for &sample in data {
                            w.write_sample(sample).ok();
                        }
                    }
                }
            },
            err_fn,
            None,
        ).map_err(|e| format!("無法建立錄音串流: {}", e))?;

        stream.play()
            .map_err(|e| format!("無法啟動錄音串流: {}", e))?;

        Ok(stream)
    }

    fn create_stream_u16(
        &self,
        device: &Device,
        config: &SupportedStreamConfig,
        file_path: &PathBuf,
    ) -> Result<cpal::Stream, String> {
        let err_fn = |err| eprintln!("錄音錯誤: {}", err);

        let spec = hound::WavSpec {
            channels: config.channels() as _,
            sample_rate: config.sample_rate().0,
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };

        let writer = Arc::new(Mutex::new(
            hound::WavWriter::create(file_path, spec)
                .map_err(|e| format!("無法建立 WAV 檔案: {}", e))?
        ));

        let stream_config: cpal::StreamConfig = config.clone().into();
        let stream = device.build_input_stream(
            &stream_config,
            {
                let writer = Arc::clone(&writer);
                move |data: &[u16], _: &cpal::InputCallbackInfo| {
                    if let Ok(mut w) = writer.lock() {
                        for &sample in data {
                            // u16 轉 i16
                            w.write_sample(sample as i16).ok();
                        }
                    }
                }
            },
            err_fn,
            None,
        ).map_err(|e| format!("無法建立錄音串流: {}", e))?;

        stream.play()
            .map_err(|e| format!("無法啟動錄音串流: {}", e))?;

        Ok(stream)
    }

    fn create_stream_f32(
        &self,
        device: &Device,
        config: &SupportedStreamConfig,
        file_path: &PathBuf,
    ) -> Result<cpal::Stream, String> {
        let err_fn = |err| eprintln!("錄音錯誤: {}", err);

        let spec = hound::WavSpec {
            channels: config.channels() as _,
            sample_rate: config.sample_rate().0,
            bits_per_sample: 32,
            sample_format: hound::SampleFormat::Float,
        };

        let writer = Arc::new(Mutex::new(
            hound::WavWriter::create(file_path, spec)
                .map_err(|e| format!("無法建立 WAV 檔案: {}", e))?
        ));

        let stream_config: cpal::StreamConfig = config.clone().into();
        let stream = device.build_input_stream(
            &stream_config,
            {
                let writer = Arc::clone(&writer);
                move |data: &[f32], _: &cpal::InputCallbackInfo| {
                    if let Ok(mut w) = writer.lock() {
                        for &sample in data {
                            w.write_sample(sample).ok();
                        }
                    }
                }
            },
            err_fn,
            None,
        ).map_err(|e| format!("無法建立錄音串流: {}", e))?;

        stream.play()
            .map_err(|e| format!("無法啟動錄音串流: {}", e))?;

        Ok(stream)
    }

    /// 停止錄音
    pub fn stop_recording(&self) -> Result<PathBuf, String> {
        let mut session = self.current_session.lock()
            .map_err(|e| format!("無法存取會話: {}", e))?;

        let recording = session.take()
            .ok_or_else(|| "沒有進行中的錄音會話".to_string())?;

        // 丟棄串流（會自動停止）
        drop(recording._stream);

        Ok(recording.file_path)
    }

    /// 取得當前錄音狀態
    pub fn get_recording_status(&self) -> Result<Option<String>, String> {
        let session = self.current_session.lock()
            .map_err(|e| format!("無法存取會話: {}", e))?;

        Ok(session.as_ref().map(|s| s.id.clone()))
    }

    /// 清理舊的錄音檔案（超過指定天數）
    pub fn cleanup_old_recordings(&self, days: u64) -> Result<usize, String> {
        let now = chrono::Utc::now().timestamp();
        let cutoff = now - (days as i64 * 24 * 60 * 60);

        let mut cleaned_count = 0;

        for entry in std::fs::read_dir(&self.temp_dir)
            .map_err(|e| format!("無法讀取暫存目錄: {}", e))?
        {
            let entry = entry.map_err(|e| format!("無法讀取檔案項目: {}", e))?;
            let path = entry.path();

            if path.extension().and_then(|s| s.to_str()) == Some("wav") {
                if let Ok(metadata) = entry.metadata() {
                    if let Ok(modified) = metadata.modified() {
                        let modified_time = modified.duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or_default().as_secs() as i64;

                        if modified_time < cutoff {
                            std::fs::remove_file(&path)
                                .map_err(|e| format!("無法刪除舊檔案: {}", e))?;
                            cleaned_count += 1;
                        }
                    }
                }
            }
        }

        Ok(cleaned_count)
    }

    /// 清理所有暫存檔案
    pub fn cleanup_all(&self) -> Result<(), String> {
        for entry in std::fs::read_dir(&self.temp_dir)
            .map_err(|e| format!("無法讀取暫存目錄: {}", e))?
        {
            let entry = entry.map_err(|e| format!("無法讀取檔案項目: {}", e))?;
            let path = entry.path();

            if path.extension().and_then(|s| s.to_str()) == Some("wav") {
                std::fs::remove_file(&path)
                    .map_err(|e| format!("無法刪除檔案: {}", e))?;
            }
        }

        Ok(())
    }
}

impl Default for AudioManager {
    fn default() -> Self {
        Self::new().expect("無法建立 AudioManager")
    }
}

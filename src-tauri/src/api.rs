// GPTService Tauri - ChatGPT Transcribe API Module

use reqwest::blocking::multipart;
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::time::Duration;

// ChatGPT Transcribe API 配置
#[derive(Debug, Clone)]
pub struct TranscribeConfig {
    pub api_url: String,
    pub api_token: String,
    pub client_build_number: String,
    pub client_version: String,
    pub device_id: String,
    pub max_retries: u32,
    pub retry_delay: Duration,
}

impl Default for TranscribeConfig {
    fn default() -> Self {
        Self {
            api_url: "https://chatgpt.com/backend-api/transcribe".to_string(),
            api_token: String::new(),
            client_build_number: String::new(),
            client_version: String::new(),
            device_id: String::new(),
            max_retries: 3,
            retry_delay: Duration::from_secs(2),
        }
    }
}

// 轉錄結果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranscribeResult {
    pub text: String,
    pub language: Option<String>,
    pub duration: Option<f64>,
    pub asset_pointer: Option<String>,
    pub asset_ttl: Option<String>,
    pub asset_format: Option<String>,
}

// ChatGPT API 響應格式
#[derive(Debug, Clone, Serialize, Deserialize)]
struct ChatGPTTranscribeResponse {
    text: String,
    #[serde(rename = "asset_pointer")]
    asset_pointer: Option<String>,
    #[serde(rename = "asset_ttl")]
    asset_ttl: Option<String>,
    #[serde(rename = "asset_format")]
    asset_format: Option<String>,
}

// API 客戶端
pub struct TranscribeClient {
    config: TranscribeConfig,
    client: reqwest::blocking::Client,
}

impl TranscribeClient {
    /// 創建新的 API 客戶端
    pub fn new(config: TranscribeConfig) -> Result<Self, String> {
        let client = reqwest::blocking::Client::builder()
            .timeout(Duration::from_secs(60))
            .build()
            .map_err(|e| format!("無法建立 HTTP 客戶端: {}", e))?;

        Ok(Self { config, client })
    }

    /// 從 4 個關鍵欄位創建
    pub fn from_fields(
        token: String,
        build_number: String,
        client_version: String,
        device_id: String,
    ) -> Result<Self, String> {
        let mut config = TranscribeConfig::default();
        config.api_token = token;
        config.client_build_number = build_number;
        config.client_version = client_version;
        config.device_id = device_id;

        Self::new(config)
    }

    /// 轉錄音訊檔案
    pub fn transcribe(&self, audio_path: &Path) -> Result<TranscribeResult, String> {
        if !audio_path.exists() {
            return Err(format!("檔案不存在: {}", audio_path.display()));
        }

        let mut last_error = String::new();

        for attempt in 0..self.config.max_retries {
            // 最後一次嘗試前等待
            if attempt > 0 {
                std::thread::sleep(self.config.retry_delay);
            }

            match self.transcribe_once(audio_path) {
                Ok(result) => return Ok(result),
                Err(e) => {
                    last_error = e.clone();
                    eprintln!("轉錄失敗 (嘗試 {}/{}): {}", attempt + 1, self.config.max_retries, e);
                }
            }
        }

        Err(format!("轉錄失敗（已重試 {} 次）: {}", self.config.max_retries, last_error))
    }

    /// 單次轉錄嘗試
    fn transcribe_once(&self, audio_path: &Path) -> Result<TranscribeResult, String> {
        // 讀取檔案
        let file_name = audio_path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("audio.wav");

        let audio_data = std::fs::read(audio_path)
            .map_err(|e| format!("無法讀取音訊檔案: {}", e))?;

        // 建立 multipart form
        let part = multipart::Part::bytes(audio_data)
            .file_name(file_name.to_string());

        let form = multipart::Form::new()
            .part("file", part);

        // 建立請求
        let mut request = self.client.post(&self.config.api_url);

        // 建置標準 headers
        request = request
            .header("accept", "*/*")
            .header("accept-language", "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6")
            .header("authorization", format!("Bearer {}", self.config.api_token))
            .header("cache-control", "no-cache")
            .header("origin", "https://chatgpt.com")
            .header("pragma", "no-cache")
            .header("referer", "https://chatgpt.com/")
            .header("sec-ch-ua", "\"Google Chrome\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"")
            .header("sec-ch-ua-arch", "\"x86\"")
            .header("sec-ch-ua-bitness", "\"64\"")
            .header("sec-ch-ua-mobile", "?0")
            .header("sec-ch-ua-model", "\"\"")
            .header("sec-ch-ua-platform", "\"Windows\"")
            .header("sec-fetch-dest", "empty")
            .header("sec-fetch-mode", "cors")
            .header("sec-fetch-site", "same-origin")
            .header("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36");

        // 添加選用的 OpenAI 特定 headers（如果已設定）
        if !self.config.client_build_number.is_empty() {
            request = request.header("oai-client-build-number", &self.config.client_build_number);
        }
        if !self.config.client_version.is_empty() {
            request = request.header("oai-client-version", &self.config.client_version);
        }
        if !self.config.device_id.is_empty() {
            request = request.header("oai-device-id", &self.config.device_id);
            request = request.header("oai-language", "zh-TW");
        }

        let response = request
            .multipart(form)
            .send()
            .map_err(|e| format!("API 請求失敗: {}", e))?;

        // 檢查回應狀態
        let status = response.status();
        if !status.is_success() {
            let error_text = response.text()
                .unwrap_or_else(|_| "無法讀取錯誤訊息".to_string());

            return Err(format!("API 回應錯誤 ({}): {}", status.as_u16(), error_text));
        }

        // 解析回應
        let response_text = response.text()
            .map_err(|e| format!("無法讀取回應: {}", e))?;

        // 解析 JSON 響應
        let api_response: ChatGPTTranscribeResponse = serde_json::from_str(&response_text)
            .map_err(|e| format!("JSON 解析失敗: {} (回應: {})", e, response_text))?;

        // 直接返回 text（API 應根據 oai-language header 返回對應字體）
        Ok(TranscribeResult {
            text: api_response.text,
            language: Some("zh-TW".to_string()),
            duration: None,
            asset_pointer: api_response.asset_pointer,
            asset_ttl: api_response.asset_ttl,
            asset_format: api_response.asset_format,
        })
    }
}

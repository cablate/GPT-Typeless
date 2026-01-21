// GPTService Tauri - Global Hotkey Module

use global_hotkey::{GlobalHotKeyManager, hotkey::{HotKey, Modifiers, Code}, GlobalHotKeyEvent, GlobalHotKeyEventReceiver};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

// 熱鍵定義
#[derive(Debug, Clone, Serialize, Deserialize, Hash, Eq, PartialEq)]
pub struct AppHotkey {
    pub id: String,
    pub modifiers: Vec<String>,  // e.g., ["ctrl", "shift"]
    pub key: String,              // e.g., "r"
}

impl AppHotkey {
    /// 解析字串格式的熱鍵 (e.g., "Ctrl+Shift+R")
    pub fn from_string(id: String, hotkey_str: &str) -> Result<Self, String> {
        let parts: Vec<&str> = hotkey_str.split('+').collect();
        if parts.is_empty() {
            return Err("熱鍵格式無效".to_string());
        }

        // 最後一個部分是按鍵
        let key = parts.last()
            .unwrap()
            .trim()
            .to_lowercase();

        // 前面的部分是修飾鍵
        let mut modifiers = Vec::new();
        for part in parts.iter().take(parts.len() - 1) {
            let modifier = part.trim().to_lowercase();
            match modifier.as_str() {
                "ctrl" | "control" => modifiers.push("ctrl".to_string()),
                "shift" => modifiers.push("shift".to_string()),
                "alt" => modifiers.push("alt".to_string()),
                "win" | "meta" | "cmd" => modifiers.push("win".to_string()),
                _ => return Err(format!("無效的修飾鍵: {}", modifier)),
            }
        }

        Ok(Self { id, modifiers, key })
    }

    /// 轉換為 HotKey
    pub fn to_hotkey(&self) -> Result<HotKey, String> {
        let mut modifiers = Modifiers::empty();

        // 解析修飾鍵
        for modifier in &self.modifiers {
            match modifier.as_str() {
                "ctrl" => modifiers |= Modifiers::CONTROL,
                "shift" => modifiers |= Modifiers::SHIFT,
                "alt" => modifiers |= Modifiers::ALT,
                "win" | "meta" | "cmd" => modifiers |= Modifiers::SUPER,
                _ => return Err(format!("未知的修飾鍵: {}", modifier)),
            }
        }

        // 解析主按鍵
        let code = match self.key.as_str() {
            "a" | "A" => Code::KeyA,
            "b" | "B" => Code::KeyB,
            "c" | "C" => Code::KeyC,
            "d" | "D" => Code::KeyD,
            "e" | "E" => Code::KeyE,
            "f" | "F" => Code::KeyF,
            "g" | "G" => Code::KeyG,
            "h" | "H" => Code::KeyH,
            "i" | "I" => Code::KeyI,
            "j" | "J" => Code::KeyJ,
            "k" | "K" => Code::KeyK,
            "l" | "L" => Code::KeyL,
            "m" | "M" => Code::KeyM,
            "n" | "N" => Code::KeyN,
            "o" | "O" => Code::KeyO,
            "p" | "P" => Code::KeyP,
            "q" | "Q" => Code::KeyQ,
            "r" | "R" => Code::KeyR,
            "s" | "S" => Code::KeyS,
            "t" | "T" => Code::KeyT,
            "u" | "U" => Code::KeyU,
            "v" | "V" => Code::KeyV,
            "w" | "W" => Code::KeyW,
            "x" | "X" => Code::KeyX,
            "y" | "Y" => Code::KeyY,
            "z" | "Z" => Code::KeyZ,
            "0" => Code::Digit0,
            "1" => Code::Digit1,
            "2" => Code::Digit2,
            "3" => Code::Digit3,
            "4" => Code::Digit4,
            "5" => Code::Digit5,
            "6" => Code::Digit6,
            "7" => Code::Digit7,
            "8" => Code::Digit8,
            "9" => Code::Digit9,
            "space" => Code::Space,
            "enter" | "return" => Code::Enter,
            "tab" => Code::Tab,
            "escape" | "esc" => Code::Escape,
            "f1" => Code::F1,
            "f2" => Code::F2,
            "f3" => Code::F3,
            "f4" => Code::F4,
            "f5" => Code::F5,
            "f6" => Code::F6,
            "f7" => Code::F7,
            "f8" => Code::F8,
            "f9" => Code::F9,
            "f10" => Code::F10,
            "f11" => Code::F11,
            "f12" => Code::F12,
            _ => return Err(format!("不支援的按鍵: {}", self.key)),
        };

        Ok(HotKey::new(if modifiers.is_empty() { None } else { Some(modifiers) }, code))
    }

    /// 轉換為字串格式 (for display)
    pub fn to_string(&self) -> String {
        let mut parts = self.modifiers.clone();
        parts.push(self.key.clone());
        parts.iter()
            .map(|s| {
                let mut chars = s.chars();
                match chars.next() {
                    None => String::new(),
                    Some(c) => c.to_uppercase().collect::<String>() + chars.as_str(),
                }
            })
            .collect::<Vec<_>>()
            .join("+")
    }
}

impl Default for AppHotkey {
    fn default() -> Self {
        Self {
            id: "recording_toggle".to_string(),
            modifiers: vec!["ctrl".to_string(), "shift".to_string()],
            key: "r".to_string(),
        }
    }
}

// 熱鍵回調類型 (使用 Arc + Mutex 確保線程安全)
pub type HotkeyCallback = Arc<Mutex<Box<dyn Fn() + Send>>>;

// 熱鍵管理器
pub struct HotkeyManager {
    manager: GlobalHotKeyManager,
    hotkeys: Arc<Mutex<HashMap<String, AppHotkey>>>,
    callbacks: Arc<Mutex<HashMap<HotKey, String>>>,  // HotKey -> ID mapping
}

impl HotkeyManager {
    /// 建立新的熱鍵管理器
    pub fn new() -> Result<Self, String> {
        let manager = GlobalHotKeyManager::new()
            .map_err(|e| format!("無法建立熱鍵管理器: {}", e))?;

        Ok(Self {
            manager,
            hotkeys: Arc::new(Mutex::new(HashMap::new())),
            callbacks: Arc::new(Mutex::new(HashMap::new())),
        })
    }

    /// 註冊熱鍵
    pub fn register_hotkey(&mut self, hotkey: AppHotkey, _callback: HotkeyCallback) -> Result<HotKey, String> {
        let hk = hotkey.to_hotkey()?;
        let id = hotkey.id.clone();

        // 保存熱鍵定義
        self.hotkeys.lock()
            .map_err(|e| format!("無法存取熱鍵列表: {}", e))?
            .insert(id.clone(), hotkey);

        // 保存 HotKey -> ID 映射
        self.callbacks.lock()
            .map_err(|e| format!("無法存取回調列表: {}", e))?
            .insert(hk, id);

        // 註冊到系統
        self.manager.register(hk)
            .map_err(|e| format!("熱鍵註冊失敗: {}", e))?;

        Ok(hk)
    }

    /// 從字串註冊熱鍵
    pub fn register_from_string(
        &mut self,
        id: String,
        hotkey_str: &str,
        callback: HotkeyCallback,
    ) -> Result<HotKey, String> {
        let hotkey = AppHotkey::from_string(id.clone(), hotkey_str)?;
        self.register_hotkey(hotkey, callback)
    }

    /// 獲取熱鍵 ID
    pub fn get_hotkey_id(&self, hotkey: &HotKey) -> Option<String> {
        self.callbacks.lock().ok()?.get(hotkey).cloned()
    }

    /// 獲取所有已註冊的熱鍵
    pub fn list_hotkeys(&self) -> Result<Vec<AppHotkey>, String> {
        self.hotkeys.lock()
            .map(|map| map.values().cloned().collect())
            .map_err(|e| format!("無法讀取熱鍵列表: {}", e))
    }

    /// 檢查熱鍵是否已註冊
    pub fn is_registered(&self, id: &str) -> Result<bool, String> {
        self.hotkeys.lock()
            .map(|map| map.contains_key(id))
            .map_err(|e| format!("無法檢查熱鍵狀態: {}", e))
    }

    /// 獲取內部 manager 的引用
    pub fn inner_manager(&self) -> &GlobalHotKeyManager {
        &self.manager
    }
}

/// 全局熱鍵事件接收器
pub fn get_hotkey_event_receiver() -> GlobalHotKeyEventReceiver {
    GlobalHotKeyEvent::receiver().clone()
}

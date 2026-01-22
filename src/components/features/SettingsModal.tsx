/**
 * SettingsModal Component
 *
 * Settings dialog for configuration
 */

import React from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { TrashIcon } from '../Icons';

export interface SettingsModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Current chatgpt token value */
  chatgptToken: string;
  /** Token change handler */
  onTokenChange: (value: string) => void;
  /** Current hotkey value */
  hotkey: string;
  /** Hotkey change handler */
  onHotkeyChange: (value: string) => void;
  /** Save handler */
  onSave: () => void;
  /** Cleanup old recordings handler */
  onCleanup: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  chatgptToken,
  onTokenChange,
  hotkey,
  onHotkeyChange,
  onSave,
  onCleanup,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="設定" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* ChatGPT Token */}
        <Input
          id="token-input"
          label="ChatGPT Token"
          type="password"
          value={chatgptToken}
          onChange={(e) => onTokenChange(e.target.value)}
          placeholder="輸入您的 ChatGPT Token"
          fullWidth
          autoComplete="off"
        />

        {/* Hotkey */}
        <Input
          id="hotkey-input"
          label="快捷鍵"
          type="text"
          value={hotkey}
          onChange={(e) => onHotkeyChange(e.target.value)}
          placeholder="例如：Ctrl+Shift+R"
          fullWidth
        />

        {/* Save button */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" fullWidth>
            儲存設定
          </Button>
        </div>

        {/* Maintenance section */}
        <div className="border-t border-gray-200 pt-4 mt-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">維護</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={onCleanup}
            icon={<TrashIcon />}
            fullWidth
          >
            清理 7 天前的錄音
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * RecordingControl Component
 *
 * Recording control card with status indicator, device selector, and record button
 */

import React from 'react';
import { MicIcon, StopIcon, LightbulbIcon } from '../Icons';
import { Button } from '../ui/Button';
import { Select, SelectOption } from '../ui/Select';
import { StatusBadge } from '../ui/StatusBadge';

export interface RecordingControlProps {
  /** Whether currently recording */
  isRecording: boolean;
  /** Selected device name */
  selectedDevice: string;
  /** Available audio devices */
  devices: Array<{ name: string; is_default: boolean }>;
  /** Device change handler */
  onDeviceChange: (device: string) => void;
  /** Recording toggle handler */
  onToggleRecording: () => void;
  /** Hotkey string for display */
  hotkey?: string;
}

export const RecordingControl: React.FC<RecordingControlProps> = ({
  isRecording,
  selectedDevice,
  devices,
  onDeviceChange,
  onToggleRecording,
  hotkey = 'Ctrl+Shift+R',
}) => {
  const deviceOptions: SelectOption[] = devices.map((device) => ({
    value: device.name,
    label: device.name + (device.is_default ? ' (預設)' : ''),
  }));

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-5">
      {/* Status indicator */}
      <div className="flex items-center justify-between">
        <StatusBadge
          variant={isRecording ? 'danger' : 'success'}
          withDot
          animated={isRecording}
        >
          {isRecording ? '錄音中' : '就緒'}
        </StatusBadge>
      </div>

      {/* Device selector */}
      <Select
        label="錄音設備"
        options={deviceOptions}
        value={selectedDevice}
        onChange={(e) => onDeviceChange(e.target.value)}
        disabled={isRecording}
        fullWidth
        placeholder="選擇錄音設備"
      />

      {/* Record button */}
      <Button
        variant={isRecording ? 'danger' : 'primary'}
        size="lg"
        onClick={onToggleRecording}
        fullWidth
        icon={isRecording ? <StopIcon /> : <MicIcon />}
        aria-pressed={isRecording}
      >
        {isRecording ? '停止錄音' : '開始錄音'}
      </Button>

      {/* Hotkey hint */}
      {hotkey && (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md text-xs text-gray-500 font-mono">
          <LightbulbIcon />
          <span>快捷鍵：{hotkey}</span>
        </div>
      )}
    </div>
  );
};

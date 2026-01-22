/**
 * TimerDisplay Component
 *
 * Display elapsed time during transcription
 */

import React from 'react';
import { ClockIcon } from '../Icons';

export interface TimerDisplayProps {
  /** Elapsed seconds */
  seconds: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds }) => {
  const formatTime = (secs: number): string => {
    if (secs < 60) {
      return `${secs} 秒`;
    }
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins} 分 ${remainingSecs} 秒`;
  };

  return (
    <div className="flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-md text-sm font-medium">
      <ClockIcon />
      <span>已用時: {formatTime(seconds)}</span>
    </div>
  );
};

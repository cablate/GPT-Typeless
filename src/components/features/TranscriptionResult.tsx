/**
 * TranscriptionResult Component
 *
 * Display transcription result with copy button
 */

import React, { useState } from 'react';
import { DocumentIcon, CopyIcon, CheckIcon } from '../Icons';
import { Button } from '../ui/Button';

export interface TranscriptionResultProps {
  /** Transcription text to display */
  result: string;
  /** Copy success callback */
  onCopy?: () => void;
}

export const TranscriptionResult: React.FC<TranscriptionResultProps> = ({
  result,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      onCopy?.();

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <DocumentIcon />
          <h3 className="text-base font-semibold text-gray-900">轉錄結果</h3>
        </div>
        <Button
          variant={copied ? 'secondary' : 'primary'}
          size="sm"
          onClick={handleCopy}
          icon={copied ? <CheckIcon /> : <CopyIcon />}
        >
          {copied ? '已複製' : '複製'}
        </Button>
      </div>

      {/* Content */}
      <div className="p-3.5 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words max-h-[280px] overflow-y-auto custom-scrollbar">
        {result}
      </div>
    </div>
  );
};

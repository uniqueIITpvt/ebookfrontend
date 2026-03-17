'use client';
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface WaveformAudioPlayerProps {
  audioSrc: string;
  title?: string;
  description?: string;
  transcripts?: any;
  availableLanguages?: string[];
  initialLanguage?: string;
  syncConfig?: any;
  waveColor?: string;
  progressColor?: string;
  height?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onLanguageChange?: (language: string) => void;
  className?: string;
}

export default function WaveformAudioPlayer({
  audioSrc,
  title = 'Audio Player',
  description,
  className = '',
}: WaveformAudioPlayerProps) {
  return (
    <div className={`p-4 border rounded-lg bg-gray-50 ${className}`}>
      <div className="flex items-center gap-3 text-amber-600">
        <AlertCircle size={20} />
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-600">
            Waveform visualization is not available. WaveSurfer.js dependency not installed.
          </p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
      
      {/* Basic HTML5 audio fallback */}
      <audio 
        controls 
        className="w-full mt-3"
        src={audioSrc}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

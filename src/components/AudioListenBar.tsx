import { useState } from 'react';
import { Volume2, Turtle } from 'lucide-react';
import type { AudioSpeed } from '../types/learning';
import { speakEnglish } from '../utils/audio';

interface AudioControlProps {
  text: string;
  speed: AudioSpeed;
  onToggleSpeed?: () => void;
  size?: 'sm' | 'md' | 'lg';
  labelEn?: string;
  labelAr?: string;
  showSpeedToggle?: boolean;
}

export function AudioListenBar({
  text,
  speed,
  onToggleSpeed,
  size = 'md',
  labelEn = 'Listen',
  labelAr = 'استمع',
  showSpeedToggle = true,
}: AudioControlProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handlePlay = (overrideSpeed?: AudioSpeed) => {
    speakEnglish(
      text,
      overrideSpeed ?? speed,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const playPad =
    size === 'lg'
      ? 'px-5 py-3 text-base'
      : size === 'sm'
        ? 'px-3 py-1.5 text-xs'
        : 'px-4 py-2 text-sm';

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => handlePlay()}
        className={`inline-flex items-center gap-2 font-bold rounded-xl border border-sky-200 border-b-4 border-b-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${playPad} ${
          isSpeaking ? 'ring-2 ring-sky-500 bg-sky-100' : ''
        }`}
      >
        <Volume2 className={`w-4 h-4 shrink-0 ${isSpeaking ? 'text-sky-600' : ''}`} />
        <span>
          {labelEn} · <span className="font-arabic">{labelAr}</span>
        </span>
      </button>

      {showSpeedToggle && (
        <button
          type="button"
          onClick={() => {
            if (onToggleSpeed) {
              onToggleSpeed();
            } else {
              handlePlay('slow');
            }
          }}
          title={speed === 'slow' ? 'Switch to Normal speed (1.0x)' : 'Switch to Slow speed (0.6x)'}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
            speed === 'slow'
              ? 'bg-amber-50 text-amber-900 border-amber-300 border-b-4 border-b-amber-400'
              : 'bg-white text-slate-700 border-slate-200 border-b-4 border-b-slate-300 hover:bg-slate-50'
          }`}
        >
          <Turtle className="w-3.5 h-3.5 shrink-0" />
          <span className="font-mono-nums">
            {speed === 'slow' ? '0.6x Slow · بطيء' : '1.0x Normal · عادي'}
          </span>
        </button>
      )}
    </div>
  );
}

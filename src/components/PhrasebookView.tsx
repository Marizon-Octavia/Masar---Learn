import { useMemo, useState } from 'react';
import { Search, Volume2, Turtle } from 'lucide-react';
import type { PhraseItem, AudioSpeed } from '../types/learning';
import { speakEnglish } from '../utils/audio';

interface PhrasebookViewProps {
  phrases: PhraseItem[];
  audioSpeed: AudioSpeed;
  showPhonetics: boolean;
  onToggleSpeed: () => void;
  onTogglePhonetics: () => void;
}

export function PhrasebookView({
  phrases,
  audioSpeed,
  showPhonetics,
  onToggleSpeed,
  onTogglePhonetics,
}: PhrasebookViewProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [query, setQuery] = useState('');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return phrases.filter((item) => {
      if (selectedLevel !== 'all' && item.levelNumber !== selectedLevel) {
        return false;
      }
      if (!q) return true;
      return (
        item.en.toLowerCase().includes(q) ||
        item.ar.includes(q) ||
        item.categoryEn.toLowerCase().includes(q) ||
        item.categoryAr.includes(q)
      );
    });
  }, [phrases, selectedLevel, query]);

  const handlePlay = (item: PhraseItem) => {
    speakEnglish(
      item.en,
      audioSpeed,
      () => setSpeakingId(item.id),
      () => setSpeakingId((curr) => (curr === item.id ? null : curr))
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-12 space-y-6">
      {/* Header */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-sky-700">
            Tap-to-Listen Reference · <span className="font-arabic">مرجع النطق السريع</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Everyday Phrasebook · <span className="font-arabic font-bold">دفتر العبارات اليومية</span>
          </h1>
          <p className="text-sm text-slate-600 font-arabic" dir="rtl">
            اضغط على أي عبارة للاستماع إلى النطق الإنجليزي بالسرعة العادية أو البطيئة مع طريقة النطق التقريبية بالعربية.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSpeed}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border border-b-4 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              audioSpeed === 'slow'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Turtle className="w-4 h-4" />
            <span className="font-mono-nums">
              {audioSpeed === 'slow' ? '0.6x Slow · بطيء' : '1.0x Normal · عادي'}
            </span>
          </button>

          <button
            type="button"
            onClick={onTogglePhonetics}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl border border-b-4 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              showPhonetics
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Phonetics: {showPhonetics ? 'ON' : 'OFF'} ·{' '}
            <span className="font-arabic">النطق العربي</span>
          </button>
        </div>
      </section>

      {/* Search & Level Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedLevel('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedLevel === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All · <span className="font-arabic">الكل</span>
          </button>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setSelectedLevel(num)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedLevel === num
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Level {num} · <span className="font-arabic">م{num}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search English or Arabic · ابحث..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Phrase Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
          <p className="text-base font-bold text-slate-900">
            No phrases match your search · <span className="font-arabic">لا توجد عبارات مطابقة</span>
          </p>
          <p className="text-sm text-slate-500">
            Try clearing the search box or choosing &ldquo;All&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const isSpeaking = speakingId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="min-w-0 space-y-1.5 flex-1">
                  {/* Unboxed metadata with middot separator */}
                  <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                    <span className="font-mono-nums">Level {item.levelNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {item.categoryEn} · <span className="font-arabic">{item.categoryAr}</span>
                    </span>
                  </div>

                  <div className="text-lg font-extrabold text-slate-900" dir="ltr">
                    {item.en}
                  </div>

                  <div className="text-base font-bold text-emerald-800 font-arabic" dir="rtl">
                    {item.ar}
                  </div>

                  {showPhonetics && (
                    <div className="text-xs text-slate-500 font-arabic pt-0.5" dir="rtl">
                      النطق التقريبي: <span className="font-semibold text-slate-700">{item.phonetic}</span>
                    </div>
                  )}

                  {item.noteAr && (
                    <p className="text-xs text-amber-800 font-arabic pt-1" dir="rtl">
                      ملاحظة: {item.noteAr}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handlePlay(item)}
                  aria-label={`Listen to ${item.en}`}
                  className={`w-11 h-11 rounded-xl border border-b-4 flex items-center justify-center shrink-0 transition-all cursor-pointer active:translate-y-0.5 ${
                    isSpeaking
                      ? 'bg-sky-600 text-white border-sky-800'
                      : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

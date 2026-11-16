import { Compass, TrendingUp, BookOpen, Layers } from 'lucide-react';
import type { AppView } from '../types/learning';

interface TopBarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  onContinueNext: () => void;
  continueLabelEn: string;
}

const NAV_ITEMS: { id: AppView; labelEn: string; labelAr: string }[] = [
  { id: 'path', labelEn: 'Path', labelAr: 'المسار' },
  { id: 'curve', labelEn: 'Curve', labelAr: 'المنحنى' },
  { id: 'phrases', labelEn: 'Phrases', labelAr: 'العبارات' },
  { id: 'guide', labelEn: 'Guide', labelAr: 'الدليل' },
];

export function TopBar({
  activeView,
  onSelectView,
  onContinueNext,
  continueLabelEn,
}: TopBarProps) {
  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => onSelectView('path')}
            className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md px-1"
          >
            Masar · <span className="font-arabic">مسار</span>
          </button>

          {/* Zone 2: 4 single-line bilingual navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  className={`relative py-2 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md px-1 ${
                    isActive
                      ? 'text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>
                    {item.labelEn} · <span className="font-arabic">{item.labelAr}</span>
                  </span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-1 right-1 h-0.5 bg-emerald-600 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary CTA button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onContinueNext}
              className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:translate-y-0.5 border-b-2 border-emerald-800 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              {continueLabelEn} · <span className="font-arabic">متابعة</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab navigation (compact <= 56px respecting 15% mobile cap) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 h-14 px-2 grid grid-cols-4 gap-1"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          const Icon =
            item.id === 'path'
              ? Compass
              : item.id === 'curve'
                ? TrendingUp
                : item.id === 'phrases'
                  ? BookOpen
                  : Layers;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center justify-center rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'text-emerald-700 bg-emerald-50/70'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="truncate max-w-full">
                {item.labelEn} · <span className="font-arabic">{item.labelAr}</span>
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

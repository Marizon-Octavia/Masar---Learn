import { useState } from 'react';
import {
  Check,
  Lock,
  Play,
  RotateCcw,
  Volume2,
  Turtle,
  VolumeX,
  TrendingUp,
  Pencil,
  FastForward,
  Flame,
  Star,
} from 'lucide-react';
import type { Level, Lesson, ProgressState, AppView } from '../types/learning';
import { GeometricMascot } from './GeometricMascot';

interface PathViewProps {
  levels: Level[];
  progress: ProgressState;
  nextLessonId: string;
  onStartLesson: (lesson: Lesson) => void;
  onStartSkipCheck: (level: Level) => void;
  onUpdateName: (name: string) => void;
  onToggleSpeed: () => void;
  onTogglePhonetics: () => void;
  onToggleSound: () => void;
  onNavigateView: (view: AppView) => void;
}

const ACCENT_MAP: Record<
  Level['accentColor'],
  {
    headerBg: string;
    headerBorder: string;
    headerText: string;
    nodeActive: string;
    nodeDone: string;
  }
> = {
  emerald: {
    headerBg: 'bg-emerald-50/80',
    headerBorder: 'border-emerald-200',
    headerText: 'text-emerald-900',
    nodeActive: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-800 text-white',
    nodeDone: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-800',
  },
  sky: {
    headerBg: 'bg-sky-50/80',
    headerBorder: 'border-sky-200',
    headerText: 'text-sky-900',
    nodeActive: 'bg-sky-600 hover:bg-sky-700 border-sky-800 text-white',
    nodeDone: 'bg-sky-100 hover:bg-sky-200 border-sky-300 text-sky-800',
  },
  amber: {
    headerBg: 'bg-amber-50/80',
    headerBorder: 'border-amber-200',
    headerText: 'text-amber-900',
    nodeActive: 'bg-amber-500 hover:bg-amber-600 border-amber-700 text-white',
    nodeDone: 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900',
  },
  teal: {
    headerBg: 'bg-teal-50/80',
    headerBorder: 'border-teal-200',
    headerText: 'text-teal-900',
    nodeActive: 'bg-teal-600 hover:bg-teal-700 border-teal-800 text-white',
    nodeDone: 'bg-teal-100 hover:bg-teal-200 border-teal-300 text-teal-900',
  },
  indigo: {
    headerBg: 'bg-indigo-50/80',
    headerBorder: 'border-indigo-200',
    headerText: 'text-indigo-900',
    nodeActive: 'bg-indigo-600 hover:bg-indigo-700 border-indigo-800 text-white',
    nodeDone: 'bg-indigo-100 hover:bg-indigo-200 border-indigo-300 text-indigo-900',
  },
};

export function PathView({
  levels,
  progress,
  nextLessonId,
  onStartLesson,
  onStartSkipCheck,
  onUpdateName,
  onToggleSpeed,
  onTogglePhonetics,
  onToggleSound,
  onNavigateView,
}: PathViewProps) {
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(progress.learnerName);

  const totalLessons = levels.reduce((sum, lvl) => sum + lvl.lessons.length, 0);
  const completedCount = Object.keys(progress.completedLessons).length;
  const dailyPct = Math.min(
    100,
    Math.round((progress.todayXp / progress.preferences.dailyGoalXp) * 100)
  );

  const handleSaveName = () => {
    const trimmed = draftName.trim();
    if (trimmed) {
      onUpdateName(trimmed);
    } else {
      setDraftName(progress.learnerName);
    }
    setEditingName(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Column: Welcome + Winding 5-Level Path */}
        <div className="lg:col-span-8 space-y-8">
          {/* Calm Welcome & Personal Baseline Banner */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <GeometricMascot mood="greeting" size="md" />
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-xs font-semibold text-emerald-700">
                  A1 Personal Path · <span className="font-arabic">مسارك الشخصي للمستوى الأول</span>
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 text-balance">
                  Welcome back, {progress.learnerName} ·{' '}
                  <span className="font-arabic font-bold">أهلاً بك</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-arabic" dir="rtl">
                  تبدأ رحلتك من العبارات التي تعرفها بالفعل (التحية، الثناء، السؤال عن المكان) ثم تتدرج خطوة بخطوة إلى تركيب الجمل والأزمنة والمحادثة.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600 font-medium">
                  <span className="inline-flex items-center gap-1.5 font-mono-nums text-slate-900 font-bold">
                    <Star className="w-4 h-4 text-amber-500" />
                    {progress.xp} XP
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1.5 font-mono-nums text-slate-900 font-bold">
                    <Flame className="w-4 h-4 text-amber-600" />
                    {progress.streakDays} {progress.streakDays === 1 ? 'Day' : 'Days'} ·{' '}
                    <span className="font-arabic">أيام</span>
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-mono-nums">
                    {completedCount}/{totalLessons} Lessons · <span className="font-arabic">دروس مكتملة</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 5 Winding Levels */}
          <div className="space-y-10">
            {levels.map((level) => {
              const isLevelUnlocked = progress.unlockedLevelIds.includes(level.id);
              const accent = ACCENT_MAP[level.accentColor];
              const levelDoneCount = level.lessons.filter(
                (l) => Boolean(progress.completedLessons[l.id])
              ).length;

              return (
                <section key={level.id} className="space-y-6">
                  {/* Level Header */}
                  <div
                    className={`rounded-2xl border p-5 sm:p-6 ${accent.headerBg} ${accent.headerBorder}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold tracking-wide text-slate-600">
                          {level.stageLabelEn} ·{' '}
                          <span className="font-arabic">{level.stageLabelAr}</span>
                        </div>
                        <h2 className={`text-xl font-extrabold ${accent.headerText}`}>
                          Level {level.number}: {level.titleEn} ·{' '}
                          <span className="font-arabic font-bold">{level.titleAr}</span>
                        </h2>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {level.descriptionEn}
                        </p>
                        <p className="text-sm text-slate-700 font-arabic leading-relaxed" dir="rtl">
                          {level.descriptionAr}
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col items-start sm:items-end gap-2">
                        <div className="text-xs font-semibold text-slate-600 font-mono-nums">
                          {levelDoneCount}/{level.lessons.length} Complete ·{' '}
                          <span className="font-arabic">مكتمل</span>
                        </div>
                        {!isLevelUnlocked && level.skipCheckExercises.length > 0 && (
                          <button
                            type="button"
                            onClick={() => onStartSkipCheck(level)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 border-b-4 rounded-xl active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <FastForward className="w-3.5 h-3.5 text-sky-600" />
                            <span>
                              Jump Here · <span className="font-arabic">اختبار تخطي</span>
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Winding Path Nodes */}
                  <div className="relative py-2 flex flex-col items-center space-y-6">
                    {level.lessons.map((lesson, idx) => {
                      const completion = progress.completedLessons[lesson.id];
                      const isCompleted = Boolean(completion);
                      const prevLesson = idx > 0 ? level.lessons[idx - 1] : null;
                      const isLessonUnlocked =
                        isLevelUnlocked &&
                        (idx === 0 ||
                          isCompleted ||
                          (prevLesson ? Boolean(progress.completedLessons[prevLesson.id]) : false) ||
                          lesson.id === nextLessonId);
                      const isCurrent = lesson.id === nextLessonId && isLessonUnlocked;

                      // Gentle winding offset
                      const offsetClass =
                        idx % 3 === 0
                          ? '-translate-x-6 sm:-translate-x-10'
                          : idx % 3 === 1
                            ? 'translate-x-6 sm:translate-x-10'
                            : 'translate-x-0';

                      return (
                        <div
                          key={lesson.id}
                          className={`relative flex flex-col items-center text-center transition-transform ${offsetClass}`}
                        >
                          {/* Connector line to next node */}
                          {idx < level.lessons.length - 1 && (
                            <div
                              aria-hidden="true"
                              className="w-0.5 h-6 bg-slate-200 -mb-6 mt-20 absolute top-0 pointer-events-none"
                            />
                          )}

                          <button
                            type="button"
                            disabled={!isLessonUnlocked}
                            onClick={() => isLessonUnlocked && onStartLesson(lesson)}
                            aria-label={`${lesson.titleEn} - ${lesson.titleAr}`}
                            className={`relative w-20 h-20 rounded-3xl border-b-4 flex flex-col items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                              !isLessonUnlocked
                                ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                                : isCurrent
                                  ? `${accent.nodeActive} ring-4 ring-emerald-100 cursor-pointer active:translate-y-0.5`
                                  : isCompleted
                                    ? `${accent.nodeDone} border cursor-pointer active:translate-y-0.5`
                                    : 'bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 cursor-pointer active:translate-y-0.5'
                            }`}
                          >
                            {!isLessonUnlocked ? (
                              <Lock className="w-6 h-6" />
                            ) : isCompleted ? (
                              <Check className="w-7 h-7 stroke-[2.5]" />
                            ) : (
                              <Play className="w-7 h-7 fill-current ml-0.5" />
                            )}
                            <span className="text-[11px] font-mono-nums font-bold mt-0.5">
                              {level.number}.{lesson.order}
                            </span>
                          </button>

                          <div className="mt-2.5 max-w-[230px] space-y-0.5">
                            <div className="text-sm font-bold text-slate-900">
                              {lesson.titleEn}
                            </div>
                            <div className="text-sm font-semibold text-slate-700 font-arabic" dir="rtl">
                              {lesson.titleAr}
                            </div>
                            <div className="text-xs text-slate-500 font-mono-nums">
                              {isCompleted ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                  <RotateCcw className="w-3 h-3" />
                                  {completion.bestAccuracy}% · Practice ·{' '}
                                  <span className="font-arabic">مراجعة</span>
                                </span>
                              ) : isCurrent ? (
                                <span className="text-emerald-700 font-bold">
                                  Next Up · +{lesson.xpReward} XP ·{' '}
                                  <span className="font-arabic">ابدأ الآن</span>
                                </span>
                              ) : isLessonUnlocked ? (
                                <span>+{lesson.xpReward} XP</span>
                              ) : (
                                <span>
                                  Locked · <span className="font-arabic">مغلق</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Daily Goal, Preferences, Curve Preview */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Daily Study & Name Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Learner Profile · <span className="font-arabic">ملف المتعلم</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Saved automatically on this device ·{' '}
                  <span className="font-arabic">حفظ تلقائي</span>
                </p>
              </div>
              {!editingName && (
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(progress.learnerName);
                    setEditingName(true);
                  }}
                  aria-label="Edit learner name"
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  maxLength={28}
                  placeholder="Enter his name..."
                  className="flex-1 min-w-0 px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
                >
                  Save · <span className="font-arabic">حفظ</span>
                </button>
              </div>
            ) : (
              <div className="text-sm font-bold text-slate-800">
                Student: <span className="text-emerald-700">{progress.learnerName}</span>
              </div>
            )}

            {/* Daily Goal Bar */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700">
                  Daily Goal · <span className="font-arabic">هدف اليوم</span>
                </span>
                <span className="font-mono-nums text-slate-900">
                  {progress.todayXp} / {progress.preferences.dailyGoalXp} XP
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${dailyPct}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 font-arabic" dir="rtl">
                {dailyPct >= 100
                  ? 'أحسنت! حققت هدفك اليومي بالكامل.'
                  : 'أكمل درساً واحداً يومياً للحفاظ على تقدمك.'}
              </p>
            </div>
          </div>

          {/* Study Controls Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Study Controls · <span className="font-arabic">أدوات التعلّم</span>
            </h3>

            <div className="space-y-3">
              {/* Audio Speed Toggle */}
              <button
                type="button"
                onClick={onToggleSpeed}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Turtle className="w-4 h-4 text-sky-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900">
                      Speech Speed · <span className="font-arabic">سرعة النطق</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {progress.preferences.audioSpeed === 'slow'
                        ? 'Slow & clear (0.6x) · بطيء وواضح'
                        : 'Natural pace (1.0x) · سرعة طبيعية'}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono-nums font-bold text-sky-700 shrink-0">
                  {progress.preferences.audioSpeed === 'slow' ? '0.6x' : '1.0x'}
                </span>
              </button>

              {/* Phonetics Toggle */}
              <button
                type="button"
                onClick={onTogglePhonetics}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900">
                    Arabic Sound Hints · <span className="font-arabic">النطق بالحروف العربية</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Example: Good job → <span className="font-arabic">غود جوب</span>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold shrink-0 ${
                    progress.preferences.showPhonetics ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {progress.preferences.showPhonetics ? 'ON · مفعل' : 'OFF · متوقف'}
                </span>
              </button>

              {/* Sound Chimes Toggle */}
              <button
                type="button"
                onClick={onToggleSound}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {progress.preferences.soundEffects ? (
                    <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900">
                      Answer Chimes · <span className="font-arabic">أصوات الإجابة</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold shrink-0 ${
                    progress.preferences.soundEffects ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {progress.preferences.soundEffects ? 'ON · مفعل' : 'OFF · متوقف'}
                </span>
              </button>
            </div>
          </div>

          {/* Understanding Curve Snapshot */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                Understanding Curve · <span className="font-arabic">منحنى الفهم</span>
              </h3>
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>

            <div className="space-y-2.5">
              {levels.map((lvl) => {
                const done = lvl.lessons.filter(
                  (l) => Boolean(progress.completedLessons[l.id])
                ).length;
                const pct = Math.round((done / lvl.lessons.length) * 100);
                return (
                  <div key={lvl.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate">
                        L{lvl.number}: {lvl.titleEn}
                      </span>
                      <span className="font-mono-nums text-slate-600 shrink-0">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onNavigateView('curve')}
              className="w-full py-2.5 px-4 text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Open Full Curve · <span className="font-arabic">عرض المنحنى الكامل</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

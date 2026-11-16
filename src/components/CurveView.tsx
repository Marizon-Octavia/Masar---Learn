import { useState } from 'react';
import { CheckCircle2, Lock, ArrowRight, Play } from 'lucide-react';
import type { Level, Lesson, ProgressState, AudioSpeed } from '../types/learning';
import { AudioListenBar } from './AudioListenBar';

interface CurveViewProps {
  levels: Level[];
  progress: ProgressState;
  audioSpeed: AudioSpeed;
  onToggleSpeed: () => void;
  onStartLesson: (lesson: Lesson) => void;
  onStartSkipCheck: (level: Level) => void;
}

const STAGE_COORDS = [
  { x: 90, y: 245 },
  { x: 245, y: 205 },
  { x: 400, y: 150 },
  { x: 555, y: 95 },
  { x: 710, y: 50 },
];

export function CurveView({
  levels,
  progress,
  audioSpeed,
  onToggleSpeed,
  onStartLesson,
  onStartSkipCheck,
}: CurveViewProps) {
  const [selectedLevelIdx, setSelectedLevelIdx] = useState(0);
  const selectedLevel = levels[selectedLevelIdx];
  const isSelectedUnlocked = progress.unlockedLevelIds.includes(selectedLevel.id);

  // Calculate overall mastery score 0..100
  const totalLessons = levels.reduce((sum, l) => sum + l.lessons.length, 0);
  const completedLessons = Object.keys(progress.completedLessons).length;
  const overallPct = Math.round((completedLessons / totalLessons) * 100);

  const selectedDone = selectedLevel.lessons.filter(
    (l) => Boolean(progress.completedLessons[l.id])
  ).length;

  const sampleConcept = selectedLevel.lessons[0].concept;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-12 space-y-8">
      {/* Header */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-bold text-emerald-700">
            Progressive Scaffolding · <span className="font-arabic">التدرّج التدريجي في الفهم</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 text-balance">
            Your A1 Understanding Curve ·{' '}
            <span className="font-arabic font-bold">منحنى الفهم الخاص بك</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-arabic" dir="rtl">
            كل مرحلة على المنحنى تبني مباشرة فوق ما تعرفه بالفعل—من التحية والثناء إلى رابط الجملة ثم الأزمنة والمحادثة الحقيقية.
          </p>
        </div>

        <div className="shrink-0 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-center">
          <div className="text-3xl font-extrabold font-mono-nums text-emerald-700">
            {overallPct}%
          </div>
          <div className="text-xs font-semibold text-slate-600 mt-0.5">
            A1 Mastery · <span className="font-arabic">إتقان المستوى</span>
          </div>
        </div>
      </section>

      {/* Two-Zone Sandbox Layout: Interactive SVG Curve (Left/Top) + Stage Detail Deck (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive Curve Canvas */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                5 Competence Stages · <span className="font-arabic">٥ مراحل للفهم</span>
              </h2>
              <p className="text-xs text-slate-500">
                Click any milestone node to inspect what unlocks ·{' '}
                <span className="font-arabic">اضغط على أي مرحلة لعرض تفاصيلها</span>
              </p>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 800 310"
              className="w-full min-w-[540px] h-auto select-none"
              role="img"
              aria-label="5-Stage A1 English Understanding Curve"
            >
              {/* Subtle Coordinate Grid */}
              {[70, 130, 190, 250].map((y) => (
                <line
                  key={y}
                  x1="50"
                  y1={y}
                  x2="755"
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {/* Axes labels */}
              <text x="52" y="292" fill="#64748B" fontSize="12" fontWeight="600">
                Comfort Zone (Greetings & Praise)
              </text>
              <text
                x="750"
                y="292"
                fill="#059669"
                fontSize="12"
                fontWeight="700"
                textAnchor="end"
              >
                Everyday Conversations
              </text>

              {/* Smooth S-Curve Path */}
              <path
                d="M 90 245 C 175 245, 195 215, 245 205 C 310 190, 345 168, 400 150 C 460 130, 500 112, 555 95 C 615 76, 655 56, 710 50"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* Highlighted Progress Segments */}
              {levels.map((lvl, idx) => {
                if (idx === 0) return null;
                const prevUnlocked = progress.unlockedLevelIds.includes(levels[idx - 1].id);
                const currUnlocked = progress.unlockedLevelIds.includes(lvl.id);
                if (!prevUnlocked || !currUnlocked) return null;
                const p1 = STAGE_COORDS[idx - 1];
                const p2 = STAGE_COORDS[idx];
                return (
                  <line
                    key={`seg-${lvl.id}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#059669"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Interactive Milestone Nodes */}
              {levels.map((lvl, idx) => {
                const pos = STAGE_COORDS[idx];
                const unlocked = progress.unlockedLevelIds.includes(lvl.id);
                const doneCount = lvl.lessons.filter(
                  (l) => Boolean(progress.completedLessons[l.id])
                ).length;
                const allDone = doneCount === lvl.lessons.length;
                const isSelected = idx === selectedLevelIdx;

                return (
                  <g
                    key={lvl.id}
                    onClick={() => setSelectedLevelIdx(idx)}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="28"
                        fill="#D1FAE5"
                        stroke="#059669"
                        strokeWidth="2"
                      />
                    )}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="20"
                      fill={allDone ? '#059669' : unlocked ? '#0284C7' : '#F1F5F9'}
                      stroke={unlocked ? '#FFFFFF' : '#CBD5E1'}
                      strokeWidth="3"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 5}
                      textAnchor="middle"
                      fill={unlocked ? '#FFFFFF' : '#64748B'}
                      fontSize="14"
                      fontWeight="800"
                    >
                      {lvl.number}
                    </text>

                    {/* Label below/above node */}
                    <text
                      x={pos.x}
                      y={idx >= 3 ? pos.y + 42 : pos.y - 32}
                      textAnchor="middle"
                      fill="#0F172A"
                      fontSize="12"
                      fontWeight="700"
                    >
                      L{lvl.number}: {doneCount}/{lvl.lessons.length}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Stage Selector Tabs */}
          <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100">
            {levels.map((lvl, idx) => {
              const isSelected = idx === selectedLevelIdx;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSelectedLevelIdx(idx)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap truncate ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Level {lvl.number} · <span className="font-arabic">م{lvl.number}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail Deck */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-sky-700">
              {selectedLevel.stageLabelEn} ·{' '}
              <span className="font-arabic">{selectedLevel.stageLabelAr}</span>
            </span>
            <span className="text-xs font-mono-nums font-bold text-slate-600">
              {selectedDone}/{selectedLevel.lessons.length} Done
            </span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-extrabold text-slate-900">
              {selectedLevel.titleEn} ·{' '}
              <span className="font-arabic font-bold">{selectedLevel.titleAr}</span>
            </h3>
            <p className="text-sm text-slate-600 font-arabic leading-relaxed" dir="rtl">
              {selectedLevel.curveMilestoneAr}
            </p>
            <p className="text-xs text-slate-500">{selectedLevel.curveMilestoneEn}</p>
          </div>

          {/* Concept Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-700">
              Core Concept · <span className="font-arabic">الفكرة الأساسية</span>
            </div>
            <div className="text-sm font-semibold text-slate-900 font-arabic" dir="rtl">
              {sampleConcept.comparisonArabicLiteral}
            </div>
            <div className="flex flex-wrap gap-2" dir="ltr">
              {sampleConcept.comparisonEnglishBlocks.map((b, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-center"
                >
                  <div className="text-sm font-bold text-slate-900">{b.en}</div>
                  <div className="text-[11px] text-slate-500 font-arabic">{b.ar}</div>
                </div>
              ))}
            </div>
            <AudioListenBar
              text={sampleConcept.examples[0].en}
              speed={audioSpeed}
              onToggleSpeed={onToggleSpeed}
              size="sm"
              labelEn="Hear Example"
              labelAr="اسمع مثالاً"
            />
          </div>

          {/* Lesson Jump List */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-700">
              Lessons in Stage {selectedLevel.number} ·{' '}
              <span className="font-arabic">دروس هذه المرحلة</span>
            </div>
            {selectedLevel.lessons.map((lesson, idx) => {
              const done = Boolean(progress.completedLessons[lesson.id]);
              const prevDone =
                idx === 0 || Boolean(progress.completedLessons[selectedLevel.lessons[idx - 1].id]);
              const canPlay = isSelectedUnlocked && (done || prevDone);

              return (
                <button
                  key={lesson.id}
                  type="button"
                  disabled={!canPlay}
                  onClick={() => canPlay && onStartLesson(lesson)}
                  className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-colors ${
                    canPlay
                      ? 'bg-white hover:bg-emerald-50/50 border-slate-200 cursor-pointer'
                      : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {selectedLevel.number}.{lesson.order} {lesson.titleEn}
                    </div>
                    <div className="text-xs text-slate-600 font-arabic truncate" dir="rtl">
                      {lesson.titleAr}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : canPlay ? (
                      <Play className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {!isSelectedUnlocked && selectedLevel.skipCheckExercises.length > 0 && (
            <button
              type="button"
              onClick={() => onStartSkipCheck(selectedLevel)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 border-b-4 border-sky-800 rounded-xl active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>
                Test to Unlock Level {selectedLevel.number} ·{' '}
                <span className="font-arabic">اختبار تخطي لفتح المستوى</span>
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

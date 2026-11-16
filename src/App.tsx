import { useEffect, useMemo, useState } from 'react';
import { CURRICULUM_LEVELS, PHRASEBOOK_ITEMS } from './data/curriculum';
import type { AppView, Lesson, Level, ProgressState } from './types/learning';
import { TopBar } from './components/TopBar';
import { PathView } from './components/PathView';
import { CurveView } from './components/CurveView';
import { PhrasebookView } from './components/PhrasebookView';
import { GuideView } from './components/GuideView';
import { LessonPlayer } from './components/LessonPlayer';

const STORAGE_KEY = 'masar_a1_progress_v1';

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function createInitialProgress(): ProgressState {
  return {
    learnerName: 'Friend · صديقي',
    xp: 0,
    todayXp: 0,
    streakDays: 1,
    lastActiveDate: getTodayDateString(),
    completedLessons: {},
    unlockedLevelIds: ['level-1'],
    preferences: {
      audioSpeed: 'normal',
      soundEffects: true,
      showPhonetics: true,
      dailyGoalXp: 50,
    },
  };
}

function loadProgress(): ProgressState {
  const fallback = createInitialProgress();
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;

    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    const lastActive = parsed.lastActiveDate ?? today;

    let streakDays = parsed.streakDays ?? 1;
    let todayXp = parsed.todayXp ?? 0;

    if (lastActive !== today) {
      todayXp = 0;
      if (lastActive === yesterday) {
        streakDays = streakDays + 1;
      } else {
        streakDays = 1;
      }
    }

    return {
      learnerName: parsed.learnerName || fallback.learnerName,
      xp: parsed.xp ?? 0,
      todayXp,
      streakDays,
      lastActiveDate: today,
      completedLessons: parsed.completedLessons ?? {},
      unlockedLevelIds:
        parsed.unlockedLevelIds && parsed.unlockedLevelIds.length > 0
          ? parsed.unlockedLevelIds
          : ['level-1'],
      preferences: {
        audioSpeed: parsed.preferences?.audioSpeed ?? 'normal',
        soundEffects: parsed.preferences?.soundEffects ?? true,
        showPhonetics: parsed.preferences?.showPhonetics ?? true,
        dailyGoalXp: parsed.preferences?.dailyGoalXp ?? 50,
      },
    };
  } catch {
    return fallback;
  }
}

export default function App() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [activeView, setActiveView] = useState<AppView>('path');
  const [activeSession, setActiveSession] = useState<
    | { mode: 'lesson'; lesson: Lesson }
    | { mode: 'skip-check'; level: Level }
    | null
  >(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  // Compute the next uncompleted unlocked lesson for quick "Continue" CTA
  const nextRecommendedLesson = useMemo<Lesson>(() => {
    for (const lvl of CURRICULUM_LEVELS) {
      if (!progress.unlockedLevelIds.includes(lvl.id)) continue;
      for (const lesson of lvl.lessons) {
        if (!progress.completedLessons[lesson.id]) {
          return lesson;
        }
      }
    }
    return CURRICULUM_LEVELS[0].lessons[0];
  }, [progress]);

  const handleCompleteLesson = (
    lessonId: string,
    accuracyPct: number,
    xpEarned: number
  ) => {
    setProgress((prev) => {
      const existing = prev.completedLessons[lessonId];
      const updatedCompleted = {
        ...prev.completedLessons,
        [lessonId]: {
          bestAccuracy: existing
            ? Math.max(existing.bestAccuracy, accuracyPct)
            : accuracyPct,
          completions: existing ? existing.completions + 1 : 1,
          lastPracticed: getTodayDateString(),
        },
      };

      // Check if completing this lesson unlocks the next level
      const unlockedSet = new Set(prev.unlockedLevelIds);
      CURRICULUM_LEVELS.forEach((lvl, idx) => {
        const allDoneInLevel = lvl.lessons.every((l) => Boolean(updatedCompleted[l.id]));
        if (allDoneInLevel && idx + 1 < CURRICULUM_LEVELS.length) {
          unlockedSet.add(CURRICULUM_LEVELS[idx + 1].id);
        }
      });

      return {
        ...prev,
        xp: prev.xp + xpEarned,
        todayXp: prev.todayXp + xpEarned,
        lastActiveDate: getTodayDateString(),
        completedLessons: updatedCompleted,
        unlockedLevelIds: Array.from(unlockedSet),
      };
    });
  };

  const handleCompleteSkipCheck = (levelId: string, passed: boolean) => {
    if (!passed) return;
    setProgress((prev) => {
      const unlockedSet = new Set(prev.unlockedLevelIds);
      const targetIdx = CURRICULUM_LEVELS.findIndex((l) => l.id === levelId);
      for (let i = 0; i <= targetIdx; i++) {
        if (CURRICULUM_LEVELS[i]) {
          unlockedSet.add(CURRICULUM_LEVELS[i].id);
        }
      }
      return {
        ...prev,
        xp: prev.xp + 20,
        todayXp: prev.todayXp + 20,
        lastActiveDate: getTodayDateString(),
        unlockedLevelIds: Array.from(unlockedSet),
      };
    });
  };

  const handleToggleSpeed = () => {
    setProgress((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        audioSpeed: prev.preferences.audioSpeed === 'normal' ? 'slow' : 'normal',
      },
    }));
  };

  const handleTogglePhonetics = () => {
    setProgress((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        showPhonetics: !prev.preferences.showPhonetics,
      },
    }));
  };

  const handleToggleSound = () => {
    setProgress((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        soundEffects: !prev.preferences.soundEffects,
      },
    }));
  };

  const handleUpdateName = (name: string) => {
    setProgress((prev) => ({
      ...prev,
      learnerName: name,
    }));
  };

  const handleResetProgress = () => {
    const fresh = createInitialProgress();
    setProgress(fresh);
    setActiveView('path');
  };

  const hasStarted = Object.keys(progress.completedLessons).length > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <TopBar
        activeView={activeView}
        onSelectView={setActiveView}
        onContinueNext={() =>
          setActiveSession({ mode: 'lesson', lesson: nextRecommendedLesson })
        }
        continueLabelEn={hasStarted ? 'Continue' : 'Start'}
      />

      {activeView === 'path' && (
        <PathView
          levels={CURRICULUM_LEVELS}
          progress={progress}
          nextLessonId={nextRecommendedLesson.id}
          onStartLesson={(lesson) => setActiveSession({ mode: 'lesson', lesson })}
          onStartSkipCheck={(level) => setActiveSession({ mode: 'skip-check', level })}
          onUpdateName={handleUpdateName}
          onToggleSpeed={handleToggleSpeed}
          onTogglePhonetics={handleTogglePhonetics}
          onToggleSound={handleToggleSound}
          onNavigateView={setActiveView}
        />
      )}

      {activeView === 'curve' && (
        <CurveView
          levels={CURRICULUM_LEVELS}
          progress={progress}
          audioSpeed={progress.preferences.audioSpeed}
          onToggleSpeed={handleToggleSpeed}
          onStartLesson={(lesson) => setActiveSession({ mode: 'lesson', lesson })}
          onStartSkipCheck={(level) => setActiveSession({ mode: 'skip-check', level })}
        />
      )}

      {activeView === 'phrases' && (
        <PhrasebookView
          phrases={PHRASEBOOK_ITEMS}
          audioSpeed={progress.preferences.audioSpeed}
          showPhonetics={progress.preferences.showPhonetics}
          onToggleSpeed={handleToggleSpeed}
          onTogglePhonetics={handleTogglePhonetics}
        />
      )}

      {activeView === 'guide' && (
        <GuideView
          audioSpeed={progress.preferences.audioSpeed}
          onToggleSpeed={handleToggleSpeed}
          onResetProgress={handleResetProgress}
        />
      )}

      {activeSession && (
        <LessonPlayer
          mode={activeSession.mode}
          lesson={activeSession.mode === 'lesson' ? activeSession.lesson : undefined}
          skipLevel={activeSession.mode === 'skip-check' ? activeSession.level : undefined}
          audioSpeed={progress.preferences.audioSpeed}
          soundEffects={progress.preferences.soundEffects}
          showPhonetics={progress.preferences.showPhonetics}
          onToggleSpeed={handleToggleSpeed}
          onCompleteLesson={handleCompleteLesson}
          onCompleteSkipCheck={handleCompleteSkipCheck}
          onClose={() => setActiveSession(null)}
        />
      )}
    </div>
  );
}

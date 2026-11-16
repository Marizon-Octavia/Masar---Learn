import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Volume2,
  Turtle,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type {
  AudioSpeed,
  Exercise,
  Lesson,
  Level,
  MascotMood,
} from '../types/learning';
import {
  playCompleteFanfare,
  playRetryChime,
  playSuccessChime,
  speakEnglish,
  stopSpeaking,
} from '../utils/audio';
import { GeometricMascot } from './GeometricMascot';
import { AudioListenBar } from './AudioListenBar';

interface LessonPlayerProps {
  mode: 'lesson' | 'skip-check';
  lesson?: Lesson;
  skipLevel?: Level;
  audioSpeed: AudioSpeed;
  soundEffects: boolean;
  showPhonetics: boolean;
  onToggleSpeed: () => void;
  onCompleteLesson: (lessonId: string, accuracyPct: number, xpEarned: number) => void;
  onCompleteSkipCheck: (levelId: string, passed: boolean) => void;
  onClose: () => void;
}

interface TokenItem {
  uid: string;
  word: string;
}

function deterministicShuffle<T>(arr: T[], seedStr: string): T[] {
  const copy = [...arr];
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) % 1000003;
  }
  for (let i = copy.length - 1; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export function LessonPlayer({
  mode,
  lesson,
  skipLevel,
  audioSpeed,
  soundEffects,
  showPhonetics,
  onToggleSpeed,
  onCompleteLesson,
  onCompleteSkipCheck,
  onClose,
}: LessonPlayerProps) {
  const initialExercises = useMemo(() => {
    if (mode === 'skip-check' && skipLevel) {
      return skipLevel.skipCheckExercises;
    }
    return lesson?.exercises ?? [];
  }, [mode, lesson, skipLevel]);

  const [phase, setPhase] = useState<'concept' | 'practice' | 'summary'>(
    mode === 'skip-check' ? 'practice' : 'concept'
  );
  const [queue, setQueue] = useState<Exercise[]>(initialExercises);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [attemptNonce, setAttemptNonce] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [correctSubmissions, setCorrectSubmissions] = useState(0);

  // Per-exercise interaction state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedGapWord, setSelectedGapWord] = useState<string | null>(null);
  const [chosenTokens, setChosenTokens] = useState<TokenItem[]>([]);

  // Match-pairs state
  const [selectedEnPairId, setSelectedEnPairId] = useState<string | null>(null);
  const [selectedArPairId, setSelectedArPairId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [pairMismatchFlash, setPairMismatchFlash] = useState(false);

  // Feedback tray state
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'retry';
    messageAr: string;
    messageEn: string;
  } | null>(null);

  const [mascotMood, setMascotMood] = useState<MascotMood>('greeting');
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);

  const currentExercise = queue[currentIdx];

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Auto-play audio prompt gently when entering a listen-pick exercise
  useEffect(() => {
    if (phase === 'practice' && currentExercise?.type === 'listen-pick') {
      const timer = setTimeout(() => {
        speakEnglish(
          currentExercise.audioText,
          audioSpeed,
          () => setIsSpeakingAudio(true),
          () => setIsSpeakingAudio(false)
        );
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [phase, currentIdx, currentExercise, audioSpeed]);

  // Reset exercise inputs whenever moving to next item
  const resetInputs = () => {
    setSelectedOptionId(null);
    setSelectedGapWord(null);
    setChosenTokens([]);
    setSelectedEnPairId(null);
    setSelectedArPairId(null);
    setMatchedPairIds([]);
    setPairMismatchFlash(false);
    setFeedback(null);
    setMascotMood('thinking');
  };

  // Word bank token pool
  const wordBankPool = useMemo<TokenItem[]>(() => {
    if (!currentExercise || currentExercise.type !== 'word-bank') return [];
    const allWords = [
      ...currentExercise.correctTokens,
      ...currentExercise.distractorTokens,
    ].map((word, idx) => ({
      uid: `${currentExercise.id}-${attemptNonce}-${idx}-${word}`,
      word,
    }));
    return deterministicShuffle(allWords, `${currentExercise.id}-${attemptNonce}`);
  }, [currentExercise, attemptNonce]);

  const availableTokens = useMemo(() => {
    const usedIds = new Set(chosenTokens.map((t) => t.uid));
    return wordBankPool.filter((t) => !usedIds.has(t.uid));
  }, [wordBankPool, chosenTokens]);

  // Match pairs shuffled Arabic column
  const shuffledArabicPairs = useMemo(() => {
    if (!currentExercise || currentExercise.type !== 'match-pairs') return [];
    return deterministicShuffle(
      currentExercise.pairs,
      `${currentExercise.id}-ar-${attemptNonce}`
    );
  }, [currentExercise, attemptNonce]);

  const handleSelectPair = (side: 'en' | 'ar', id: string) => {
    if (!currentExercise || currentExercise.type !== 'match-pairs') return;
    if (matchedPairIds.includes(id) || feedback) return;

    const nextEn = side === 'en' ? id : selectedEnPairId;
    const nextAr = side === 'ar' ? id : selectedArPairId;

    if (side === 'en') {
      const pair = currentExercise.pairs.find((p) => p.id === id);
      if (pair) speakEnglish(pair.en.replace('→', ' '), audioSpeed);
      setSelectedEnPairId(id);
    } else {
      setSelectedArPairId(id);
    }

    if (nextEn && nextAr) {
      if (nextEn === nextAr) {
        const updated = [...matchedPairIds, nextEn];
        setMatchedPairIds(updated);
        setSelectedEnPairId(null);
        setSelectedArPairId(null);
        playSuccessChime(soundEffects);

        if (updated.length === currentExercise.pairs.length) {
          setTotalSubmissions((c) => c + 1);
          setCorrectSubmissions((c) => c + 1);
          setMascotMood('happy');
          setFeedback({
            status: 'correct',
            messageAr: currentExercise.explanationAr,
            messageEn: currentExercise.explanationEn,
          });
        }
      } else {
        playRetryChime(soundEffects);
        setPairMismatchFlash(true);
        setTimeout(() => {
          setSelectedEnPairId(null);
          setSelectedArPairId(null);
          setPairMismatchFlash(false);
        }, 420);
      }
    }
  };

  const canCheckCurrent = useMemo(() => {
    if (!currentExercise || feedback) return false;
    switch (currentExercise.type) {
      case 'listen-pick':
      case 'dialogue-reply':
        return selectedOptionId !== null;
      case 'fill-gap':
        return selectedGapWord !== null;
      case 'word-bank':
        return chosenTokens.length > 0;
      case 'match-pairs':
        return false; // Auto-completes when all pairs are matched
    }
  }, [currentExercise, feedback, selectedOptionId, selectedGapWord, chosenTokens]);

  const handleCheck = () => {
    if (!currentExercise || feedback) return;

    let isCorrect = false;
    let speakTarget = '';

    if (currentExercise.type === 'listen-pick') {
      isCorrect = selectedOptionId === currentExercise.correctOptionId;
      speakTarget = currentExercise.audioText;
    } else if (currentExercise.type === 'dialogue-reply') {
      isCorrect = selectedOptionId === currentExercise.correctOptionId;
      const chosenOpt = currentExercise.options.find((o) => o.id === selectedOptionId);
      if (chosenOpt && isCorrect) speakTarget = chosenOpt.en;
    } else if (currentExercise.type === 'fill-gap') {
      isCorrect = selectedGapWord === currentExercise.correctAnswer;
      speakTarget = currentExercise.fullSentence;
    } else if (currentExercise.type === 'word-bank') {
      const built = chosenTokens.map((t) => t.word).join(' ').trim();
      isCorrect =
        built.toLowerCase() === currentExercise.targetSentence.trim().toLowerCase();
      speakTarget = currentExercise.targetSentence;
    }

    setTotalSubmissions((c) => c + 1);

    if (isCorrect) {
      setCorrectSubmissions((c) => c + 1);
      setMascotMood('happy');
      playSuccessChime(soundEffects);
      if (speakTarget) {
        speakEnglish(speakTarget, audioSpeed);
      }
      setFeedback({
        status: 'correct',
        messageAr: currentExercise.explanationAr,
        messageEn: currentExercise.explanationEn,
      });
    } else {
      setMascotMood('encouraging');
      playRetryChime(soundEffects);
      // In regular lesson mode, gently re-queue missed items at the end
      if (mode === 'lesson') {
        setQueue((prev) => [...prev, currentExercise]);
      }
      setFeedback({
        status: 'retry',
        messageAr: currentExercise.explanationAr,
        messageEn: currentExercise.explanationEn,
      });
    }
  };

  const handleAdvance = () => {
    stopSpeaking();
    if (currentIdx + 1 < queue.length) {
      setCurrentIdx((i) => i + 1);
      setAttemptNonce((n) => n + 1);
      resetInputs();
    } else {
      const accuracy =
        totalSubmissions > 0
          ? Math.round((correctSubmissions / totalSubmissions) * 100)
          : 100;

      if (mode === 'skip-check' && skipLevel) {
        const passed = correctSubmissions >= Math.ceil(initialExercises.length * 0.66);
        if (passed) playCompleteFanfare(soundEffects);
        onCompleteSkipCheck(skipLevel.id, passed);
        setMascotMood(passed ? 'celebrating' : 'encouraging');
        setPhase('summary');
      } else if (lesson) {
        playCompleteFanfare(soundEffects);
        onCompleteLesson(lesson.id, accuracy, lesson.xpReward);
        setMascotMood('celebrating');
        setPhase('summary');
      }
    }
  };

  const accuracyPct =
    totalSubmissions > 0
      ? Math.round((correctSubmissions / totalSubmissions) * 100)
      : 100;

  const progressPct =
    phase === 'concept'
      ? 5
      : phase === 'summary'
        ? 100
        : Math.max(8, Math.round(((currentIdx + (feedback ? 1 : 0)) / queue.length) * 100));

  const titleEn =
    mode === 'skip-check' && skipLevel
      ? `Level ${skipLevel.number} Skip Check`
      : lesson?.titleEn ?? '';
  const titleAr =
    mode === 'skip-check' && skipLevel
      ? `اختبار تخطي المستوى ${skipLevel.number}`
      : lesson?.titleAr ?? '';

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col overflow-y-auto">
      {/* Top Lesson Bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            onClose();
          }}
          aria-label="Close lesson"
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 max-w-2xl flex items-center gap-3">
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-mono-nums font-bold text-slate-600 shrink-0">
            {phase === 'practice' ? `${currentIdx + 1}/${queue.length}` : titleEn}
          </span>
        </div>

        {/* Speed Toggle */}
        <button
          type="button"
          onClick={onToggleSpeed}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            audioSpeed === 'slow'
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Turtle className="w-3.5 h-3.5" />
          <span className="font-mono-nums">
            {audioSpeed === 'slow' ? '0.6x' : '1.0x'}
          </span>
        </button>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 flex flex-col justify-center max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* PHASE 1: PRE-LESSON CONCEPT CARD */}
        {phase === 'concept' && lesson && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <GeometricMascot mood="greeting" size="sm" />
              <div className="space-y-1 flex-1">
                <div className="text-xs font-bold text-emerald-700">
                  Quick Concept Card · <span className="font-arabic">بطاقة الفهم السريع</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {lesson.concept.titleEn}
                </h1>
                <h2 className="text-base sm:text-lg font-bold text-emerald-800 font-arabic" dir="rtl">
                  {lesson.concept.titleAr}
                </h2>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
              <p className="text-sm sm:text-base text-slate-800 font-arabic leading-relaxed" dir="rtl">
                {lesson.concept.summaryAr}
              </p>
              <p className="text-xs sm:text-sm text-slate-500">
                {lesson.concept.summaryEn}
              </p>

              {/* Visual Arabic -> English Building Blocks */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="text-sm font-bold text-slate-900 font-arabic" dir="rtl">
                  {lesson.concept.comparisonArabicLiteral}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" dir="ltr">
                  {lesson.concept.comparisonEnglishBlocks.map((block, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => speakEnglish(block.en, audioSpeed)}
                      className="bg-white hover:bg-sky-50/70 border border-slate-200 border-b-4 rounded-xl p-3 text-left transition-all cursor-pointer active:translate-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base font-extrabold text-slate-900">
                          {block.en}
                        </span>
                        <Volume2 className="w-4 h-4 text-sky-600 shrink-0" />
                      </div>
                      <div className="text-xs font-bold text-emerald-700 font-arabic mt-1" dir="rtl">
                        {block.ar}
                      </div>
                      {showPhonetics && block.phonetic && (
                        <div className="text-[11px] text-slate-500 font-arabic" dir="rtl">
                          {block.phonetic}
                        </div>
                      )}
                      {block.roleEn && (
                        <div className="text-[11px] text-slate-400 mt-1">
                          {block.roleEn} · <span className="font-arabic">{block.roleAr}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Audio Examples */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-600">
                Tap to Listen · <span className="font-arabic">اضغط للاستماع قبل البدء</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lesson.concept.examples.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => speakEnglish(ex.en, audioSpeed)}
                    className="flex items-center justify-between gap-3 bg-white hover:bg-sky-50/60 border border-slate-200 rounded-xl p-3.5 text-left transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900" dir="ltr">
                        {ex.en}
                      </div>
                      <div className="text-xs font-semibold text-slate-600 font-arabic" dir="rtl">
                        {ex.ar}
                      </div>
                      {showPhonetics && (
                        <div className="text-[11px] text-slate-400 font-arabic" dir="rtl">
                          {ex.phonetic}
                        </div>
                      )}
                    </div>
                    <Volume2 className="w-4 h-4 text-sky-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <AudioListenBar
                text={lesson.concept.examples.map((e) => e.en).join('. ')}
                speed={audioSpeed}
                onToggleSpeed={onToggleSpeed}
                size="sm"
                labelEn="Play All"
                labelAr="تشغيل الكل"
              />
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setPhase('practice');
                  setMascotMood('thinking');
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-800 rounded-xl active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>
                  Start Practice · <span className="font-arabic">ابدأ التدريب</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: INTERACTIVE EXERCISE LOOP */}
        {phase === 'practice' && currentExercise && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Instruction Header */}
            <div className="flex items-start gap-4">
              <GeometricMascot
                mood={isSpeakingAudio ? 'listening' : mascotMood}
                size="sm"
              />
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-500">
                  {titleEn} · <span className="font-arabic">{titleAr}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {currentExercise.instructionEn}
                </h2>
                <p className="text-sm sm:text-base font-bold text-emerald-800 font-arabic" dir="rtl">
                  {currentExercise.instructionAr}
                </p>
              </div>
            </div>

            {/* 1. LISTEN & PICK */}
            {currentExercise.type === 'listen-pick' && (
              <div className="space-y-5">
                <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <AudioListenBar
                      text={currentExercise.audioText}
                      speed={audioSpeed}
                      onToggleSpeed={onToggleSpeed}
                      size="lg"
                      labelEn="Listen to Phrase"
                      labelAr="استمع للعبارة"
                    />
                    {showPhonetics && (
                      <p className="text-xs text-slate-600 font-arabic pt-1" dir="rtl">
                        النطق التقريبي: {currentExercise.phoneticHint}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono-nums">
                    {audioSpeed === 'slow' ? '0.6x Slow · بطيء' : '1.0x Normal · عادي'}
                  </div>
                </div>

                <div className="space-y-3">
                  {currentExercise.options.map((opt) => {
                    const selected = selectedOptionId === opt.id;
                    const showCorrect =
                      feedback && opt.id === currentExercise.correctOptionId;
                    const showWrong =
                      feedback?.status === 'retry' &&
                      selected &&
                      opt.id !== currentExercise.correctOptionId;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={Boolean(feedback)}
                        onClick={() => setSelectedOptionId(opt.id)}
                        dir="rtl"
                        className={`w-full text-right p-4 rounded-xl border border-b-4 font-arabic text-base font-bold transition-all cursor-pointer ${
                          showCorrect
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                            : showWrong
                              ? 'bg-amber-50 border-amber-400 text-amber-900'
                              : selected
                                ? 'bg-sky-50 border-sky-500 text-sky-900'
                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        {opt.ar}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. WORD BANK SENTENCE BUILDER */}
            {currentExercise.type === 'word-bank' && (
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
                  <div className="text-xs font-semibold text-slate-500">
                    Translate into English · <span className="font-arabic">كوّن الجملة بالإنجليزية</span>
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-arabic" dir="rtl">
                    {currentExercise.promptAr}
                  </div>
                </div>

                {/* Answer Construction Line */}
                <div
                  dir="ltr"
                  className="min-h-[68px] p-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 flex flex-wrap items-center gap-2"
                >
                  {chosenTokens.length === 0 ? (
                    <span className="text-sm text-slate-400 px-2">
                      Tap English words below in order... ·{' '}
                      <span className="font-arabic">اضغط على الكلمات بالترتيب</span>
                    </span>
                  ) : (
                    chosenTokens.map((tok) => (
                      <button
                        key={tok.uid}
                        type="button"
                        disabled={Boolean(feedback)}
                        onClick={() =>
                          setChosenTokens((prev) =>
                            prev.filter((item) => item.uid !== tok.uid)
                          )
                        }
                        className="px-3.5 py-2 text-sm font-bold text-slate-900 bg-white border border-slate-300 border-b-4 rounded-xl hover:bg-slate-50 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        {tok.word}
                      </button>
                    ))
                  )}
                </div>

                {/* Available Word Tiles */}
                <div dir="ltr" className="flex flex-wrap items-center justify-center gap-2.5">
                  {availableTokens.map((tok) => (
                    <button
                      key={tok.uid}
                      type="button"
                      disabled={Boolean(feedback)}
                      onClick={() => {
                        speakEnglish(tok.word, audioSpeed);
                        setChosenTokens((prev) => [...prev, tok]);
                      }}
                      className="px-4 py-2.5 text-sm font-bold text-slate-800 bg-white hover:bg-sky-50 border border-slate-200 border-b-4 rounded-xl active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      {tok.word}
                    </button>
                  ))}
                </div>

                {feedback?.status === 'retry' && (
                  <div className="text-sm font-bold text-slate-800 text-center" dir="ltr">
                    Correct sentence: <span className="text-emerald-700">{currentExercise.targetSentence}</span>
                  </div>
                )}
              </div>
            )}

            {/* 3. MATCH PAIRS */}
            {currentExercise.type === 'match-pairs' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 text-center">
                  Tap an English card, then tap its Arabic match ·{' '}
                  <span className="font-arabic">اختر الكلمة الإنجليزية ثم معناها العربي</span>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {/* English Column */}
                  <div className="space-y-2.5" dir="ltr">
                    {currentExercise.pairs.map((pair) => {
                      const matched = matchedPairIds.includes(pair.id);
                      const selected = selectedEnPairId === pair.id;
                      return (
                        <button
                          key={`en-${pair.id}`}
                          type="button"
                          disabled={matched}
                          onClick={() => handleSelectPair('en', pair.id)}
                          className={`w-full p-3.5 rounded-xl border border-b-4 text-sm sm:text-base font-bold transition-all ${
                            matched
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 opacity-70 cursor-default'
                              : selected && pairMismatchFlash
                                ? 'bg-amber-50 border-amber-400 text-amber-900'
                                : selected
                                  ? 'bg-sky-50 border-sky-500 text-sky-900 cursor-pointer'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 cursor-pointer'
                          }`}
                        >
                          {pair.en}
                        </button>
                      );
                    })}
                  </div>

                  {/* Arabic Column */}
                  <div className="space-y-2.5" dir="rtl">
                    {shuffledArabicPairs.map((pair) => {
                      const matched = matchedPairIds.includes(pair.id);
                      const selected = selectedArPairId === pair.id;
                      return (
                        <button
                          key={`ar-${pair.id}`}
                          type="button"
                          disabled={matched}
                          onClick={() => handleSelectPair('ar', pair.id)}
                          className={`w-full p-3.5 rounded-xl border border-b-4 text-sm sm:text-base font-bold font-arabic transition-all ${
                            matched
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 opacity-70 cursor-default'
                              : selected && pairMismatchFlash
                                ? 'bg-amber-50 border-amber-400 text-amber-900'
                                : selected
                                  ? 'bg-sky-50 border-sky-500 text-sky-900 cursor-pointer'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 cursor-pointer'
                          }`}
                        >
                          {pair.ar}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. FILL THE GAP */}
            {currentExercise.type === 'fill-gap' && (
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-2">
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900" dir="ltr">
                    {currentExercise.sentenceBefore}{' '}
                    <span className="inline-block min-w-[78px] px-3 py-0.5 mx-1 rounded-lg border-b-4 border-sky-400 bg-white text-sky-800">
                      {selectedGapWord ?? '___'}
                    </span>{' '}
                    {currentExercise.sentenceAfter}
                  </div>
                  <div className="text-sm font-bold text-slate-600 font-arabic" dir="rtl">
                    {currentExercise.meaningAr}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" dir="ltr">
                  {currentExercise.options.map((word) => {
                    const selected = selectedGapWord === word;
                    const isRight = feedback && word === currentExercise.correctAnswer;
                    const isWrong =
                      feedback?.status === 'retry' &&
                      selected &&
                      word !== currentExercise.correctAnswer;

                    return (
                      <button
                        key={word}
                        type="button"
                        disabled={Boolean(feedback)}
                        onClick={() => {
                          speakEnglish(word, audioSpeed);
                          setSelectedGapWord(word);
                        }}
                        className={`py-3.5 px-4 rounded-xl border border-b-4 text-base font-extrabold transition-all cursor-pointer ${
                          isRight
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                            : isWrong
                              ? 'bg-amber-50 border-amber-400 text-amber-900'
                              : selected
                                ? 'bg-sky-50 border-sky-500 text-sky-900'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. DIALOGUE REPLY */}
            {currentExercise.type === 'dialogue-reply' && (
              <div className="space-y-5">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                  <div className="text-xs font-bold text-slate-500 font-arabic" dir="rtl">
                    {currentExercise.contextAr}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="space-y-1">
                      <div className="text-lg font-extrabold text-slate-900" dir="ltr">
                        &ldquo;{currentExercise.speakerEn}&rdquo;
                      </div>
                      <div className="text-sm font-semibold text-slate-600 font-arabic" dir="rtl">
                        {currentExercise.speakerAr}
                      </div>
                    </div>
                    <AudioListenBar
                      text={currentExercise.speakerEn}
                      speed={audioSpeed}
                      showSpeedToggle={false}
                      size="sm"
                      labelEn="Hear"
                      labelAr="استمع"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {currentExercise.options.map((opt) => {
                    const selected = selectedOptionId === opt.id;
                    const showCorrect =
                      feedback && opt.id === currentExercise.correctOptionId;
                    const showWrong =
                      feedback?.status === 'retry' &&
                      selected &&
                      opt.id !== currentExercise.correctOptionId;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={Boolean(feedback)}
                        onClick={() => {
                          speakEnglish(opt.en, audioSpeed);
                          setSelectedOptionId(opt.id);
                        }}
                        className={`w-full text-left p-4 rounded-xl border border-b-4 transition-all cursor-pointer space-y-1 ${
                          showCorrect
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                            : showWrong
                              ? 'bg-amber-50 border-amber-400 text-amber-950'
                              : selected
                                ? 'bg-sky-50 border-sky-500 text-sky-950'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <div className="text-base font-bold" dir="ltr">
                          {opt.en}
                        </div>
                        <div className="text-xs font-semibold text-slate-600 font-arabic" dir="rtl">
                          {opt.ar}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PHASE 3: COMPLETION SUMMARY */}
        {phase === 'summary' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-6">
            <div className="flex justify-center">
              <GeometricMascot mood={mascotMood} size="lg" />
            </div>

            {mode === 'skip-check' && skipLevel ? (
              correctSubmissions >= Math.ceil(initialExercises.length * 0.66) ? (
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                    Level {skipLevel.number} Unlocked! ·{' '}
                    <span className="font-arabic">تم فتح المستوى {skipLevel.number}!</span>
                  </h2>
                  <p className="text-sm text-slate-600 font-arabic" dir="rtl">
                    أحسنت! أجبت عن {correctSubmissions} من {initialExercises.length} أسئلة بشكل صحيح.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-amber-800">
                    Almost There! · <span className="font-arabic">قريب جداً!</span>
                  </h2>
                  <p className="text-sm text-slate-600 font-arabic" dir="rtl">
                    يُنصح بإكمال الدروس السابقة خطوة بخطوة لبناء الأساس قبل الانتقال هنا.
                  </p>
                </div>
              )
            ) : (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <Sparkles className="w-4 h-4" />
                  Lesson Complete · <span className="font-arabic">أنهيت الدرس بنجاح</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Good job! · <span className="font-arabic">عمل رائع!</span>
                </h2>
                <p className="text-sm text-slate-600 font-arabic" dir="rtl">
                  تقدمك محفوظ تلقائياً على هذا الجهاز، ومنحنى الفهم الخاص بك ارتفع خطوة جديدة.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-2xl font-extrabold font-mono-nums text-amber-600">
                  +{mode === 'skip-check' ? 20 : lesson?.xpReward ?? 25}
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  XP Earned · <span className="font-arabic">نقاط الخبرة</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-2xl font-extrabold font-mono-nums text-emerald-700">
                  {accuracyPct}%
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  Focus Accuracy · <span className="font-arabic">دقة التركيز</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {mode === 'lesson' && lesson && (
                <button
                  type="button"
                  onClick={() => {
                    setQueue(initialExercises);
                    setCurrentIdx(0);
                    setAttemptNonce((n) => n + 1);
                    setTotalSubmissions(0);
                    setCorrectSubmissions(0);
                    resetInputs();
                    setPhase('concept');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>
                    Practice Again · <span className="font-arabic">تدرب مجدداً</span>
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-7 py-3 text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-800 rounded-xl active:translate-y-0.5 transition-all cursor-pointer"
              >
                <span>
                  Back to Path · <span className="font-arabic">العودة للمسار</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Check / Bilingual Feedback Tray */}
      {phase === 'practice' && (
        <footer
          className={`sticky bottom-0 z-20 border-t px-4 sm:px-6 py-4 transition-colors ${
            feedback?.status === 'correct'
              ? 'bg-emerald-50 border-emerald-200'
              : feedback?.status === 'retry'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-white border-slate-200'
          }`}
        >
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {feedback ? (
              <div className="flex items-start gap-3 min-w-0">
                {feedback.status === 'correct' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Lightbulb className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 min-w-0">
                  <div
                    className={`text-sm font-extrabold ${
                      feedback.status === 'correct'
                        ? 'text-emerald-900'
                        : 'text-amber-950'
                    }`}
                  >
                    {feedback.status === 'correct' ? (
                      <>
                        Well done! · <span className="font-arabic">أحسنت!</span>
                      </>
                    ) : (
                      <>
                        Let&apos;s learn this · <span className="font-arabic">تلميح سريع (سيُعاد السؤال للتثبيت)</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-800 font-arabic" dir="rtl">
                    {feedback.messageAr}
                  </p>
                  <p className="text-xs text-slate-600">{feedback.messageEn}</p>
                </div>
              </div>
            ) : (
              <div className="text-xs font-medium text-slate-500">
                Take your time · <span className="font-arabic">خذ وقتك بدون تسرع</span>
              </div>
            )}

            <div className="shrink-0 flex justify-end">
              {feedback ? (
                <button
                  type="button"
                  onClick={handleAdvance}
                  className={`px-7 py-3 text-sm font-extrabold text-white border-b-4 rounded-xl active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap ${
                    feedback.status === 'correct'
                      ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-800'
                      : 'bg-amber-600 hover:bg-amber-700 border-amber-800'
                  }`}
                >
                  Continue · <span className="font-arabic">متابعة</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canCheckCurrent}
                  onClick={handleCheck}
                  className={`px-7 py-3 text-sm font-extrabold rounded-xl border-b-4 transition-all whitespace-nowrap ${
                    canCheckCurrent
                      ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-800 text-white active:translate-y-0.5 cursor-pointer'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Check · <span className="font-arabic">تحقق</span>
                </button>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

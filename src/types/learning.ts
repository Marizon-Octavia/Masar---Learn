export type AppView = 'path' | 'curve' | 'phrases' | 'guide';

export type AudioSpeed = 'normal' | 'slow';

export type MascotMood = 'greeting' | 'listening' | 'thinking' | 'happy' | 'encouraging' | 'celebrating';

export type ExerciseType =
  | 'listen-pick'
  | 'word-bank'
  | 'match-pairs'
  | 'fill-gap'
  | 'dialogue-reply';

export interface ConceptBlock {
  en: string;
  ar: string;
  phonetic?: string;
  roleEn?: string;
  roleAr?: string;
}

export interface ConceptTip {
  titleEn: string;
  titleAr: string;
  summaryAr: string;
  summaryEn: string;
  comparisonArabicLiteral: string;
  comparisonEnglishBlocks: ConceptBlock[];
  examples: {
    en: string;
    ar: string;
    phonetic: string;
  }[];
}

export interface ListenPickExercise {
  id: string;
  type: 'listen-pick';
  instructionEn: string;
  instructionAr: string;
  audioText: string;
  phoneticHint: string;
  options: {
    id: string;
    ar: string;
    enHint?: string;
  }[];
  correctOptionId: string;
  explanationAr: string;
  explanationEn: string;
}

export interface WordBankExercise {
  id: string;
  type: 'word-bank';
  instructionEn: string;
  instructionAr: string;
  promptAr: string;
  targetSentence: string;
  correctTokens: string[];
  distractorTokens: string[];
  explanationAr: string;
  explanationEn: string;
}

export interface MatchPairsExercise {
  id: string;
  type: 'match-pairs';
  instructionEn: string;
  instructionAr: string;
  pairs: {
    id: string;
    en: string;
    ar: string;
  }[];
  explanationAr: string;
  explanationEn: string;
}

export interface FillGapExercise {
  id: string;
  type: 'fill-gap';
  instructionEn: string;
  instructionAr: string;
  sentenceBefore: string;
  sentenceAfter: string;
  fullSentence: string;
  meaningAr: string;
  options: string[];
  correctAnswer: string;
  explanationAr: string;
  explanationEn: string;
}

export interface DialogueReplyExercise {
  id: string;
  type: 'dialogue-reply';
  instructionEn: string;
  instructionAr: string;
  contextAr: string;
  speakerEn: string;
  speakerAr: string;
  options: {
    id: string;
    en: string;
    ar: string;
  }[];
  correctOptionId: string;
  explanationAr: string;
  explanationEn: string;
}

export type Exercise =
  | ListenPickExercise
  | WordBankExercise
  | MatchPairsExercise
  | FillGapExercise
  | DialogueReplyExercise;

export interface Lesson {
  id: string;
  levelId: string;
  order: number;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  xpReward: number;
  concept: ConceptTip;
  exercises: Exercise[];
}

export interface Level {
  id: string;
  number: number;
  stageLabelEn: string;
  stageLabelAr: string;
  titleEn: string;
  titleAr: string;
  descriptionAr: string;
  descriptionEn: string;
  curveMilestoneEn: string;
  curveMilestoneAr: string;
  accentColor: 'emerald' | 'sky' | 'amber' | 'teal' | 'indigo';
  lessons: Lesson[];
  skipCheckExercises: Exercise[];
}

export interface PhraseItem {
  id: string;
  levelId: string;
  levelNumber: number;
  categoryEn: string;
  categoryAr: string;
  en: string;
  ar: string;
  phonetic: string;
  noteAr?: string;
}

export interface CompletedLessonRecord {
  bestAccuracy: number;
  completions: number;
  lastPracticed: string;
}

export interface LearnerPreferences {
  audioSpeed: AudioSpeed;
  soundEffects: boolean;
  showPhonetics: boolean;
  dailyGoalXp: number;
}

export interface ProgressState {
  learnerName: string;
  xp: number;
  todayXp: number;
  streakDays: number;
  lastActiveDate: string;
  completedLessons: Record<string, CompletedLessonRecord>;
  unlockedLevelIds: string[];
  preferences: LearnerPreferences;
}


export interface AudioSnippet {
  url: string;
  startTime: number;
  duration: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Category {
  id: string;
  name: string;
  group: string;
  prompt: string;
  imageUrl?: string;
}

export interface Question {
  id: string;
  categoryId: string;
  points: number;
  questionText: string;
  answerText: string;
  status: 'unplayed' | 'opened' | 'answered-correct' | 'answered-incorrect';
  audioSnippet?: AudioSnippet;
  audioUrl?: string;
  videoUrl?: string;
  mediaType?: 'صورة' | 'فيديو' | 'صوت' | string;
  isEnumeration?: boolean;
  imageUrl?: string;
  sources?: GroundingSource[];
}

export type GeminiModel = 'gemini-3-flash-preview' | 'gemini-3-pro-preview';

export interface GameState {
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  currentTeam: 1 | 2;
  selectedCategories: Category[];
  questions: Record<string, Question>; 
  phase: 'setup' | 'loading' | 'board' | 'finished';
  activeQuestionId: string | null;
  selectedModel: GeminiModel;
}
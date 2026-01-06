
import { createClient } from "@supabase/supabase-js";
import { Category, Question, GroundingSource } from "../types";

const metaEnv = (import.meta as any).env || {};
const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || "https://jzroawrljghtzveqsour.supabase.co";
const SUPABASE_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || "sb_publishable_3nZDKySjVLnpQgrWSAwfFQ_yVc47sm9";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * تسجيل الدخول عبر غوغل باستخدام الرابط الحالي للمتصفح كمرجع
 */
export async function signInWithGoogle() {
  // نقوم بتنظيف الرابط من أي علامات زائدة لضمان قبوله من غوغل
  const redirectUrl = window.location.origin.endsWith('/') 
    ? window.location.origin.slice(0, -1) 
    : window.location.origin;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });
  if (error) throw error;
}

/**
 * جلب المعرف الفريد للاعب
 */
export async function getPlayerIdentifier(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.id) return session.user.id;
  return "Guest";
}

/**
 * جلب الجولات المتبقية لكل فئة
 */
export async function fetchRemainingRounds(userId?: string): Promise<Record<string, number>> {
  try {
    const identifier = userId || await getPlayerIdentifier();
    if (identifier === "Guest") return {};

    const { data, error } = await supabase.rpc('get_remaining_rounds_per_category', { 
      p_user_id: identifier 
    });
    
    if (error) {
      console.error("RPC Error:", error.message);
      return {};
    }

    const roundsMap: Record<string, number> = {};
    if (data && Array.isArray(data)) {
      data.forEach((item: any) => {
        const catName = item.category;
        const rounds = item.remaining_rounds;
        if (catName !== undefined) roundsMap[catName] = Math.max(0, Number(rounds) || 0);
      });
    }
    return roundsMap;
  } catch (err) {
    return {};
  }
}

function mapQuestionData(row: any, category: Category, points: number): Question {
  const q: Question = {
    id: `${category.id}-${points}`,
    categoryId: category.id,
    points: points,
    questionText: row.question_text || row.question || "سؤال مفقود",
    answerText: row.answer_text || row.answer || "إجابة مفقودة",
    status: 'unplayed',
    isEnumeration: category.id.includes('list') || (row.question_text && row.question_text.includes('عدد')),
    sources: row.sources as GroundingSource[] | undefined
  };

  const mediaUrl = row.media_url || row.image_url; 
  const mediaType = (row.media_type || "").toLowerCase().trim();

  if (mediaUrl) {
    if (mediaType === 'audio' || mediaType === 'صوت') {
      q.audioUrl = mediaUrl;
      q.mediaType = 'صوت';
    } else if (mediaType === 'video' || mediaType === 'فيديو') {
      q.videoUrl = mediaUrl;
      q.mediaType = 'فيديو';
    } else {
      q.imageUrl = mediaUrl;
      q.mediaType = 'صورة';
    }
  }

  return q;
}

async function fetchSingleQuestion(playerId: string, category: Category, points: number): Promise<Question | null> {
  try {
    const { data, error } = await supabase.rpc("get_next_question_for_points", {
      p_user_id: playerId,
      p_category: category.name,
      p_points: points
    });
    if (error || !data || data.length === 0) return null;
    return mapQuestionData(data[0], category, points);
  } catch (err) {
    return null;
  }
}

export async function fetchBoardFromStock(
  categories: Category[],
  onProgress?: (percent: number) => void
): Promise<{ questions: Record<string, Question>, errors: string[] }> {
  
  const playerId = await getPlayerIdentifier();
  const questions: Record<string, Question> = {};
  const errors: string[] = [];
  const pointsLevels = [100, 200, 300, 400, 500];
  const categoryNames = categories.map(c => c.name);
  
  if (onProgress) onProgress(5);

  try {
    const { data, error } = await supabase.rpc("get_game_board", {
      p_user_id: playerId,
      p_categories: categoryNames
    });

    if (error) throw error; 

    if (onProgress) onProgress(50);

    const fetchedQuestionsMap = new Map<string, any>();
    if (data && Array.isArray(data)) {
      data.forEach((row: any) => {
        const matchingCat = categories.find(c => c.name === row.category);
        if (matchingCat) {
            const key = `${matchingCat.id}-${row.points}`;
            fetchedQuestionsMap.set(key, row);
        }
      });
    }

    categories.forEach(cat => {
      pointsLevels.forEach(points => {
        const id = `${cat.id}-${points}`;
        const row = fetchedQuestionsMap.get(id);
        if (row) {
          questions[id] = mapQuestionData(row, cat, points);
        } else {
          errors.push(`نقص: ${cat.name} (${points})`);
        }
      });
    });

  } catch (batchError: any) {
    let completed = 0;
    const total = categories.length * pointsLevels.length;
    
    const promises = categories.flatMap(cat => 
      pointsLevels.map(async (points) => {
        const q = await fetchSingleQuestion(playerId, cat, points);
        completed++;
        if (onProgress) onProgress(10 + Math.floor((completed / total) * 85));
        
        const id = `${cat.id}-${points}`;
        if (q) {
          questions[id] = q;
        } else {
          questions[id] = {
            id: id, categoryId: cat.id, points: points,
            questionText: `عذراً، نفد مخزون الأسئلة لهذه الفئة (${points})`,
            answerText: "تجاوز", status: 'answered-incorrect'
          };
          errors.push(`نقص: ${cat.name} (${points})`);
        }
      })
    );
    await Promise.all(promises);
  }

  if (onProgress) onProgress(100);
  return { questions, errors };
}

export async function getUsedQuestionsTexts(categoryName: string): Promise<string[]> { return []; }
export async function saveUsedQuestions(categoryName: string, questions: { text: string; points: number }[]): Promise<void> {}

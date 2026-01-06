
import { GoogleGenAI } from "@google/genai";
import { GLOBAL_INSTRUCTIONS } from "../constants";
import { Category, GeminiModel, GroundingSource } from "../types";
import { saveUsedQuestions, getUsedQuestionsTexts } from "./supabase";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function extractJSON(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parsing Error. Text received:", text);
    throw new Error("Failed to parse JSON from Gemini response");
  }
}

export async function generateBatchQuestions(
  categories: Category[],
  modelName: GeminiModel = 'gemini-3-flash-preview',
  onProgress?: (message: string, stepIncrement: number) => void
): Promise<Record<string, any[]>> {
  const results: Record<string, any[]> = {};
  if (categories.length === 0) return results;

  const catsList = categories.map(c => `- ${c.name} (ID: ${c.id})`).join("\n");
  let historyPrompt = "";
  for (const cat of categories) {
    const history = await getUsedQuestionsTexts(cat.name);
    if (history.length > 0) {
      historyPrompt += `\n- [${cat.name}]: ${history.join(" | ")}`;
    }
  }

  try {
    // --- الطلب الأول: توليد مسودة أولية باستخدام Google Search للبحث عن حقائق حديثة ---
    onProgress?.("الطلب 1: البحث في الويب عن أحدث المعلومات والحقائق...", 10);
    const draftResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // إجبار فلاش لدعم السيرش
      contents: `
        المهمة: توليد 8 مقترحات أسئلة لكل مستوى (100-500) للفئات التالية:
        ${catsList}
        استخدم Google Search للعثور على معلومات دقيقة، حديثة، ومثيرة للاهتمام (أحداث 2024-2025 إن وجد).
        اربط كل معلومة بمصدرها إن أمكن.
      `,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    // استخراج المصادر من Grounding Metadata
    const draftSources: GroundingSource[] = draftResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "مصدر خارجي",
      uri: chunk.web?.uri || ""
    })).filter((s: GroundingSource) => s.uri) || [];

    const draftText = draftResponse.text;

    // --- الطلب الثاني: الفلترة والتحقق بناءً على القواعد والسجل ---
    onProgress?.("الطلب 2: تصفية النتائج ومطابقتها مع سجل اللاعب...", 15);
    const selectionResponse = await ai.models.generateContent({
      model: modelName,
      contents: `
        ${GLOBAL_INSTRUCTIONS}
        
        [المقترحات الأولية المعتمدة على الويب]:
        ${draftText}

        [سجل الأسئلة السابق لهذا اللاعب - يحظر التكرار]:
        ${historyPrompt || "لا يوجد سجل سابق."}

        المهمة: اختر أفضل سؤال واحد لكل مستوى صعوبة لكل فئة. تأكد من أن الأسئلة ممتعة وغير مكررة.
      `,
    });
    const selectedText = selectionResponse.text;

    // --- الطلب الثالث: الصياغة النهائية والتحويل لـ JSON مع إرفاق المصادر ---
    onProgress?.("الطلب 3: الصياغة النهائية وتجهيز روابط التحقق...", 10);
    const finalResponse = await ai.models.generateContent({
      model: modelName,
      contents: `
        [الأسئلة المختارة]:
        ${selectedText}

        [المصادر المتاحة]:
        ${JSON.stringify(draftSources)}

        المهمة النهائية:
        1. صغ الأسئلة بأسلوب "الإيجاز الممتع" (أقل من 12 كلمة).
        2. حول النتيجة إلى JSON حصراً:
        { 
          "id_الفئة": [ 
            {
              "points": 100, 
              "question": "...", 
              "answer": "...", 
              "sources": [{"title": "...", "uri": "..."}] 
            }, 
            ... 
          ] 
        }
        ملاحظة: إذا كان السؤال مستمداً من المصادر المتاحة، أرفق الرابط المناسب في حقل sources.
      `,
      config: { responseMimeType: "application/json" }
    });

    const data = extractJSON(finalResponse.text || "{}");

    for (const cat of categories) {
      const questionsRaw = data[cat.id] || [];
      const isListCategory = cat.id.startsWith('list_') || cat.name.includes('تعداد');
      
      const processed = questionsRaw.map((q: any) => ({
        ...q,
        isEnumeration: isListCategory
      }));

      results[cat.id] = processed;

      if (processed.length > 0) {
        await saveUsedQuestions(cat.name, processed.map((p: any) => ({ text: p.question, points: p.points })));
      }
    }
  } catch (error) {
    console.error("Grounding Generation Error:", error);
    categories.forEach(cat => {
      results[cat.id] = [100, 200, 300, 400, 500].map(p => ({
        points: p,
        question: "خطأ في الاتصال بالشبكة، يرجى المحاولة.",
        answer: "تجاوز",
        isEnumeration: false
      }));
    });
  }
  return results;
}

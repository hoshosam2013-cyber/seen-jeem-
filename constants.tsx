
import { Category } from './types';
import { CATEGORIES_METADATA } from './data/categoryMetadata';
import { CATEGORY_PROMPTS } from './data/prompts';
import { CATEGORY_IMAGES } from './data/images';
import { GLOBAL_INSTRUCTIONS } from './data/instructions';

// تصدير التعليمات لكي يتمكن محرك الجيمني من استخدامها
export { GLOBAL_INSTRUCTIONS };

/**
 * وظيفة لجلب الصور المخصصة التي قام المستخدم بحفظها عبر وضع المحرر
 */
const getSavedImages = (): Record<string, string> => {
  try {
    const saved = localStorage.getItem('CUSTOM_CATEGORY_IMAGES');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const savedImages = getSavedImages();

export const CATEGORIES: Category[] = CATEGORIES_METADATA.map(meta => ({
  ...meta,
  prompt: CATEGORY_PROMPTS[meta.id] || "تعليمات إضافية لهذه الفئة: ركز على المعلومات الأكثر إثارة للاهتمام.",
  // الأولوية للصور التي حفظها المستخدم يدوياً، ثم الصور الافتراضية
  imageUrl: savedImages[meta.id] || CATEGORY_IMAGES[meta.id] || ""
}));

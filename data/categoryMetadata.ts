
export interface CategoryMeta {
  id: string;
  name: string;
  group: string;
}

export const CATEGORIES_METADATA: CategoryMeta[] = [
  // موسيقى
  { id: 'trending_songs', name: 'أغاني تريند', group: 'موسيقى' },
  { id: 'revolution_songs', name: 'أغاني الثورة', group: 'موسيقى' },
  { id: 'spacetoon_songs', name: 'أغاني سبيستون', group: 'موسيقى' },

  // دراما وأفلام
  { id: 'egyptian_movies', name: 'أفلام مصرية', group: 'دراما وأفلام' },
  { id: 'syrian_series_pre2010', name: 'مسلسلات سورية قبل 2010', group: 'دراما وأفلام' },
  { id: 'syrian_series_post2010', name: 'مسلسلات سورية بعد 2010', group: 'دراما وأفلام' },
  { id: 'syrian_series_general', name: 'مسلسلات سورية', group: 'دراما وأفلام' },
  { id: 'arabic_art', name: 'فن عربي', group: 'دراما وأفلام' },
  { id: 'zir_salim', name: 'الزير سالم', group: 'دراما وأفلام' },
  { id: 'ramadan_drama', name: 'دراما رمضان', group: 'دراما وأفلام' },
  { id: 'egyptian_series_pre2010', name: 'مسلسلات مصرية قبل 2010', group: 'دراما وأفلام' },
  { id: 'egyptian_series_post2010', name: 'مسلسلات مصرية بعد 2010', group: 'دراما وأفلام' },
  { id: 'egyptian_plays', name: 'مسرحيات مصرية', group: 'دراما وأفلام' },
  { id: 'bab_al_hara', name: 'باب الحارة', group: 'دراما وأفلام' },
  { id: 'list_drama', name: 'تعداد درامي ⏳', group: 'دراما وأفلام' },

  // إسلاميات (تم مطابقتها مع Supabase)
  { id: 'quran_krim', name: 'القرآن الكريم', group: 'إسلاميات' },
  { id: 'hadith_sharif', name: 'الحديث النبوي', group: 'إسلاميات' },
  { id: 'companions_stories', name: 'الصحابة والخلفاء', group: 'إسلاميات' },
  { id: 'islamic_battles', name: 'السيرة النبوية', group: 'إسلاميات' },
  { id: 'islamic_jurisprudence', name: 'الفقه والعبادات', group: 'إسلاميات' },
  { id: 'list_islam', name: 'تعداد إسلامي ⏳', group: 'إسلاميات' },

  // العلوم والتكنولوجيا
  { id: 'general_science', name: 'علوم عامة', group: 'العلوم والتكنولوجيا' },
  { id: 'astronomy', name: 'علم الفلك', group: 'العلوم والتكنولوجيا' },
  { id: 'scientists', name: 'علماء', group: 'العلوم والتكنولوجيا' },
  { id: 'scientific_theories', name: 'نظريات علمية', group: 'العلوم والتكنولوجيا' },
  { id: 'computer_science', name: 'علوم الكمبيوتر', group: 'العلوم والتكنولوجيا' },
  { id: 'ai_tech', name: 'الذكاء الاصطناعي', group: 'العلوم والتكنولوجيا' },
  { id: 'human_body', name: 'جسم الإنسان', group: 'العلوم والتكنولوجيا' },
  { id: 'marine_life', name: 'عالم البحار', group: 'العلوم والتكنولوجيا' },
  { id: 'modern_inventions', name: 'الاختراعات الحديثة', group: 'العلوم والتكنولوجيا' },
  { id: 'fun_chemistry', name: 'الكيمياء الممتعة', group: 'العلوم والتكنولوجيا' },
  { id: 'list_science', name: 'تعداد علمي ⏳', group: 'العلوم والتكنولوجيا' },

  // أنمي
  { id: 'one_piece', name: 'One Piece', group: 'أنمي' },
  { id: 'naruto', name: 'Naruto', group: 'أنمي' },
  { id: 'dragon_ball', name: 'Dragon Ball', group: 'أنمي' },
  { id: 'spongebob', name: 'سبونج بوب', group: 'أنمي' },
  { id: 'tom_jerry', name: 'توم وجيري', group: 'أنمي' },
  { id: 'tmnt', name: 'سلاحف النينجا', group: 'أنمي' },
  { id: 'gumball', name: 'عالم غامبول المدهش', group: 'أنمي' },
  { id: 'cn_arabic', name: 'كارتون نيتورك بالعربية', group: 'أنمي' },
  { id: 'pokemon', name: 'بوكيمون', group: 'أنمي' },
  { id: 'yugioh', name: 'Yu-Gi-Oh', group: 'أنمي' },
  { id: 'aot', name: 'Attack On Titan', group: 'أنمي' },
  { id: 'hxh', name: 'Hunter X Hunter', group: 'أنمي' },
  { id: 'demon_slayer', name: 'Demon Slayer', group: 'أنمي' },
  { id: 'solo_leveling', name: 'Solo Leveling', group: 'أنمي' },
  { id: 'berserk', name: 'Berserk', group: 'أنمي' },
  { id: 'bleach', name: 'Bleach', group: 'أنمي' },
  { id: 'death_note', name: 'Death Note', group: 'أنمي' },
  { id: 'jjk', name: 'Jujutsu Kaisen', group: 'أنمي' },
  { id: 'conan', name: 'المحقق كونان', group: 'أنمي' },
  { id: 'blue_lock', name: 'Blue Lock', group: 'أنمي' },
  { id: 'spirited_away', name: 'Spirited Away', group: 'أنمي' },
  { id: 'list_anime', name: 'تعداد أنمي ⏳', group: 'أنمي' },

  // أفلام وترفيه
  { id: 'starwars', name: 'Star Wars', group: 'أفلام وترفيه' },
  { id: 'johnwick', name: 'John Wick', group: 'أفلام وترفيه' },
  { id: 'darkknight', name: 'Dark Knight', group: 'أفلام وترفيه' },
  { id: 'spiderman', name: 'Spider Man', group: 'أفلام وترفيه' },
  { id: 'dc', name: 'DC', group: 'أفلام وترفيه' },
  { id: 'marvel', name: 'Marvel', group: 'أفلام وترفيه' },
  { id: 'tlou', name: 'The Last of Us', group: 'أفلام وترفيه' },
  { id: 'famous_movies', name: 'أفلام مشهورة', group: 'أفلام وترفيه' },
  { id: 'disney', name: 'أفلام ديزني', group: 'أفلام وترفيه' },
  { id: 'hollywood_stars', name: 'نجوم هوليوود', group: 'أفلام وترفيه' },
  { id: 'harry_potter', name: 'Harry Potter', group: 'أفلام وترفيه' },
  { id: 'inception', name: 'Inception', group: 'أفلام وترفيه' },
  { id: 'lotr', name: 'Lord of the Rings', group: 'أفلام وترفيه' },
  { id: 'titanic', name: 'Titanic', group: 'أفلام وترفيه' },
  { id: 'joker', name: 'Joker', group: 'أفلام وترفيه' },
  { id: 'list_entertainment', name: 'تعداد سينمائي ⏳', group: 'أفلام وترفيه' },

  // معلومات عامة
  { id: 'map_countries', name: 'خرائط دول 🗺️', group: 'معلومات عامة' },
  { id: 'aviation', name: 'عالم الطيران', group: 'معلومات عامة' },
  { id: 'currency', name: 'عملات', group: 'معلومات عامة' },
  { id: 'presidents', name: 'رؤساء الدول', group: 'معلومات عامة' },
  { id: 'gk', name: 'معلومات عامة', group: 'معلومات عامة' },
  { id: 'logos', name: 'شعارات شركات', group: 'معلومات عامة' },
  { id: 'brands', name: 'ماركات عالمية', group: 'معلومات عامة' },
  { id: 'geography', name: 'جغرافيا', group: 'معلومات عامة' },
  { id: 'capitals', name: 'دول وعواصم', group: 'معلومات عامة' },
  { id: 'tourism', name: 'سياحة وسفر', group: 'معلومات عامة' },
  { id: 'flags', name: 'أعلام الدول', group: 'معلومات عامة' },
  { id: 'world_wonders', name: 'عجائب الدنيا', group: 'معلومات عامة' },
  { id: 'global_cuisine', name: 'المطبخ العالمي', group: 'معلومات عامة' },
  { id: 'wars_history', name: 'تاريخ الحروب', group: 'معلومات عامة' },
  { id: 'strange_insects', name: 'حشرات غريبة', group: 'معلومات عامة' },
  { id: 'guinness', name: 'غينيس للأرقام القياسية', group: 'معلومات عامة' },
  { id: 'list_gk', name: 'تعداد عام ⏳', group: 'معلومات عامة' },
  { id: 'list_food', name: 'عدد أكلات ⏳', group: 'معلومات عامة' },
  { id: 'list_countries', name: 'عدد دول ⏳', group: 'معلومات عامة' },

  // ألعاب
  { id: 'rdr2', name: 'Red Dead 2', group: 'ألعاب' },
  { id: 'cod', name: 'Call of Duty', group: 'ألعاب' },
  { id: 'rocketleague', name: 'Rocket League', group: 'ألعاب' },
  { id: 'minecraft', name: 'Minecraft', group: 'ألعاب' },
  { id: 'gow', name: 'God of War', group: 'ألعاب' },
  { id: 'lol', name: 'League of Legends', group: 'ألعاب' },
  { id: 'pubg', name: 'PUBG', group: 'ألعاب' },
  { id: 'tekken', name: 'Tekken', group: 'ألعاب' },
  { id: 'residentevil', name: 'Resident Evil', group: 'ألعاب' },
  { id: 'ark', name: 'ARK', group: 'ألعاب' },
  { id: 'old_games', name: 'ألعاب قديمة', group: 'ألعاب' },
  { id: 'fifa', name: 'FIFA / FC', group: 'ألعاب' },
  { id: 'gtav', name: 'GTA V', group: 'ألعاب' },
  { id: 'elden_ring', name: 'Elden Ring', group: 'ألعاب' },
  { id: 'valorant', name: 'Valorant', group: 'ألعاب' },
  { id: 'overwatch', name: 'Overwatch', group: 'ألعاب' },
  { id: 'fortnite', name: 'Fortnite', group: 'ألعاب' },
  { id: 'list_games', name: 'تعداد ألعاب ⏳', group: 'ألعاب' },

  // رياضة
  { id: 'clasico', name: 'كلاسيكو ريال مدريد وبرشلونة', group: 'رياضة' },
  { id: 'fb_post2010', name: 'كرة القدم (بعد 2010)', group: 'رياضة' },
  { id: 'fb_general', name: 'كرة قدم عامة', group: 'رياضة' },
  { id: 'ballondor', name: 'الكرة الذهبية', group: 'رياضة' },
  { id: 'legends', name: 'أساطير الكرة', group: 'رياضة' },
  { id: 'pl', name: 'الدوري الإنجليزي', group: 'رياضة' },
  { id: 'wc', name: 'كأس العالم', group: 'رياضة' },
  { id: 'ucl', name: 'دوري أبطال أوروبا', group: 'رياضة' },
  { id: 'ufc', name: 'UFC', group: 'رياضة' },
  { id: 'laliga', name: 'الدوري الإسباني', group: 'رياضة' },
  { id: 'seriea', name: 'الدوري الإيطالي', group: 'رياضة' },
  { id: 'bundesliga', name: 'الدوري الألماني', group: 'رياضة' },
  { id: 'nba', name: 'كرة السلة (NBA)', group: 'رياضة' },
  { id: 'f1', name: 'فورمولا 1', group: 'رياضة' },
  { id: 'olympics', name: 'الألعاب الأولمبية', group: 'رياضة' },
  { id: 'list_sports', name: 'تعداد رياضي ⏳', group: 'رياضة' },
  { id: 'list_football', name: 'عدد كرة قدم ⏳', group: 'رياضة' }
];

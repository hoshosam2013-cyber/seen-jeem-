
import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import { Category, GeminiModel } from '../types';
import { audio } from '../services/audio';
import { fetchRemainingRounds, supabase, signInWithGoogle } from '../services/supabase';

interface SetupProps {
  user: any;
  onStart: (team1: string, team2: string, selected: Category[], model: GeminiModel) => void;
}

const Setup: React.FC<SetupProps> = ({ user, onStart }) => {
  const [team1, setTeam1] = useState('الفريق الأول');
  const [team2, setTeam2] = useState('الفريق الثاني');
  
  const [roundsData, setRoundsData] = useState<Record<string, number>>({});
  const [isLoadingRounds, setIsLoadingRounds] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editImages, setEditImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      loadRounds(user.id);
    }

    const currentImages: Record<string, string> = {};
    CATEGORIES.forEach(c => {
      currentImages[c.id] = c.imageUrl || '';
    });
    setEditImages(currentImages);
  }, [user]);

  const loadRounds = async (userId: string) => {
    setIsLoadingRounds(true);
    const data = await fetchRemainingRounds(userId);
    setRoundsData(data);
    setIsLoadingRounds(false);
  };

  const handleGoogleLogin = async () => {
    audio.playClick();
    try {
      // توجيه المستخدم لغوغل
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
      alert("فشل في توجيهك لصفحة تسجيل الدخول. تأكد من إعدادات غوغل كلاود.");
    }
  };

  const handleLogout = async () => {
    audio.playClick();
    await supabase.auth.signOut();
  };

  const handleStartGame = () => {
    if (!user) { alert("يجب تسجيل الدخول عبر غوغل أولاً لمزامنة رصيد الأسئلة."); return; }
    if (selectedIds.length !== 5) { alert("يرجى اختيار 5 فئات للبدء."); return; }
    audio.playTransition();
    onStart(team1, team2, CATEGORIES.filter(c => selectedIds.includes(c.id)), 'gemini-3-flash-preview');
  };

  const toggleCategory = (id: string, isAvailable: boolean) => {
    if (isEditMode) return;
    if (!user) {
        audio.playError();
        alert("يرجى تسجيل الدخول أولاً لرؤية الفئات المتاحة.");
        return;
    }
    if (!isAvailable) {
      audio.playError();
      return;
    }
    audio.playSelect();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 5) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleImageUrlChange = (id: string, url: string) => {
    setEditImages(prev => ({ ...prev, [id]: url }));
  };

  const copyModifiedImages = () => {
    audio.playSuccess();
    const modifications: Record<string, string> = {};
    let count = 0;
    CATEGORIES.forEach(originalCat => {
      const currentUrl = editImages[originalCat.id];
      if (currentUrl && currentUrl !== originalCat.imageUrl) {
        modifications[originalCat.id] = currentUrl;
        count++;
      }
    });
    if (count === 0) { alert("لم تقم بتعديل أي روابط صور."); return; }
    const formattedCode = Object.entries(modifications).map(([id, url]) => `  ${id}: "${url}",`).join('\n');
    navigator.clipboard.writeText(formattedCode).then(() => {
      alert(`تم نسخ تعديلات ${count} فئة!`);
    });
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 min-h-screen items-stretch animate-in fade-in duration-500">
      <div className="lg:col-span-4 xl:col-span-3 space-y-6">
        <div className="glass rounded-[2rem] p-8 shadow-2xl space-y-8 sticky top-6">
          <div className="text-center space-y-2 relative">
            <h1 className="text-4xl font-black text-white italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">تحدي المعلومات</h1>
            <div className="flex items-center justify-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isLoadingRounds ? 'bg-yellow-500' : user ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {isLoadingRounds ? 'جاري المزامنة...' : user ? 'تم الاتصال بالسحابة' : 'بانتظار تسجيل الدخول'}
              </p>
            </div>
            <button 
              onClick={() => { setIsEditMode(!isEditMode); audio.playClick(); }}
              className={`absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl border-2 ${isEditMode ? 'bg-red-500 border-red-400 text-white rotate-90' : 'bg-slate-800 border-yellow-500 text-yellow-500 hover:scale-110'}`}
            >
              {isEditMode ? '✕' : '✎'}
            </button>
          </div>

          {/* User Section - The heart of Authentication */}
          <div className="bg-slate-950/60 rounded-3xl p-6 border border-white/5 space-y-4 shadow-inner relative overflow-hidden group">
            {!user ? (
              <div className="space-y-4">
                 <p className="text-[10px] text-slate-500 text-center font-black uppercase tracking-widest">سجل دخولك لبدء اللعب</p>
                 <button 
                    onClick={handleGoogleLogin}
                    className="w-full py-4 bg-white text-slate-900 rounded-2xl flex items-center justify-center gap-3 font-black text-sm hover:bg-slate-100 transition-all shadow-lg active:scale-95 border-b-4 border-slate-300 active:border-b-0"
                  >
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
                    دخول عبر غوغل
                  </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="relative">
                    <img 
                      src={user.user_metadata.avatar_url} 
                      className="w-14 h-14 rounded-full border-2 border-yellow-500 shadow-lg" 
                      alt="" 
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-slate-900"></div>
                </div>
                <div className="flex-1 overflow-hidden">
                   <p className="text-sm font-black text-white truncate">{user.user_metadata.full_name}</p>
                   <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
                   <button onClick={handleLogout} className="text-[10px] text-red-500 hover:text-red-400 font-bold mt-1 underline">تسجيل الخروج</button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <input value={team1} onChange={e => setTeam1(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-yellow-500/50 transition-colors" placeholder="اسم الفريق الأول" />
            <input value={team2} onChange={e => setTeam2(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-yellow-500/50 transition-colors" placeholder="اسم الفريق الثاني" />
          </div>

          <div className="space-y-4 pt-4">
            {isEditMode ? (
              <button onClick={copyModifiedImages} className="w-full py-6 bg-indigo-600 text-white text-xl font-black rounded-3xl hover:bg-indigo-500 shadow-xl border-b-8 border-indigo-800 active:border-b-0 translate-y-0 active:translate-y-2 transition-all">نسخ التعديلات 📋</button>
            ) : (
              <button
                onClick={handleStartGame}
                disabled={selectedIds.length !== 5 || !user}
                className="w-full py-6 bg-yellow-500 text-slate-950 text-xl font-black rounded-3xl disabled:opacity-30 disabled:grayscale hover:bg-yellow-400 transition-all shadow-2xl border-b-8 border-yellow-700 active:border-b-0 active:translate-y-2 uppercase"
              >
                {user ? 'ابدأ التحدي 🚀' : 'سجل دخولك أولاً'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 xl:col-span-9 glass rounded-[2.5rem] p-6 flex flex-col shadow-2xl border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-white italic tracking-tight">{isEditMode ? 'محرر الأغلفة المخصص' : 'اختر فئات اللعب'}</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">يتم التحقق من مخزون كل فئة عبر السحابة</p>
          </div>
          {!isEditMode && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-2 flex items-center gap-4 shadow-inner">
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-wider">الفئات المختارة</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-yellow-500 leading-none">{selectedIds.length}</span>
                <span className="text-slate-600 font-bold text-xs">/ 5</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-12">
          {Array.from(new Set(CATEGORIES.map(c => c.group))).map(group => (
            <div key={group} className="space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{group}</h3>
                <div className="h-px w-full bg-gradient-to-r from-slate-800 to-transparent"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                {CATEGORIES.filter(c => c.group === group).map(cat => {
                  const remainingRounds = roundsData[cat.name] ?? 0;
                  const isAvailable = remainingRounds > 0;
                  
                  return (
                    <div key={cat.id} className="relative group flex flex-col gap-2">
                      {isEditMode && (
                        <input 
                          type="text"
                          value={editImages[cat.id] || ''}
                          onChange={(e) => handleImageUrlChange(cat.id, e.target.value)}
                          placeholder="رابط الصورة..."
                          className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-2 py-1.5 text-[8px] text-white focus:border-yellow-500 outline-none transition-all placeholder:text-slate-700"
                        />
                      )}
                      <button
                        onClick={() => toggleCategory(cat.id, isAvailable)}
                        disabled={(!isAvailable && !isEditMode) || !user}
                        className={`relative aspect-[3/4] rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                          selectedIds.includes(cat.id) 
                            ? 'border-yellow-400 bg-yellow-500/20 scale-105 shadow-2xl z-10' 
                            : isAvailable && user
                              ? 'border-slate-800 bg-slate-900/60 hover:border-slate-600' 
                              : 'border-slate-900 bg-slate-950 opacity-40 grayscale cursor-not-allowed'
                        }`}
                      >
                        <img 
                          src={editImages[cat.id] || 'https://via.placeholder.com/300x400?text=No+Image'} 
                          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" 
                          alt="" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                        
                        {!isEditMode && user && (
                          <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-[8px] font-black z-20 shadow-lg transition-transform group-hover:scale-110 ${isAvailable ? 'bg-yellow-500 text-slate-950' : 'bg-red-600 text-white'}`}>
                            {remainingRounds} جولة
                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
                          <span className="text-[10px] font-black text-white leading-tight drop-shadow-md">{cat.name}</span>
                        </div>
                        
                        {selectedIds.includes(cat.id) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/10 backdrop-blur-[2px]">
                            <div className="bg-yellow-500 text-slate-950 rounded-full w-8 h-8 flex items-center justify-center text-[14px] font-black shadow-xl border-2 border-white/20 animate-in zoom-in duration-200">✓</div>
                          </div>
                        )}
                        
                        {!user && !isEditMode && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                              <span className="text-[8px] font-bold text-white/60">🔐 سجل دخول</span>
                           </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Setup;

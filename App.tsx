
import React, { useState, useEffect } from 'react';
import Setup from './components/Setup';
import QuestionModal from './components/QuestionModal';
import { GameState, Category, Question, GeminiModel } from './types';
import { fetchBoardFromStock, supabase } from './services/supabase';
import { audio } from './services/audio';

const CategoryHeader: React.FC<{ cat: Category }> = ({ cat }) => (
  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex items-center justify-center text-center group">
    {cat.imageUrl && (
      <img src={cat.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-110" />
    )}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950/90"></div>
    <span className="relative z-10 text-white font-black p-2 text-[10px] sm:text-xs uppercase tracking-tighter leading-tight [text-shadow:0_2px_10_rgba(0,0,0,0.9)]">
      {cat.name}
    </span>
    <div className="absolute top-0 left-0 w-full h-full border border-white/5 rounded-2xl pointer-events-none"></div>
  </div>
);

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const initialState: GameState = {
    team1Name: 'الفريق 1', team2Name: 'الفريق 2',
    team1Score: 0, team2Score: 0,
    currentTeam: 1,
    selectedCategories: [],
    questions: {},
    phase: 'setup',
    activeQuestionId: null,
    selectedModel: 'gemini-3-flash-preview',
  };

  const [state, setState] = useState<GameState>(initialState);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  useEffect(() => {
    // التحقق من الجلسة ومعالجة التوكنات في الرابط (Hash)
    const checkSession = async () => {
      // إذا كان هناك كود في الرابط، نقوم بتبديله بالجلسة (لدعم PKCE)
      if (window.location.hash || window.location.search.includes('code=')) {
        const { data, error } = await supabase.auth.getSession();
        if (data.session) {
          setSession(data.session);
          // تنظيف الرابط فوراً
          window.history.replaceState({}, document.title, window.location.origin);
        }
      } else {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
      }
      setIsAuthLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStart = async (t1: string, t2: string, cats: Category[], model: GeminiModel) => {
    setState(prev => ({ ...prev, team1Name: t1, team2Name: t2, selectedCategories: cats, selectedModel: model, phase: 'loading' }));
    setLoadingProgress(0);
    setLoadingMessage("جاري الاتصال بالمخزن السحابي...");
    
    try {
      const { questions, errors } = await fetchBoardFromStock(cats, (percent) => {
        setLoadingProgress(percent);
        setLoadingMessage(`جاري سحب الأسئلة... ${percent}%`);
      });

      if (errors.length > 0) {
        console.warn("Stock Warning:", errors);
      }

      setLoadingProgress(100);
      setLoadingMessage("تم تجهيز اللوحة!");
      audio.playSuccess();
      
      setTimeout(() => {
        setState(prev => ({ ...prev, questions, phase: 'board' }));
      }, 800);

    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء جلب الأسئلة من المخزن.");
      setState(prev => ({ ...prev, phase: 'setup' }));
    }
  };

  const selectQuestion = (id: string) => {
    const q = state.questions[id];
    if (!q || (q.status !== 'unplayed' && q.questionText !== `عذراً، نفد مخزون الأسئلة لهذه الفئة (${q.points})`)) return;
    
    audio.playClick();
    if (q.status === 'answered-incorrect') {
        audio.playError();
    } else {
        setState(prev => ({ ...prev, activeQuestionId: id }));
    }
  };

  const handleAnswer = (correct: boolean) => {
    const questionId = state.activeQuestionId;
    if (!questionId) return;
    const q = state.questions[questionId];
    
    setState(prev => {
      const isTeam1 = prev.currentTeam === 1;
      const nextQuestions = { ...prev.questions, [questionId]: { ...q, status: (correct ? 'answered-correct' : 'answered-incorrect') as any } };
      const allAnswered = Object.values(nextQuestions).every((item: Question) => item.status !== 'unplayed');
      
      if (allAnswered) audio.playWin();

      return {
        ...prev,
        team1Score: isTeam1 ? prev.team1Score + (correct ? q.points : 0) : prev.team1Score,
        team2Score: !isTeam1 ? prev.team2Score + (correct ? q.points : 0) : prev.team2Score,
        currentTeam: prev.currentTeam === 1 ? 2 : 1,
        questions: nextQuestions,
        activeQuestionId: null,
        phase: allAnswered ? 'finished' : 'board'
      };
    });
  };

  if (isAuthLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs font-black animate-pulse uppercase tracking-[0.2em]">Authenticating with Cloud</p>
      </div>
    </div>
  );

  if (state.phase === 'setup') return <main className="min-h-screen py-10 flex items-center justify-center"><Setup user={session?.user} onStart={handleStart} /></main>;

  if (state.phase === 'loading') return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-10 text-center">
      <div className="relative mb-16">
        <div className="w-40 h-40 border-[8px] border-slate-900 border-t-yellow-500 rounded-full animate-spin shadow-[0_0_30px_rgba(234,179,8,0.2)]"></div>
        <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-yellow-500 font-mono drop-shadow-lg">
          {Math.round(loadingProgress)}%
        </div>
      </div>
      
      <div className="max-w-xl w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-3xl font-black text-white tracking-tight">جاري سحب الأسئلة</h2>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">{loadingMessage}</p>
        
        <div className="relative h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
          <div 
            className="absolute inset-y-0 left-0 bg-yellow-600 transition-all duration-300 ease-out" 
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  if (state.phase === 'board') return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col items-center space-y-10">
      <div className="w-full grid grid-cols-2 gap-6 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-950 border border-slate-800 rounded-full px-4 py-1 text-[10px] font-black text-slate-500">VS</div>
        <div className={`relative overflow-hidden p-6 rounded-[2rem] border-2 transition-all duration-500 ${state.currentTeam === 1 ? 'border-blue-500 bg-blue-600/10 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : 'border-slate-800 bg-slate-900/40 opacity-40 scale-95'}`}>
          <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{state.team1Name}</div>
          <div className="text-5xl font-black text-white font-mono">{state.team1Score}</div>
        </div>
        <div className={`relative overflow-hidden p-6 rounded-[2rem] border-2 transition-all duration-500 ${state.currentTeam === 2 ? 'border-red-500 bg-red-600/10 shadow-[0_0_40px_rgba(239,68,68,0.1)]' : 'border-slate-800 bg-slate-900/40 opacity-40 scale-95'}`}>
          <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">{state.team2Name}</div>
          <div className="text-5xl font-black text-white font-mono">{state.team2Score}</div>
        </div>
      </div>
      <div className="jeopardy-grid w-full">
        {state.selectedCategories.map(cat => <CategoryHeader key={cat.id} cat={cat} />)}
        {[100, 200, 300, 400, 500].map(p => (
          <React.Fragment key={p}>
            {state.selectedCategories.map(cat => {
              const id = `${cat.id}-${p}`;
              const q = state.questions[id];
              const isPlayed = !q || q.status !== 'unplayed';
              const isStockError = q?.questionText?.includes('نفد مخزون');

              return (
                <button
                  key={id}
                  disabled={isPlayed || isStockError}
                  onClick={() => selectQuestion(id)}
                  className={`aspect-video rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                    isStockError 
                      ? 'bg-red-900/20 border-red-900/50 text-red-700 cursor-not-allowed' 
                      : isPlayed 
                        ? 'bg-slate-950 border-slate-900 text-slate-800' 
                        : 'bg-slate-900 border-slate-800 text-yellow-500 hover:border-yellow-500 shadow-xl'
                  }`}
                >
                  {isPlayed ? (
                     <span className="text-2xl font-black">{q.status === 'answered-correct' ? '✓' : '✗'}</span>
                  ) : isStockError ? (
                     <span className="text-xs font-bold">نفد</span>
                  ) : (
                     <span className="text-xl sm:text-3xl font-black font-mono">{p}</span>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      {state.activeQuestionId && <QuestionModal question={state.questions[state.activeQuestionId]} teamName={state.currentTeam === 1 ? state.team1Name : state.team2Name} onClose={handleAnswer} />}
    </div>
  );

  if (state.phase === 'finished') return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-center animate-in zoom-in duration-500">
      <div className="glass p-12 rounded-[3rem] shadow-2xl border-yellow-500/20 max-w-xl w-full">
        <h1 className="text-6xl font-black text-white mb-4 italic tracking-tighter">انتهى السباق!</h1>
        <div className="text-2xl font-bold text-slate-400 mb-8">
          الفائز هو: <span className="text-yellow-500 text-4xl block mt-2">
            {state.team1Score > state.team2Score ? state.team1Name : state.team2Score > state.team1Score ? state.team2Name : 'تعادل خرافي!'}
          </span>
        </div>
        <button onClick={() => { setState(initialState); audio.playClick(); }} className="w-full py-5 bg-white text-slate-950 text-xl font-black rounded-2xl hover:bg-yellow-400 transition-all shadow-xl active:scale-95">جولة جديدة 🔄</button>
      </div>
    </div>
  );

  return null;
};

export default App;

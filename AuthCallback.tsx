
import React, { useEffect, useState } from "react";
import { supabase } from "./services/supabase";

interface AuthCallbackProps {
  onDone: () => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onDone }) => {
  const [msg, setMsg] = useState("جاري التحقق من هويتك...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. إذا كان الرابط يحتوي على "code" (نظام PKCE)
        if (window.location.search.includes("code=")) {
          const { error: authError } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (authError) throw authError;
        } 
        
        // 2. التحقق مما إذا تم الحصول على جلسة (سواء من الكود أو التوكن التلقائي)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session) {
          setMsg("تم التحقق بنجاح! جاري دخول اللعبة...");
          // تنظيف الرابط من أي بارامترات
          window.history.replaceState({}, document.title, window.location.origin);
          setTimeout(onDone, 1000);
        } else {
          // إذا لم نجد جلسة بعد 3 ثوانٍ، قد يكون الرابط منتهي الصلاحية
          setTimeout(() => {
            setError("رابط الدخول منتهي الصلاحية أو غير صالح.");
            setMsg("فشل الدخول.");
          }, 3000);
        }
      } catch (e: any) {
        console.error("Auth Callback Error:", e);
        setMsg("حدث خطأ أثناء تسجيل الدخول.");
        setError(e.message || "يرجى طلب رابط جديد.");
      }
    };

    handleCallback();
  }, [onDone]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 text-center">
      <div className="glass p-10 md:p-14 rounded-[3.5rem] border-yellow-500/20 max-w-md w-full space-y-8 animate-in zoom-in duration-500 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/10 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full"></div>

        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border-4 relative z-10 ${error ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
          <span className={`text-4xl ${!error && 'animate-bounce'}`}>{error ? '⚠️' : '🔐'}</span>
        </div>
        
        <div className="space-y-3 relative z-10">
           <h3 className={`text-2xl font-black ${error ? 'text-red-400' : 'text-white'} italic tracking-tight`}>{msg}</h3>
           {error && (
             <p className="text-red-500/60 text-xs font-bold bg-red-500/5 py-3 px-4 rounded-xl border border-red-500/10">
               {error}
             </p>
           )}
        </div>

        {!error ? (
          <div className="flex flex-col items-center gap-4 relative z-10">
            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-yellow-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Processing Secure Magic Link</p>
          </div>
        ) : (
          <button 
            onClick={() => window.location.href = window.location.origin}
            className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl transition-all active:scale-95 shadow-xl hover:bg-yellow-400 relative z-10"
          >
            طلب رابط جديد
          </button>
        )}
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;

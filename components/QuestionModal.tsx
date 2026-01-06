import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { audio } from '../services/audio';

interface QuestionModalProps {
  question: Question;
  teamName: string;
  onClose: (correct: boolean) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ question, teamName, onClose }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    audio.playOpen();
    if (question.isEnumeration) setTimeLeft(30);
    
    // إعداد الصوت إذا كان موجوداً برابط مباشر
    if (question.audioUrl) {
      audioRef.current = new Audio(question.audioUrl);
      audioRef.current.onended = () => setIsPlayingAudio(false);
      audioRef.current.onerror = () => {
        console.error("Audio failed to load");
        setIsPlayingAudio(false);
      };
    }

    return () => {
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, [question]);

  const startTimer = () => {
    if (timerRunning || timeLeft === 0) return;
    setTimerRunning(true);
    audio.playClick();
    timerIntervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev !== null && prev <= 1) {
          window.clearInterval(timerIntervalRef.current!);
          setTimerRunning(false);
          audio.playError();
          return 0;
        }
        audio.playTick();
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);
  };

  const handleResult = (correct: boolean) => {
    if (correct) audio.playSuccess();
    else audio.playError();
    onClose(correct);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audio.playClick();
      audioRef.current.play().catch(e => console.error("Playback failed", e));
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-white/10 flex flex-col overflow-hidden max-h-[95vh] shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        
        {/* Header */}
        <div className="bg-slate-800/50 p-6 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 text-slate-950 px-5 py-2 rounded-full font-black text-xl shadow-lg shadow-yellow-500/30">
              {question.points} <span className="text-[10px] opacity-70">PTS</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-slate-500 text-[10px] font-black uppercase block tracking-widest">المستجيب</span>
            <span className="text-white font-bold text-lg">{teamName}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 md:p-8 flex flex-col items-center text-center overflow-y-auto custom-scrollbar">
          
          {/* Timer for Enumeration */}
          {question.isEnumeration && (
            <div className="mb-6 w-full max-w-sm">
              <div className="flex justify-between items-end mb-2 px-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">مؤقت التعداد</span>
                <span className={`text-4xl font-black font-mono transition-colors ${timeLeft === 0 ? 'text-red-500' : 'text-yellow-500'}`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/10 shadow-inner">
                <div 
                  className={`h-full transition-all duration-1000 shadow-[0_0_15px_rgba(234,179,8,0.5)] ${timeLeft && timeLeft < 10 ? 'bg-red-500' : 'bg-yellow-500'}`}
                  style={{ width: `${(timeLeft || 0) / 30 * 100}%` }}
                ></div>
              </div>
              {!timerRunning && timeLeft === 30 && (
                <button onClick={startTimer} className="mt-4 px-6 py-2 bg-yellow-500 text-slate-950 text-xs font-black rounded-full hover:bg-yellow-400 transition-all shadow-lg active:scale-95">ابدأ المؤقت ▶</button>
              )}
            </div>
          )}

          {/* Media: Image Display (Square Format) */}
          {question.imageUrl && (
            <div className="mb-8 w-full max-w-[380px] group relative">
              <div className="relative aspect-square rounded-[2rem] overflow-hidden border-4 border-slate-700 bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500 hover:scale-[1.02] flex items-center justify-center">
                <img 
                  src={question.imageUrl} 
                  alt="Challenge" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('Image Load Error');
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Overlay for subtle depth */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]"></div>
              </div>
              {/* Background Glow */}
              <div className="absolute -inset-4 bg-indigo-500/5 blur-3xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          )}

          {/* Media: Video Control */}
          {question.videoUrl && (
            <div className="mb-6 w-full max-w-[480px]">
              {!showVideo ? (
                <button 
                  onClick={() => { setShowVideo(true); audio.playClick(); }}
                  className="group relative flex items-center justify-center gap-4 w-full py-5 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl text-white font-black text-lg hover:scale-105 transition-all shadow-xl shadow-red-600/30"
                >
                  <span className="text-3xl animate-pulse">🎬</span>
                  مشاهدة الفيديو المرفق
                </button>
              ) : (
                <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-red-500/40 shadow-2xl animate-in zoom-in duration-300">
                  <video src={question.videoUrl} controls autoPlay className="w-full h-full bg-black shadow-inner" />
                  <button 
                    onClick={() => setShowVideo(false)}
                    className="absolute top-3 right-3 bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10 backdrop-blur-md"
                  >✕</button>
                </div>
              )}
            </div>
          )}

          {/* Media: Audio Control */}
          {question.audioUrl && (
            <div className="mb-6">
              <button 
                onClick={toggleAudio}
                className={`flex items-center gap-5 px-10 py-5 rounded-full border-2 transition-all duration-300 ${isPlayingAudio ? 'bg-indigo-600 border-white scale-110 shadow-[0_0_30px_rgba(79,70,229,0.5)]' : 'bg-slate-800 border-indigo-500 hover:bg-slate-700 hover:shadow-xl'}`}
              >
                <div className="relative">
                    <span className="text-3xl">{isPlayingAudio ? '🔊' : '🎵'}</span>
                </div>
                <span className="text-white font-black text-lg tracking-tight">{isPlayingAudio ? 'جاري الاستماع...' : 'استمع للمقطع الصوتي'}</span>
              </button>
            </div>
          )}

          {/* Question Text */}
          <h2 className={`font-black text-white leading-[1.3] mb-8 transition-all drop-shadow-2xl ${question.isEnumeration ? 'text-xl md:text-2xl' : 'text-2xl md:text-4xl'}`}>
            {question.questionText}
          </h2>

          {/* Answer Area */}
          {showAnswer && (
            <div className="w-full p-8 md:p-10 bg-slate-950/80 rounded-[3rem] border border-green-500/30 animate-in slide-in-from-bottom-8 duration-700 shadow-[0_0_50px_rgba(34,197,94,0.15)] backdrop-blur-sm">
              <p className="text-[11px] text-slate-500 mb-4 uppercase font-black tracking-[0.3em]">الإجابة النموذجية</p>
              <p className="text-2xl md:text-4xl font-black text-green-400 whitespace-pre-wrap mb-4 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                {question.answerText}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-800/40 border-t border-white/5 backdrop-blur-md">
          {!showAnswer ? (
            <button 
              onClick={() => { setShowAnswer(true); audio.playSelect(); }} 
              className="w-full py-6 bg-indigo-600 text-white font-black text-2xl rounded-[2rem] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20 active:scale-[0.98]"
            >
              كشف الإجابة
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <button 
                onClick={() => handleResult(true)} 
                className="py-7 bg-green-600 text-white font-black text-2xl rounded-[2rem] hover:bg-green-500 transition-all shadow-xl border-b-8 border-green-800 active:border-b-0 active:translate-y-1"
              >
                إجابة صحيحة ✓
              </button>
              <button 
                onClick={() => handleResult(false)} 
                className="py-7 bg-red-600 text-white font-black text-2xl rounded-[2rem] hover:bg-red-500 transition-all shadow-xl border-b-8 border-red-800 active:border-b-0 active:translate-y-1"
              >
                إجابة خاطئة ✗
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;

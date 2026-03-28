import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { questions } from './data/questions';
import { ResultPage } from './components/ResultPage';
import { PremiumStrategy } from './components/PremiumStrategy';
import { fetchUserState, saveTestResult, checkPaymentStatus } from './lib/api';

// Generate a simple UUID-like string for anonymous user
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// --- Components ---

const PlayingCard = ({ rank, suit, color, rotate, size = 'normal', facedown = false }: any) => {
  const isSmall = size === 'small';

  if (facedown) {
    return (
      <motion.div
        translate="no"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0, rotate }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`
          ${isSmall ? 'w-14 h-20 rounded-lg p-1 border-b-2' : 'w-24 h-36 rounded-2xl p-2 border-b-4'} 
          bg-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex flex-col justify-center items-center border-zinc-200 transform origin-bottom
        `}
      >
        <div className="w-full h-full rounded-sm bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center overflow-hidden relative border border-indigo-300/50">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, white 2px, white 4px)' }} />
          <div className="w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-sm z-10">
            <div className="w-2 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      translate="no"
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0, rotate }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`
        ${isSmall ? 'w-14 h-20 rounded-lg p-1.5 border-b-2' : 'w-24 h-36 rounded-2xl p-2.5 border-b-4'} 
        bg-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex flex-col justify-between border-zinc-200 ${color} transform origin-bottom
      `}
    >
      <div className={`${isSmall ? 'text-xl' : 'text-4xl'} font-normal leading-none tracking-tighter`}>{rank}</div>
      <div className={`${isSmall ? 'text-2xl' : 'text-4xl'} self-center`}>{suit}</div>
      <div className={`${isSmall ? 'text-xl' : 'text-4xl'} font-normal leading-none tracking-tighter self-end rotate-180`}>{rank}</div>
    </motion.div>
  );
};

const HomePage: React.FC<{ onStart: () => void, hasLastResult?: boolean, onRestore?: () => void }> = ({ onStart, hasLastResult, onRestore }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center h-full p-8 text-center relative z-10"
  >
    <div className="mb-12 relative">
      <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center shadow-2xl">
        <span className="text-6xl drop-shadow-lg">♠️</span>
      </div>
    </div>

    <h1 className="text-4xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
      德州牌桌玩家画像
    </h1>
    
    <p className="text-indigo-100/90 mb-16 text-base tracking-wide font-medium drop-shadow-sm">
      1分钟用真实牌局，还原你的决策习惯
    </p>

    <div className="w-full max-w-[280px] flex flex-col gap-4">
      <button
        onClick={onStart}
        className="w-full bg-zinc-900 text-white font-bold text-lg py-4 rounded-full shadow-2xl active:scale-95 transition-transform border border-zinc-700/50 tracking-widest"
      >
        进入牌桌
      </button>

      {hasLastResult && onRestore && (
        <button
          onClick={onRestore}
          className="w-full bg-white/10 text-white font-bold text-sm py-3 rounded-full shadow-lg active:scale-95 transition-transform border border-white/20 tracking-widest hover:bg-white/20 backdrop-blur-md"
        >
          恢复上次测试结果
        </button>
      )}
    </div>
  </motion.div>
);

const TestPage = ({ question, currentIndex, total, onAnswer, onBack }: any) => {
  // Calculate rotations for community cards to create a slight arc
  const getCommunityCardRotation = (index: number, totalCards: number) => {
    if (totalCards === 0) return 0;
    const middle = (totalCards - 1) / 2;
    return (index - middle) * 4; // 4 degrees per card
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full p-4 relative z-10"
    >
      {/* Top Bar: Back Button & Progress */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <button 
          onClick={onBack}
          disabled={currentIndex === 0}
          className={`p-2 rounded-full backdrop-blur-md transition-colors ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'bg-white/20 text-white hover:bg-white/30'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex-1 mx-4">
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              initial={{ width: `${((currentIndex) / total) * 100}%` }}
              animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        
        <span className="text-white text-sm font-bold tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
          {currentIndex + 1}/{total}
        </span>
      </div>

      {/* Scenario & Position */}
      <div className="text-center mb-1 shrink-0">
        <div className="flex justify-center gap-2 mb-2">
          <div className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-white shadow-sm backdrop-blur-md">
            {question.players}
          </div>
          <div className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-white shadow-sm backdrop-blur-md">
            筹码 {question.stack}
          </div>
          <div className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-white shadow-sm backdrop-blur-md">
            {question.position}
          </div>
        </div>
        <div className="px-2 text-left">
          <h2 className="text-lg font-bold text-white leading-relaxed drop-shadow-lg">
            {question.scenario}
          </h2>
        </div>
      </div>

      {/* Play Area (Community + Player Cards) */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-[200px] w-full my-1">
        {/* Table Edge (Glassmorphism Arc) */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[160%] h-[500px] rounded-[100%] border-t-[2px] border-white/30 bg-gradient-to-b from-white/5 to-transparent shadow-[inset_0_40px_50px_-30px_rgba(255,255,255,0.2)] backdrop-blur-md pointer-events-none" />

        {/* Community Cards */}
        <div className="absolute top-0 flex justify-center gap-2 w-full px-4 z-10">
          {question.communityCards && question.communityCards.length > 0 ? (
            question.communityCards.map((card: any, idx: number) => (
              <PlayingCard 
                key={`comm-${idx}`} 
                {...card} 
                size="small" 
                rotate={getCommunityCardRotation(idx, question.communityCards.length)} 
              />
            ))
          ) : (
            [0, 1, 2].map((idx) => (
              <PlayingCard 
                key={`facedown-${idx}`} 
                facedown
                size="small" 
                rotate={getCommunityCardRotation(idx, 3)} 
              />
            ))
          )}
        </div>

        {/* Player Cards */}
        <div className="absolute bottom-0 flex justify-center gap-[-15px] z-20">
          {question.cards && question.cards.length === 2 ? (
            <>
              <PlayingCard {...question.cards[0]} rotate={-8} />
              <div className="-ml-8 z-10 mt-4">
                <PlayingCard {...question.cards[1]} rotate={8} />
              </div>
            </>
          ) : (
            <>
              <PlayingCard facedown rotate={-8} />
              <div className="-ml-8 z-10 mt-4">
                <PlayingCard facedown rotate={8} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Options (Pill style action bar) */}
      <div className="mt-auto shrink-0 bg-zinc-900/95 backdrop-blur-xl p-2 pb-2 rounded-2xl shadow-2xl border border-zinc-700/50">
        <div className="grid grid-cols-1 gap-1.5 mb-1.5">
          {question.options.map((opt: any, idx: number) => (
            <button
              key={idx}
              onClick={() => onAnswer(opt.scores)}
              className="w-full bg-zinc-800/50 hover:bg-zinc-700/80 py-2.5 px-4 rounded-xl text-center font-bold active:scale-[0.98] transition-all flex justify-center items-center text-[15px]"
            >
              <span className="text-white">{opt.text}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-zinc-400/80 text-[10px] tracking-wider">
          没有标准答案，选你平时更接近的打法
        </p>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<'home' | 'test' | 'result' | 'premium'>('home');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>[]>([]);
  
  // New States for Frontend 收口
  const [userId, setUserId] = useState<string>('');
  const [hasPaid, setHasPaid] = useState<boolean>(false);
  const [lastResultType, setLastResultType] = useState<string | null>(null);

  // Initialize local state + backend sync
  useEffect(() => {
    // 1. Check or create anonymous user_id
    let storedUserId = localStorage.getItem('user_id');
    if (!storedUserId) {
      storedUserId = generateId();
      localStorage.setItem('user_id', storedUserId);
    }
    setUserId(storedUserId);

    // 2. Read local cache first (fast restore, no blank screen)
    const storedHasPaid = localStorage.getItem('hasPaid') === 'true';
    setHasPaid(storedHasPaid);

    const storedLastResultType = localStorage.getItem('lastResultType');
    if (storedLastResultType) {
      setLastResultType(storedLastResultType);
    }

    const storedAnswers = localStorage.getItem('lastAnswers');
    if (storedAnswers) {
      try {
        setAnswers(JSON.parse(storedAnswers));
      } catch (e) {
        console.error('Failed to parse lastAnswers', e);
      }
    }

    // 3. Async: sync with Supabase (backend is source of truth)
    const syncWithBackend = async (uid: string) => {
      try {
        const state = await fetchUserState(uid);
        // Backend overrides local if different
        if (state.hasPaid !== storedHasPaid) {
          setHasPaid(state.hasPaid);
          localStorage.setItem('hasPaid', String(state.hasPaid));
        }
        if (state.lastResultType && state.lastResultType !== storedLastResultType) {
          setLastResultType(state.lastResultType);
          localStorage.setItem('lastResultType', state.lastResultType);
        }
        if (state.lastAnswers) {
          setAnswers(state.lastAnswers);
          localStorage.setItem('lastAnswers', JSON.stringify(state.lastAnswers));
        }
      } catch (err) {
        console.warn('Backend sync failed, using local cache:', err);
      }
    };

    syncWithBackend(storedUserId);

    // 4. Check if returning from payment (URL contains out_trade_no)
    const urlParams = new URLSearchParams(window.location.search);
    const outTradeNo = urlParams.get('out_trade_no');
    if (outTradeNo) {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
      // Check payment status
      checkPaymentStatus(outTradeNo).then((result) => {
        if (result.hasPaid) {
          setHasPaid(true);
          localStorage.setItem('hasPaid', 'true');
          setScreen('premium'); // 支付成功自动进入策略页
        } else if (storedLastResultType || storedAnswers) {
          setScreen('result'); // 没支付成功但有结果，回到结果页（也就是他们离开前的页面）
        }
      }).catch((err) => {
        console.warn('Payment check failed:', err);
        if (storedLastResultType || storedAnswers) {
          setScreen('result');
        }
      });
    }
  }, []);

  const handleStart = () => {
    setScreen('test');
    setCurrentQ(0);
    setAnswers([]);
  };

  const handleRestoreResult = () => {
    if (hasPaid) {
      setScreen('premium');
    } else {
      setScreen('result');
    }
  };

  const handleAnswer = (optionScores: Record<string, number>) => {
    const newAnswers = [...answers, optionScores];
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Save results to local storage
      localStorage.setItem('lastAnswers', JSON.stringify(newAnswers));
      setScreen('result');
    }
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setAnswers(answers.slice(0, -1));
      setCurrentQ(currentQ - 1);
    }
  };

  // Called by ResultPage after successful payment verification
  const handleUnlockSuccess = useCallback(() => {
    setHasPaid(true);
    localStorage.setItem('hasPaid', 'true');
    setScreen('premium');
  }, []);

  // Called by ResultPage to notify App of finalType for backend save
  const handleResultReady = useCallback((finalType: string) => {
    setLastResultType(finalType);
    localStorage.setItem('lastResultType', finalType);
    // Save to backend (fire-and-forget)
    if (userId) {
      saveTestResult(userId, finalType, answers).catch((err) =>
        console.warn('Failed to save result to backend:', err)
      );
    }
  }, [userId, answers]);

  return (
    <div className="h-[100dvh] bg-zinc-900 flex justify-center font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Main Container with the reference gradient background */}
      <div className="w-full max-w-md bg-gradient-to-br from-[#b597f6] via-[#a78bfa] to-[#96c6fa] relative overflow-hidden shadow-2xl h-full flex flex-col">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <HomePage 
              key="home" 
              onStart={handleStart} 
              hasLastResult={!!lastResultType || answers.length > 0}
              onRestore={handleRestoreResult}
            />
          )}
          {screen === 'test' && (
            <TestPage
              key={`test-${currentQ}`}
              question={questions[currentQ]}
              currentIndex={currentQ}
              total={questions.length}
              onAnswer={handleAnswer}
              onBack={handleBack}
            />
          )}
          {screen === 'result' && (
            <ResultPage
              key="result"
              answers={answers}
              hasPaid={hasPaid}
              userId={userId}
              onRestart={handleStart}
              onUnlockSuccess={handleUnlockSuccess}
              onResultReady={handleResultReady}
            />
          )}
          {screen === 'premium' && (
            <PremiumStrategy
              key="premium"
              answers={answers}
              questions={questions}
              onBack={() => setScreen('result')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


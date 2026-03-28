import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Crown, CheckCircle2, XCircle, ArrowRight,
  Target, Shield, Swords, TrendingUp, AlertTriangle, Lightbulb, Zap, Quote, BookOpen, X
} from 'lucide-react';
import { getFinalResult } from '../lib/scoring';
import { premiumData } from '../data/premium';

interface PremiumStrategyProps {
  answers: Record<number, any>;
  questions: any[];
  onBack: () => void;
}

// Highlight variants for different aesthetic contexts
type HighlightVariant =
  | 'subtle-zinc'
  | 'glow-amber'
  | 'soft-emerald'
  | 'soft-rose'
  | 'code-zinc'
  | 'wavy-rose'
  | 'marker-emerald'
  | 'line-purple'
  | 'line-amber'
  | 'gradient-text'
  | 'bold-amber'
  | 'marker-amber';

const renderHighlight = (text: string, variant: HighlightVariant = 'bold-amber') => {
  if (!text) return null;
  const parts = text.split(/\*\*(.*?)\*\*/g);

  const styles: Record<HighlightVariant, string> = {
    'subtle-zinc': 'text-zinc-200 font-medium border-b border-zinc-700',
    'glow-amber': 'text-amber-300 font-semibold drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]',
    'soft-emerald': 'text-emerald-300 font-medium bg-emerald-500/10 px-1 rounded border border-emerald-500/10',
    'soft-rose': 'text-rose-300 font-medium bg-rose-500/10 px-1 rounded border border-rose-500/10',
    'code-zinc': 'text-zinc-200 font-medium bg-zinc-800/80 px-1 rounded border border-zinc-700',
    'wavy-rose': 'text-rose-300 font-medium underline decoration-rose-500/50 decoration-wavy underline-offset-4',
    'marker-emerald': 'text-emerald-100 font-semibold bg-emerald-500/20 px-1 rounded-sm',
    'line-purple': 'text-purple-200 font-medium border-b border-purple-500/50',
    'line-amber': 'text-amber-200 font-medium border-b border-amber-500/50',
    'gradient-text': 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400 font-bold',
    'bold-amber': 'text-amber-400 font-bold',
    'marker-amber': 'text-amber-100 font-bold bg-amber-500/20 px-1 rounded-sm border-b-2 border-amber-500/40',
  };

  return (
    <>
      {parts.map((part, i) => 
        i % 2 === 1 ? (
          <span key={i} className={styles[variant]}>{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export const PremiumStrategy: React.FC<PremiumStrategyProps> = ({ answers, questions, onBack }) => {
  const { finalType } = getFinalResult(answers, questions);
  const data = premiumData[finalType] || premiumData['NIT'];
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Icons for the profile bento grid
  const profileIcons = [Target, Shield, Swords, TrendingUp];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-[#0a0510] overflow-y-auto relative z-10"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0510]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors text-zinc-400"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-zinc-200 tracking-wider">你的专属进阶策略</span>
        </div>
        <div className="w-9" />
      </div>

      <div className="px-0 py-0 pb-0 flex flex-col">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-[#0a0510] px-5 py-8 text-center w-full border-b border-purple-900/40">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0510]/80 to-[#0a0510] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)] backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              <span className="text-sm text-purple-300 font-bold tracking-widest uppercase">
                {data.heroSubtitle}
              </span>
            </div>
            
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 tracking-tight drop-shadow-sm">
              {data.heroTitle}
            </h1>
          </div>
        </div>

        {/* 1. 决策画像 -> 你的风格双刃剑 */}
        <section className="w-full px-4 py-4 border-b border-purple-900/30 bg-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-3.5 bg-zinc-500 rounded-full" />
            <h2 className="text-base font-bold text-zinc-100 tracking-wider">你的风格双刃剑</h2>
          </div>
          <div className="flex flex-col border-y border-purple-900/40 bg-purple-950/20 -mx-4 px-4">
            {data.profile.table.map((row: any, idx: number) => {
              const Icon = profileIcons[idx % profileIcons.length];
              return (
                <div key={idx} className={`py-2.5 flex flex-col gap-1 ${idx !== data.profile.table.length - 1 ? 'border-b border-purple-900/30' : ''}`}>
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-amber-500/80" />
                    <span className="text-sm font-bold text-zinc-200">{row.label}</span>
                  </div>
                  <span className="text-sm text-zinc-400 leading-normal">{renderHighlight(row.value, 'subtle-zinc')}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl flex items-start gap-2 w-full">
            <div className="w-1 h-full min-h-[16px] bg-amber-500/50 rounded-full shrink-0" />
            <p className="text-sm text-amber-100/90 font-medium leading-normal">
              {renderHighlight(data.profile.summary, 'glow-amber')}
            </p>
          </div>
        </section>

        {/* 2. 决策结构缺口 -> 你的优势与瓶颈 */}
        <section className="w-full px-4 py-4 border-b border-purple-900/30 bg-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-3.5 bg-zinc-500 rounded-full" />
            <h2 className="text-base font-bold text-zinc-100 tracking-wider">你的优势与瓶颈</h2>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <div className="bg-purple-950/30 border border-purple-900/40 rounded-xl p-3 flex gap-3 items-start relative overflow-hidden w-full">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50" />
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="w-full">
                <span className="text-sm font-bold text-zinc-200 block mb-1.5">已具备的护城河</span>
                <ul className="space-y-1 w-full">
                  {data.gap.good.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-zinc-400 leading-normal">{renderHighlight(item, 'soft-emerald')}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-purple-950/30 border border-purple-900/40 rounded-xl p-3 flex gap-3 items-start relative overflow-hidden w-full">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/50" />
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="w-full">
                <span className="text-sm font-bold text-zinc-200 block mb-1.5">致命的短板</span>
                <ul className="space-y-1 w-full">
                  {data.gap.bad.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-zinc-400 leading-normal">{renderHighlight(item, 'soft-rose')}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 三个关键亏损场景 (Problem/Solution Cards) */}
        <section className="w-full px-4 py-4 border-b border-purple-900/30 bg-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-3.5 bg-zinc-500 rounded-full" />
            <h2 className="text-base font-bold text-zinc-100 tracking-wider">关键亏损场景</h2>
          </div>
          <div className="space-y-2 w-full">
            {data.scenarios.map((scenario: any, idx: number) => (
              <div key={idx} className="bg-purple-950/30 border border-purple-900/40 rounded-xl p-3 w-full">
                <h3 className="text-base font-bold text-zinc-100 mb-2 flex items-center gap-2">
                  <span className="text-amber-500 font-black text-base">0{idx + 1}</span>
                  {scenario.title}
                </h3>
                
                {/* Example */}
                {scenario.example && (
                  <div className="mb-2 bg-black/40 rounded-lg p-2.5 border border-white/5 w-full">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">牌局举例</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-normal">{renderHighlight(scenario.example, 'code-zinc')}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 w-full">
                  <div className="bg-rose-500/5 rounded-lg p-2.5 border border-rose-500/10 flex gap-2 items-start w-full">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="w-full">
                      <span className="text-sm font-bold text-rose-400/80 uppercase tracking-wider block mb-1">当前痛点</span>
                      <p className="text-sm text-zinc-300 leading-normal">
                        <span className="text-zinc-400 block mb-2">表现：{renderHighlight(scenario.current, 'soft-rose')}</span>
                        <span className="text-rose-300 font-medium">导致：{renderHighlight(scenario.problem, 'soft-rose')}</span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-emerald-500/5 rounded-lg p-2.5 border border-emerald-500/10 flex gap-2 items-start w-full">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="w-full">
                      <span className="text-sm font-bold text-emerald-400/80 uppercase tracking-wider block mb-1">优化建议</span>
                      <p className="text-sm text-emerald-100/90 font-medium leading-normal">
                        {renderHighlight(scenario.advice, 'marker-emerald')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 线下局剥削结论 (Insight Banner) -> 线下实战的真相 */}
        <section className="w-full px-4 py-4 border-b border-purple-900/30 bg-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
            <h2 className="text-base font-bold text-zinc-100 tracking-wider">线下实战的真相</h2>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/20 to-zinc-900 border border-purple-500/20 p-3 w-full mb-2">
            <Quote className="absolute -top-2 -right-2 w-12 h-12 text-purple-500/10 rotate-12" />
            <div className="space-y-2 relative z-10 w-full">
              <div className="w-full">
                <span className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-purple-400" />
                  {data.exploit.items[0].label}
                </span>
                <p className="text-sm text-zinc-300 mt-1 font-medium leading-normal">{renderHighlight(data.exploit.items[0].value, 'line-purple')}</p>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-purple-500/20 to-transparent" />
              <div className="w-full">
                <span className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  {data.exploit.items[1].label}
                </span>
                <p className="text-sm text-amber-100/90 mt-1 font-medium leading-normal">{renderHighlight(data.exploit.items[1].value, 'line-amber')}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-center text-zinc-400 font-medium px-2 leading-normal">
            {renderHighlight(data.exploit.summary, 'gradient-text')}
          </p>
        </section>

        {/* 5. 可执行打法 (Action Cards) -> 马上能用的3个实战技巧 */}
        <section className="w-full px-4 py-4 border-b border-purple-900/30 bg-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-3.5 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
            <h2 className="text-base font-bold text-zinc-100 tracking-wider">马上能用的3个实战技巧</h2>
          </div>
          <div className="space-y-2 w-full">
            {data.rules.map((rule: any, idx: number) => (
              <div key={idx} className="bg-purple-950/30 rounded-xl p-3 border border-purple-900/40 relative overflow-hidden w-full">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 blur-[30px] rounded-full pointer-events-none" />
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <span className="text-amber-400 font-black text-sm">{idx+1}</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-100">{rule.title}</h3>
                </div>
                
                <p className="text-sm text-zinc-400 mb-2 leading-normal">{renderHighlight(rule.desc, 'bold-amber')}</p>
                
                {rule.example && (
                  <div className="mb-2 bg-black/40 rounded-lg p-2.5 border border-white/5 w-full">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">实战举例</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-normal">{renderHighlight(rule.example, 'code-zinc')}</p>
                  </div>
                )}

                <div className="bg-amber-500/10 rounded-lg p-2.5 flex items-start gap-2 border border-amber-500/20 w-full">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="w-full">
                    <span className="text-sm font-bold text-amber-500/80 uppercase tracking-wider block mb-1">执行动作</span>
                    <span className="text-sm font-bold text-amber-100 leading-normal">{renderHighlight(rule.action, 'marker-amber')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. 总结句 */}
        <section className="w-full px-4 pt-2 pb-4 bg-transparent">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-900/40"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0a0510] px-3 text-zinc-600">
                <Crown className="w-4 h-4" />
              </span>
            </div>
          </div>
          <div className="text-center mt-4">
            {data.finalQuote.split('\n').map((line: string, i: number) => (
              <p key={i} className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500 leading-normal tracking-wide">
                {line}
              </p>
            ))}
          </div>
        </section>

        {/* Bottom Button */}
        <div className="w-full px-4 pt-2 pb-8">
          <button 
            onClick={() => setIsQrModalOpen(true)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-base shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-shadow flex items-center justify-center gap-2"
          >
            加入策略交流群
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {isQrModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsQrModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsQrModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-48 h-48 mx-auto bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center mb-4 overflow-hidden relative">
                {/* Placeholder for QR Code */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #a855f7 10px, #a855f7 20px)' }} />
                <span className="text-zinc-500 font-medium relative z-10 text-base">二维码占位区</span>
              </div>
              
              <p className="text-base text-zinc-400 text-center">
                长按可保存图片
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Check, Download, RotateCcw, Swords, Bomb, Rocket, X, Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { getFinalResult } from '../lib/scoring';
import { questions } from '../data/questions';
import { resultsData } from '../data/results';
import { createPayment, isWechatBrowser } from '../lib/api';

export const ResultPage: React.FC<{ 
  answers: Record<string, number>[], 
  hasPaid: boolean,
  userId: string,
  onRestart: () => void, 
  onUnlockSuccess: () => void,
  onResultReady: (finalType: string) => void,
}> = ({ answers, hasPaid, userId, onRestart, onUnlockSuccess, onResultReady }) => {
  const { finalType, tiltFlag } = getFinalResult(answers, questions);
  const resultInfo = resultsData[finalType] || resultsData['LAG_FISH'];

  // Notify parent of finalType for backend save
  useEffect(() => {
    onResultReady(finalType);
  }, [finalType, onResultReady]);

  // Save the last result type to local storage whenever we render this page
  useEffect(() => {
    localStorage.setItem('lastResultType', finalType);
  }, [finalType]);

  // Frontend states
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [saveImageStatus, setSaveImageStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const match = resultInfo.name.match(/(.+?)（(.+?)）/);
  const prefix = match ? match[1] : resultInfo.name;
  const mainName = match ? match[2] : resultInfo.name;

  const displayComment = tiltFlag ? (
    <>
      {resultInfo.comment}
      <br />
      <span className="text-rose-300/90 text-[11px] mt-1 inline-block">⚠️ 易受情绪影响，注意防范上头</span>
    </>
  ) : (
    resultInfo.comment
  );

  const handleDownload = async () => {
    if (saveImageStatus === 'generating') return;
    
    setSaveImageStatus('generating');
    const element = document.getElementById('result-snapshot');
    if (!element) {
      setSaveImageStatus('error');
      setTimeout(() => setSaveImageStatus('idle'), 3000);
      return;
    }
    
    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#1e103c',
        skipFonts: true,
      });

      const link = document.createElement('a');
      link.download = '我的德州画像.png';
      link.href = dataUrl;
      link.click();
      
      setSaveImageStatus('success');
      setTimeout(() => setSaveImageStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save image', err);
      setSaveImageStatus('error');
      setTimeout(() => setSaveImageStatus('idle'), 3000);
    }
  };

  const handleUnlock = async () => {
    if (hasPaid) {
      onUnlockSuccess();
      return;
    }

    if (isUnlocking) return; // 防重复点击

    setIsUnlocking(true);
    setUnlockError('');

    try {
      const result = await createPayment(userId);

      // 已支付用户
      if (result.alreadyPaid) {
        setIsUnlocking(false);
        onUnlockSuccess();
        return;
      }

      // 支付创建失败
      if (result.error) {
        setIsUnlocking(false);
        setUnlockError(result.message || '创建支付失败，请重试');
        setTimeout(() => setUnlockError(''), 4000);
        return;
      }

      // 选择最合适的支付跳转地址
      const isWechat = isWechatBrowser();
      const payUrl = isWechat
        ? (result.payurl2 || result.payurl || result.qrcode)
        : (result.payurl || result.payurl2 || result.qrcode);

      if (payUrl) {
        // 跳转到支付页面
        window.location.href = payUrl;
        // 注意：跳转后 isUnlocking 状态会在页面卸载时自然消失
        // 用户返回时，App.tsx 的 useEffect 会检查 URL 中的 out_trade_no 做兜底查询
      } else {
        setIsUnlocking(false);
        setUnlockError('未获取到支付地址，请重试');
        setTimeout(() => setUnlockError(''), 4000);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setIsUnlocking(false);
      setUnlockError('网络异常，请重试');
      setTimeout(() => setUnlockError(''), 4000);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: '我的德州扑克玩家画像',
          text: `我是【${resultInfo.name}】！快来测测你的德州扑克玩家画像，解锁专属盈利策略！`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('链接已复制，快去分享给牌友吧！');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const getIndices = (type: string) => {
    const base = {
      NIT: [ { label: '盈利能力', value: 40, color: 'from-cyan-400 to-blue-600', shadow: 'shadow-[0_0_10px_rgba(34,211,238,0.5)]' }, { label: '耐心指数', value: 95, color: 'from-indigo-400 to-purple-600', shadow: 'shadow-[0_0_10px_rgba(129,140,248,0.5)]' }, { label: '上头指数', value: 20, color: 'from-rose-400 to-red-600', shadow: 'shadow-[0_0_10px_rgba(251,113,133,0.5)]' }, { label: '牌桌欢迎度', value: 30, color: 'from-amber-300 to-orange-500', shadow: 'shadow-[0_0_10px_rgba(252,211,77,0.5)]' } ],
      CALLING: [ { label: '盈利能力', value: 20, color: 'from-cyan-400 to-blue-600', shadow: 'shadow-[0_0_10px_rgba(34,211,238,0.5)]' }, { label: '耐心指数', value: 60, color: 'from-indigo-400 to-purple-600', shadow: 'shadow-[0_0_10px_rgba(129,140,248,0.5)]' }, { label: '上头指数', value: 40, color: 'from-rose-400 to-red-600', shadow: 'shadow-[0_0_10px_rgba(251,113,133,0.5)]' }, { label: '牌桌欢迎度', value: 90, color: 'from-amber-300 to-orange-500', shadow: 'shadow-[0_0_10px_rgba(252,211,77,0.5)]' } ],
      TAG: [ { label: '盈利能力', value: 85, color: 'from-cyan-400 to-blue-600', shadow: 'shadow-[0_0_10px_rgba(34,211,238,0.5)]' }, { label: '耐心指数', value: 90, color: 'from-indigo-400 to-purple-600', shadow: 'shadow-[0_0_10px_rgba(129,140,248,0.5)]' }, { label: '上头指数', value: 30, color: 'from-rose-400 to-red-600', shadow: 'shadow-[0_0_10px_rgba(251,113,133,0.5)]' }, { label: '牌桌欢迎度', value: 50, color: 'from-amber-300 to-orange-500', shadow: 'shadow-[0_0_10px_rgba(252,211,77,0.5)]' } ],
      LAG: [ { label: '盈利能力', value: 95, color: 'from-cyan-400 to-blue-600', shadow: 'shadow-[0_0_10px_rgba(34,211,238,0.5)]' }, { label: '耐心指数', value: 70, color: 'from-indigo-400 to-purple-600', shadow: 'shadow-[0_0_10px_rgba(129,140,248,0.5)]' }, { label: '上头指数', value: 60, color: 'from-rose-400 to-red-600', shadow: 'shadow-[0_0_10px_rgba(251,113,133,0.5)]' }, { label: '牌桌欢迎度', value: 40, color: 'from-amber-300 to-orange-500', shadow: 'shadow-[0_0_10px_rgba(252,211,77,0.5)]' } ],
      LAG_FISH: [ { label: '盈利能力', value: 20, color: 'from-cyan-400 to-blue-600', shadow: 'shadow-[0_0_10px_rgba(34,211,238,0.5)]' }, { label: '耐心指数', value: 15, color: 'from-indigo-400 to-purple-600', shadow: 'shadow-[0_0_10px_rgba(129,140,248,0.5)]' }, { label: '上头指数', value: 95, color: 'from-rose-400 to-red-600', shadow: 'shadow-[0_0_10px_rgba(251,113,133,0.5)]' }, { label: '牌桌欢迎度', value: 100, color: 'from-amber-300 to-orange-500', shadow: 'shadow-[0_0_10px_rgba(252,211,77,0.5)]' } ],
    };
    const res = base[type as keyof typeof base] || base.LAG_FISH;
    if (tiltFlag) {
      return res.map(r => r.label === '上头指数' ? { ...r, value: Math.max(r.value, 85) } : r);
    }
    return res;
  };

  const getEvolution = (type: string) => {
    switch(type) {
      case 'NIT': return ['石头鱼', '冷血鲨', '行走的GTO'];
      case 'CALLING': return ['跟注鱼', '冷血鲨', '行走的GTO'];
      case 'TAG': return ['冷血鲨', '凶猛鲨', '行走的GTO'];
      case 'LAG': return ['凶猛鲨', '冷血鲨', '行走的GTO'];
      case 'LAG_FISH':
      default: return ['疯狂鱼', '凶猛鲨', '行走的GTO'];
    }
  };

  const getImageProps = (type: string) => {
    switch(type) {
      case 'NIT': return { emoji: "🐟", filter: 'grayscale(0.8) brightness(0.9)' };
      case 'CALLING': return { emoji: "🐟", filter: 'hue-rotate(90deg) saturate(0.8)' };
      case 'TAG': return { emoji: "🦈", filter: 'hue-rotate(180deg) saturate(1.2)' };
      case 'LAG': return { emoji: "🦈", filter: 'hue-rotate(320deg) saturate(1.5)' };
      case 'LAG_FISH':
      default: return { emoji: "🐡", filter: 'hue-rotate(260deg) saturate(1.5) brightness(0.85)' };
    }
  };

  const indices = getIndices(finalType);
  const evolution = getEvolution(finalType);
  const imgProps = getImageProps(finalType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full overflow-y-auto relative z-10 bg-zinc-950"
    >
      {/* 截图区域：控制在一屏内 */}
      <div 
        id="result-snapshot" 
        className="relative flex flex-col bg-gradient-to-br from-[#160b2e] via-[#09090b] to-[#1a0b2e] shrink-0 overflow-hidden"
      >
        {/* Modern Tech Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          {/* Glowing Orbs - Enhanced Purple Depth */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-purple-600/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-cyan-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="px-4 pb-4 relative z-10 flex flex-col pt-8">
          {/* Dynamic Header Composition (Image + Text Overlap) */}
          <div className="relative w-full min-h-[160px] mb-6 mt-2 flex items-center">
            {/* Text Section (Left) */}
            <div className="relative z-20 flex flex-col items-start pl-2">
              {/* Dark glow behind text to ensure readability over the image */}
              <div className="absolute top-1/2 left-0 w-[140%] h-[140%] -translate-y-1/2 bg-black/40 blur-2xl rounded-full z-[-1] pointer-events-none" />
              
              <div className="inline-flex items-center gap-1.5 bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 px-3 py-1 rounded-full font-bold text-[11px] tracking-widest mb-1 backdrop-blur-md shadow-[0_0_10px_rgba(34,211,238,0.3)] transform -rotate-3">
                <span className="text-[10px]">♠️</span>
                <span>{prefix}</span>
              </div>
              <h1 
                className="text-[4.5rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-500 tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] italic transform -rotate-2 pr-4 pt-2 pb-2"
                style={{ WebkitTextStroke: '1.5px rgba(0,0,0,0.4)' }}
              >
                {mainName}
              </h1>
              {/* Integrated Subtitle */}
              <div className="mt-1 flex items-start gap-2 transform -rotate-1 pl-1">
                <div className="w-4 h-[3px] bg-cyan-400/70 rounded-full mt-2 shrink-0" />
                <p className="text-[13px] font-bold tracking-widest text-cyan-50 italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {displayComment}
                </p>
              </div>
            </div>

            {/* Image Section (Right, Overlapping) */}
            <div className="absolute right-[-15px] top-[-20px] w-[190px] h-[190px] z-10 pointer-events-none flex items-center justify-center">
              <span
                className="text-[120px] drop-shadow-[0_10px_20px_rgba(168,85,247,0.4)] transform rotate-12"
                style={{ filter: imgProps.filter }}
              >
                {imgProps.emoji}
              </span>
              {/* Dark shadow overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent rounded-full blur-sm" />
            </div>
          </div>

          {/* Indices Section */}
          <div className="w-full bg-white/5 backdrop-blur-xl rounded-2xl p-3.5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] mb-3">
            <div className="space-y-3">
              {indices.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-300 font-medium w-14 text-right">{item.label}</span>
                  <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-white/5 relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: "easeOut" }}
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${item.color} rounded-full ${item.shadow}`}
                    />
                  </div>
                  <span className="text-[11px] text-white font-bold w-6 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bento Grid for Traits and Core Issue */}
          <div className="grid grid-cols-2 gap-3 mb-3 w-full items-stretch">
            {/* 典型打法 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
              <div className="flex items-center gap-2 mb-2.5">
                <Swords className="w-4 h-4 text-cyan-400" />
                <h3 className="text-[11px] font-bold text-cyan-100 tracking-widest">典型打法</h3>
              </div>
              <ul className="space-y-2 mt-auto relative z-10">
                {resultInfo.traits.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-300 font-medium leading-tight">
                    <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)] shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 核心问题 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />
              <div className="flex items-center gap-2 mb-2.5">
                <Bomb className="w-4 h-4 text-rose-400" />
                <h3 className="text-[11px] font-bold text-rose-100 tracking-widest">核心问题</h3>
              </div>
              <ul className="space-y-2 mt-auto relative z-10">
                {Array.isArray(resultInfo.leak) ? resultInfo.leak.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-300 font-medium leading-tight">
                    <div className="w-1 h-1 rounded-full bg-rose-400 shadow-[0_0_5px_rgba(251,113,133,0.8)] shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                )) : (
                  <li className="flex items-start gap-1.5 text-[11px] text-zinc-300 font-medium leading-tight">
                    <div className="w-1 h-1 rounded-full bg-rose-400 shadow-[0_0_5px_rgba(251,113,133,0.8)] shrink-0 mt-1" />
                    <span>{resultInfo.leak}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* 进化路径 */}
          <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shrink-0 z-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="w-4 h-4 text-purple-400" />
              <h3 className="text-[11px] font-bold text-purple-100 tracking-widest">进化路径</h3>
            </div>
            
            <div className="relative flex items-center justify-between px-4 mb-2">
              {/* Connecting Line */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-zinc-800 z-0">
                <div className="h-full bg-gradient-to-r from-purple-500 to-transparent w-1/2" />
              </div>
              
              {/* Steps */}
              <div className="relative z-10 flex flex-col items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)] ring-2 ring-purple-900" />
                <span className="text-[10px] font-bold text-purple-300">{evolution[0]}</span>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-zinc-700 ring-2 ring-zinc-900" />
                <span className="text-[10px] font-medium text-zinc-500">{evolution[1]}</span>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-zinc-700 ring-2 ring-zinc-900" />
                <span className="text-[10px] font-medium text-zinc-500">{evolution[2]}</span>
              </div>
            </div>

            <p className="text-[11px] text-center text-zinc-400 font-medium leading-relaxed mt-3">
              {resultInfo.evolutionComment ? (
                resultInfo.evolutionComment
              ) : (
                <>你并不是不会打，你只是缺乏 <span className="text-purple-300 font-bold">系统性的收放自如</span></>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 保存截图按钮 */}
      <div className="px-5 pb-4 pt-2 bg-zinc-950 shrink-0 z-10 relative flex gap-3">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-24 bg-purple-600/10 blur-2xl" />
        </div>
        <button 
          onClick={handleDownload}
          disabled={saveImageStatus === 'generating'}
          className="flex-1 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border-t-[1px] border-white/10 active:scale-[0.98] transition-all relative overflow-hidden group flex items-center justify-center gap-2 z-10 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 transition-colors" />
          <Download className={`w-4 h-4 text-zinc-200 relative z-10 ${saveImageStatus === 'generating' ? 'animate-bounce' : ''}`} />
          <span className="relative z-10 text-sm text-zinc-200 font-bold leading-relaxed block">
            {saveImageStatus === 'generating' ? '生成中...' : 
             saveImageStatus === 'success' ? '长按保存' : 
             saveImageStatus === 'error' ? '生成失败' : 
             '保存图片'}
          </span>
        </button>
        <button 
          onClick={handleShare}
          className="flex-1 p-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 border-t-[1px] border-purple-400/30 active:scale-[0.98] transition-all relative overflow-hidden group flex items-center justify-center gap-2 z-10 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Share2 className="w-4 h-4 text-white relative z-10" />
          <span className="relative z-10 text-sm text-white font-bold leading-relaxed block">
            分享给牌友
          </span>
        </button>
      </div>

      {/* 付费区 */}
      <div className="m-4 mt-8 bg-zinc-900/95 backdrop-blur-xl rounded-[24px] p-5 pt-8 relative shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(168,85,247,0.15)] border border-zinc-700/50 shrink-0 z-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-zinc-700 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          <Lock className="w-5 h-5 text-purple-400" />
        </div>
        
        <h3 className="text-lg font-black text-white text-center mb-4 tracking-wide">
          解锁你的最优打法策略
        </h3>
        
        <div className="bg-black/30 rounded-xl p-4 mb-5 border border-white/5">
          <p className="text-[10px] text-zinc-500 mb-3 font-bold tracking-widest uppercase text-center">解锁后你将获得：</p>
          <div className="flex justify-center">
            <ul className="space-y-3 inline-block text-left">
              {[
                "你最容易亏损的关键决策场景",
                "针对你风格的翻前/翻后优化路径",
                "你应保留及重点修正的打法习惯",
                "一套适合你的稳定正收益打法模型"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300 font-medium leading-relaxed">
                  <Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3 mb-3">
          <button 
            onClick={() => setIsQrModalOpen(true)}
            className="flex-1 py-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-inner"
          >
            <span className="text-sm text-zinc-300 font-bold tracking-wide">咨询/玩家交流</span>
          </button>
          <button 
            onClick={handleUnlock}
            disabled={isUnlocking || hasPaid}
            className={`flex-[1.5] py-3.5 rounded-xl border-t-[1px] active:scale-[0.98] transition-all relative overflow-hidden group flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-80 disabled:cursor-not-allowed disabled:active:scale-100 ${
              hasPaid 
                ? 'bg-zinc-800 border-zinc-600 text-zinc-400' 
                : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 border-purple-400/50 text-white'
            }`}
          >
            {!hasPaid && !isUnlocking && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            )}
            <span className="relative z-10 text-sm font-black tracking-wider flex items-center gap-2">
              {isUnlocking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  处理中...
                </>
              ) : hasPaid ? (
                '已解锁'
              ) : (
                '¥9.9元解锁策略'
              )}
            </span>
          </button>
        </div>

        {unlockError && (
          <p className="text-center text-rose-400 text-xs font-medium mb-3 animate-pulse">
            {unlockError}
          </p>
        )}

        <button
          onClick={onRestart}
          className="w-full py-3 text-xs text-zinc-500 font-bold flex items-center justify-center gap-2 active:text-zinc-300 transition-colors hover:bg-white/5 rounded-xl"
        >
          <RotateCcw className="w-4 h-4" /> 重新测试
        </button>
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
              
              <h3 className="text-lg font-bold text-white mb-2 text-center">加入学习交流群</h3>
              <p className="text-sm text-zinc-400 text-center mb-6">
                扫码添加小助手，获取更多进阶策略与实战复盘
              </p>
              
              <div className="w-48 h-48 mx-auto bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center mb-4 overflow-hidden relative">
                {/* Placeholder for QR Code */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #a855f7 10px, #a855f7 20px)' }} />
                <span className="text-zinc-500 font-medium relative z-10 text-sm">二维码占位区</span>
              </div>
              
              <p className="text-xs text-zinc-500 text-center">
                长按保存二维码图片
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

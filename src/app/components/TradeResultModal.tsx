import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, TrendingDown, RefreshCw, History, CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TradeResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: 'win' | 'loss';
  profit: number;
  asset: string;
  direction: 'up' | 'down';
  entryPrice: number;
  exitPrice: number;
  priceChange: number;
  priceChangePercent: number;
  duration: string;
  newBalance: number;
  winRate: number;
  totalProfit: number;
  onTradeAgain?: () => void;
  onViewHistory?: () => void;
}

export function TradeResultModal({
  isOpen,
  onClose,
  result,
  profit,
  asset,
  direction,
  entryPrice,
  exitPrice,
  priceChange,
  priceChangePercent,
  duration,
  newBalance,
  winRate,
  totalProfit,
  onTradeAgain,
  onViewHistory,
}: TradeResultModalProps) {
  const [animatedProfit, setAnimatedProfit] = useState(0);
  const isWin = result === 'win';

  // Sound effects using Web Audio API
  const playSound = (frequency: number, duration: number, type: 'sine' | 'square' = 'sine') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Audio context not available');
    }
  };

  // Play success sound (ascending notes)
  const playWinSound = () => {
    playSound(523.25, 0.1); // C5
    setTimeout(() => playSound(659.25, 0.1), 100); // E5
    setTimeout(() => playSound(783.99, 0.2), 200); // G5
  };

  // Play loss sound (gentle single tone)
  const playLossSound = () => {
    playSound(392, 0.3); // G4
  };

  // Confetti effect for WIN
  const fireConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
      });
    }, 250);
  };

  // Animate profit count-up
  useEffect(() => {
    if (!isOpen) {
      setAnimatedProfit(0);
      return;
    }

    // Play sound and confetti
    if (isWin) {
      playWinSound();
      setTimeout(() => fireConfetti(), 100);
    } else {
      playLossSound();
    }

    // Animate profit number
    const duration = 1000;
    const steps = 60;
    const increment = Math.abs(profit) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedProfit(Math.abs(profit));
        clearInterval(timer);
      } else {
        setAnimatedProfit(increment * currentStep);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isOpen, profit, isWin]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
                isWin 
                  ? 'bg-gradient-to-br from-green-900/95 to-green-950/95 border-2 border-green-500/50' 
                  : 'bg-gradient-to-br from-red-900/95 to-red-950/95 border-2 border-red-500/50'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Header Icon */}
              <div className="pt-8 pb-6 flex justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                  className={`rounded-full p-6 ${
                    isWin ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}
                >
                  {isWin ? (
                    <CheckCircle className="w-16 h-16 text-green-400" strokeWidth={2.5} />
                  ) : (
                    <XCircle className="w-16 h-16 text-red-400" strokeWidth={2.5} />
                  )}
                </motion.div>
              </div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center px-6"
              >
                <h2 className={`text-3xl font-bold mb-2 ${
                  isWin ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isWin ? '🎉 TRADE WIN!' : '❌ TRADE LOSS'}
                </h2>
                <p className="text-white/70 text-sm">
                  Your trade has been closed
                </p>
              </motion.div>

              {/* Profit/Loss Amount */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', damping: 20 }}
                className="py-6 text-center"
              >
                <div className={`text-6xl font-black tracking-tight ${
                  isWin ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isWin ? '+' : '-'}${animatedProfit.toFixed(2)}
                </div>
                <div className="text-white/50 text-sm mt-2">
                  {isWin ? 'Profit' : 'Loss'}
                </div>
              </motion.div>

              {/* Trade Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="px-6 pb-6 space-y-3"
              >
                {/* Asset & Direction */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        direction === 'up' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {direction === 'up' ? (
                          <TrendingUp className={`w-5 h-5 ${
                            direction === 'up' ? 'text-green-400' : 'text-red-400'
                          }`} />
                        ) : (
                          <TrendingDown className={`w-5 h-5 ${
                            direction === 'up' ? 'text-green-400' : 'text-red-400'
                          }`} />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-bold text-lg">{asset}</div>
                        <div className="text-white/50 text-xs">
                          {direction.toUpperCase()} • {duration}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Movement */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/50 text-xs mb-1">Entry Price</div>
                      <div className="text-white font-bold">${entryPrice.toFixed(2)}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/50 text-xs mb-1">Exit Price</div>
                      <div className="text-white font-bold">${exitPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Price Change */}
                  <div className="mt-3 text-center">
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                      priceChange >= 0 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-white/50 text-xs mb-1">New Balance</div>
                      <div className="text-white font-bold text-lg">${newBalance.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-white/50 text-xs mb-1">Win Rate</div>
                      <div className={`font-bold text-lg ${
                        winRate >= 50 ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {winRate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-white/50 text-xs mb-1">Total P/L</div>
                      <div className={`font-bold text-lg ${
                        totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${totalProfit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="px-6 pb-6 grid grid-cols-2 gap-3"
              >
                <button
                  onClick={() => {
                    onTradeAgain?.();
                    onClose();
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all shadow-lg ${
                    isWin
                      ? 'bg-green-600 hover:bg-green-500 text-white hover:shadow-green-500/50'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <RefreshCw className="w-5 h-5" />
                  Trade Again
                </button>
                <button
                  onClick={() => {
                    onViewHistory?.();
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <History className="w-5 h-5" />
                  View History
                </button>
              </motion.div>

              {/* Decorative gradient overlay */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                isWin 
                  ? 'bg-gradient-to-r from-green-400 via-green-300 to-green-400' 
                  : 'bg-gradient-to-r from-red-400 via-red-300 to-red-400'
              }`} />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

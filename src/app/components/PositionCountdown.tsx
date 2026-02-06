import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface PositionCountdownProps {
  expiresAt: number;
  onExpire?: () => void;
}

export function PositionCountdown({ expiresAt, onExpire }: PositionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      setTimeLeft(remaining);

      if (remaining === 0 && onExpire) {
        onExpire();
      }
    };

    // Update immediately
    updateCountdown();

    // Update every 100ms for smooth countdown
    const interval = setInterval(updateCountdown, 100);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getProgressColor = (): string => {
    const percentage = (timeLeft / (expiresAt - (expiresAt - timeLeft))) * 100;
    
    if (percentage > 50) return "text-green-600 bg-green-100";
    if (percentage > 20) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${getProgressColor()}`}>
      <Clock className="h-4 w-4" />
      <span className="font-bold text-sm tabular-nums">
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}

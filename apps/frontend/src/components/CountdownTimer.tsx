import { useEffect, useState } from "react";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-white/90 mb-2">Offer ends in:</p>
      <div className="flex items-end gap-2 bg-[#0f6e56] px-4 py-3 rounded-full w-fit">
        <div className="text-center">
          <div className="text-2xl font-bold text-white font-mono">
            {formatNumber(timeLeft.hours)}
          </div>
          <div className="text-xs text-white/70 mt-1">hrs</div>
        </div>
        <div className="text-xl font-bold text-white">:</div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white font-mono">
            {formatNumber(timeLeft.minutes)}
          </div>
          <div className="text-xs text-white/70 mt-1">min</div>
        </div>
        <div className="text-xl font-bold text-white">:</div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white font-mono">
            {formatNumber(timeLeft.seconds)}
          </div>
          <div className="text-xs text-white/70 mt-1">sec</div>
        </div>
      </div>
    </div>
  );
}

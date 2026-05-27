import { useEffect, useRef, useState } from "react";

export function useCountUp(
  endValue: number,
  duration: number = 2000,
  startOnView: boolean = true,
  suffix: string = "",
) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!startOnView) {
      // If startOnView is false, animate immediately
      const start = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        setCount(Math.floor(endValue * progress));

        if (progress === 1) {
          clearInterval(interval);
        }
      }, 16);

      return () => clearInterval(interval);
    }

    // Use IntersectionObserver if startOnView is true
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;

          const start = Date.now();
          const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(endValue * progress));

            if (progress === 1) {
              clearInterval(interval);
            }
          }, 16);

          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [endValue, duration, startOnView]);

  return [ref, `${count}${suffix}`] as const;
}

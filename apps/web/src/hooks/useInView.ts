import { RefObject, useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
}

export function useInView<T extends HTMLElement>({
  once = true,
  rootMargin = '0px 0px -10% 0px',
  threshold = 0,
}: UseInViewOptions = {}): { ref: RefObject<T>; inView: boolean } {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(() => {
    if (typeof window === 'undefined') return true;
    if (!('IntersectionObserver' in window)) return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || (inView && once)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold, inView]);

  return { ref, inView };
}

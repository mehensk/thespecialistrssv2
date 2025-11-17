'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface ScrollAnimationProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ScrollAnimation({ children, delay = 0, className = '' }: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (ref.current) {
      ref.current.style.opacity = '0';
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}


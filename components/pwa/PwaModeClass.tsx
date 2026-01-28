'use client';

import { useEffect } from 'react';

export function PwaModeClass() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const root = document.documentElement;

    const setStandalone = (standalone: boolean) => {
      if (standalone) {
        root.setAttribute('data-standalone', 'true');
      } else {
        root.removeAttribute('data-standalone');
      }
    };

    const checkStandalone = () => {
      const isStandalone = mediaQuery.matches ||
        ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone);
      setStandalone(Boolean(isStandalone));
    };

    checkStandalone();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', checkStandalone);
    } else {
      mediaQuery.addListener(checkStandalone);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', checkStandalone);
      } else {
        mediaQuery.removeListener(checkStandalone);
      }
    };
  }, []);

  return null;
}

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { NextStepProvider, NextStep, useNextStep, type Tour } from 'nextstepjs';
import { useMediaQuery } from '@mantine/hooks';

const TOUR_SEEN_KEY = 'megyk_tour_seen_v1';

const tours: Tour[] = [
  {
    tour: 'dashboard_desktop',
    steps: [
      {
        title: 'Welcome',
        content: 'Quick tour of your dashboard — you can skip anytime.',
        selector: '#tour-dashboard-title',
      },
      {
        title: 'Featured book',
        content: 'This is your featured book area.',
        selector: '#tour-hero-desktop',
      },
      {
        title: 'Chat with the book',
        content: 'Tap here to open the chatbox for this featured book.',
        selector: '#tour-chat-cta-desktop',
      },
      {
        title: 'Discover more',
        content: 'Browse more books in your library.',
        selector: '#tour-discover-cta-desktop',
      },
      {
        title: 'Recommended',
        content: 'These are books recommended for you.',
        selector: '#tour-recommended-carousel',
      },
    ],
  },
  {
    tour: 'dashboard_mobile',
    steps: [
      {
        title: 'Welcome',
        content: 'Quick tour of your dashboard — you can skip anytime.',
        selector: '#tour-dashboard-title',
      },
      {
        title: 'Featured book',
        content: 'This is your featured book area.',
        selector: '#tour-hero-mobile',
      },
      {
        title: 'Chat with the book',
        content: 'Tap here to open the chatbox for this featured book.',
        selector: '#tour-chat-cta-mobile',
      },
      {
        title: 'Discover more',
        content: 'Browse more books in your library.',
        selector: '#tour-discover-cta-mobile',
      },
      {
        title: 'Recommended',
        content: 'These are books recommended for you.',
        selector: '#tour-recommended-carousel',
      },
    ],
  },
];

function AutoStartTour() {
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 768px)', true, { getInitialValueInEffect: false });
  const { startNextStep, isNextStepVisible } = useNextStep();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!pathname?.startsWith('/dashboard')) return;
    if (startedRef.current) return;

    try {
      const alreadySeen = window.localStorage.getItem(TOUR_SEEN_KEY) === 'true';
      if (alreadySeen) return;

      // Delay slightly so the dashboard content is rendered before NextStep queries selectors.
      startedRef.current = true;
      const tourName = isMobile ? 'dashboard_mobile' : 'dashboard_desktop';
      const timer = window.setTimeout(() => startNextStep(tourName), 250);
      return () => window.clearTimeout(timer);
    } catch {
      // If localStorage is unavailable, just don't autostart.
      return;
    }
  }, [pathname, isMobile, startNextStep]);

  useEffect(() => {
    if (!startedRef.current) return;
    if (isNextStepVisible) return;

    try {
      window.localStorage.setItem(TOUR_SEEN_KEY, 'true');
    } catch {
      // ignore
    }
  }, [isNextStepVisible]);

  return null;
}

export function AppTourProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextStepProvider>
      <NextStep steps={tours}>
        <AutoStartTour />
        {children}
      </NextStep>
    </NextStepProvider>
  );
}


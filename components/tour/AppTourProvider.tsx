'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NextStepProvider, NextStep, useNextStep, type Tour } from 'nextstepjs';

const TOUR_SEEN_KEY = 'megyk_tour_seen_v1';

// Step indices (0-indexed)
const CHAT_OPEN_STEP = 1;  // The "Chatbox" step - chat opens here
const CHAT_CLOSE_STEP = 3; // The "Discover More" step - chat closes here
const BOOK_CARD_STEP = 4;  // The "Recommended Books" step
const BOOK_BUTTONS_START = 5; // Start of button steps (Get Summary, Chat)
const BOOK_BUTTONS_END = 6;   // End of button steps

const tours: Tour[] = [
  {
    tour: 'dashboard_desktop',
    steps: [
      {
        icon: null,
        title: 'Chat with the book',
        content: 'Tap here to open the chatbox and ask questions directly to the book.',
        selector: '#tour-chat-cta-desktop',
        side: 'top',
        showControls: true,
        showSkip: true,
        viewportID: 'nextstep-viewport',
      },
            // Chatbox steps - these appear after the chat is opened
      {
        icon: null,
        title: 'The Chatbox',
        content: 'This is your AI-powered chat interface. Ask any question about the book!',
        selector: '#tour-chatbox',
        side: 'left',
        showControls: true,
        showSkip: true,
        // No viewportID - chatbox is in a Portal with fixed positioning
      },
      {
        icon: null,
        title: 'Type your question',
        content: 'Type your question here and press Enter or click Send.',
        selector: '#tour-chat-input',
        side: 'top',
        showControls: true,
        showSkip: true,
        // No viewportID - chatbox is in a Portal with fixed positioning
      },
      {
        icon: null,
        title: 'Discover More',
        content: 'Discover more books to chat with here.',
        selector: '#tour-discover-cta-desktop',
        side: 'top',
        showControls: true,
        showSkip: true,
        viewportID: 'nextstep-viewport',
      },
      {
        icon: null,
        title: 'Or here...',
        content: 'Find other books based on your interests. Hover over any book to get a summary or have a chat.',
        selector: '#tour-recommended-book',
        side: 'left',
        showControls: true,
        showSkip: true,
        // No viewportID - we'll scroll into view manually
      },
      {
        icon: null,
        title: 'Get Summary',
        content: 'Download a personalized PDF summary of this book.',
        selector: '#tour-book-get-summary',
        side: 'bottom',
        showControls: true,
        showSkip: true,
        // No viewportID - element is in scrolled view
      },
      {
        icon: null,
        title: 'Chat with Book',
        content: 'Or chat with it directly!',
        selector: '#tour-book-chat',
        side: 'bottom',
        showControls: true,
        showSkip: true,
        // No viewportID - element is in scrolled view
      },
    ],
  },
  // Mobile tour disabled - positioning issues with AppShell layout
];

// Helper to activate/deactivate the book card overlay for tour visibility
const setBookCardTourActive = (active: boolean) => {
  const bookCard = document.getElementById('tour-recommended-book');
  if (bookCard) {
    bookCard.setAttribute('data-tour-active', active ? 'true' : 'false');
  }
};

// Handler for step changes - opens/closes chat when reaching chatbox steps (desktop only)
const handleStepChange = (stepIndex: number, tourName: string | null) => {
  if (tourName !== 'dashboard_desktop') return;
  
  // Open chat when reaching the chatbox step
  if (stepIndex === CHAT_OPEN_STEP) {
    window.dispatchEvent(new CustomEvent('tour:open-chat'));
    // Force NextStep to re-query the element after chatbox renders
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }
  
  // Close chat when reaching Discover step or going back before chatbox step
  if (stepIndex === CHAT_CLOSE_STEP || stepIndex < CHAT_OPEN_STEP) {
    window.dispatchEvent(new CustomEvent('tour:close-chat'));
    
    // Scroll to Discover button when reaching that step
    if (stepIndex === CHAT_CLOSE_STEP) {
      const discoverBtn = document.getElementById('tour-discover-cta-desktop');
      if (discoverBtn) {
        discoverBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 300);
      }
    }
  }
  
  // Activate book card overlay when on book card or button steps
  if (stepIndex >= BOOK_CARD_STEP && stepIndex <= BOOK_BUTTONS_END) {
    setBookCardTourActive(true);
    
    // Scroll the book card into view
    const bookCard = document.getElementById('tour-recommended-book');
    if (bookCard) {
      bookCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Force re-render after scroll completes
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  } else {
    setBookCardTourActive(false);
  }
};

function AutoStartTour() {
  const pathname = usePathname();
  const { startNextStep, isNextStepVisible } = useNextStep();
  const startedRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount before checking media query
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!pathname?.startsWith('/dashboard')) return;
    if (startedRef.current) return;

    try {
      const alreadySeen = window.localStorage.getItem(TOUR_SEEN_KEY) === 'true';
      if (alreadySeen) return;

      // Check media query directly on client
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      
      // Skip tour on mobile - it doesn't work well with the mobile layout
      if (isMobile) {
        console.log('[Tour] Skipping tour on mobile');
        return;
      }
      
      const tourName = 'dashboard_desktop';
      const selectorToWaitFor = '#tour-chat-cta-desktop';
      
      console.log('[Tour] Attempting to start tour:', tourName);
      
      // Wait for the first tour element to exist in DOM before starting
      let retryCount = 0;
      const maxRetries = 15; // 3 seconds max (15 * 200ms)
      
      const waitForElement = () => {
        const element = document.querySelector(selectorToWaitFor);
        if (element) {
          console.log('[Tour] Element found, starting tour:', selectorToWaitFor);
          startedRef.current = true;
          startNextStep(tourName);
        } else if (retryCount < maxRetries && !startedRef.current) {
          retryCount++;
          console.log('[Tour] Waiting for element:', selectorToWaitFor, `(attempt ${retryCount}/${maxRetries})`);
          setTimeout(waitForElement, 200);
        } else {
          console.warn('[Tour] Element not found after max retries:', selectorToWaitFor);
        }
      };
      
      // Start checking after initial delay
      const timer = window.setTimeout(waitForElement, 300);
      return () => window.clearTimeout(timer);
    } catch (err) {
      console.error('[Tour] Error starting tour:', err);
      return;
    }
  }, [mounted, pathname, startNextStep]);

  useEffect(() => {
    if (!startedRef.current) return;
    if (isNextStepVisible) return;

    // Tour has ended - clean up
    try {
      window.localStorage.setItem(TOUR_SEEN_KEY, 'true');
    } catch {
      // ignore
    }
    
    // Clean up book card overlay state
    const bookCard = document.getElementById('tour-recommended-book');
    if (bookCard) {
      bookCard.removeAttribute('data-tour-active');
    }
  }, [isNextStepVisible]);

  return null;
}

export function AppTourProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextStepProvider>
      <NextStep steps={tours} onStepChange={handleStepChange} overlayZIndex={1100}>
        <AutoStartTour />
        {children}
      </NextStep>
    </NextStepProvider>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppShell,
  Group,
  Text,
  NavLink,
  ActionIcon,
  UnstyledButton,
  Box,
} from '@mantine/core';
import {
  IconHome,
  IconBook,
  IconUser,
  IconLogout,
  IconBookmark,
  IconAdjustments,
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { TourHelpButton } from '@/components/tour/TourHelpButton';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { label: 'Home', icon: IconHome, href: '/dashboard' },
  { label: 'Library', icon: IconBook, href: '/dashboard/library' },
  { label: 'My Collection', icon: IconBookmark, href: '/dashboard/summaries' },
  { label: 'Preferences', icon: IconAdjustments, href: '/dashboard/preferences' },
  { label: 'Profile', icon: IconUser, href: '/dashboard/profile' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showMobileNav, setShowMobileNav] = useState(true);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const router = useRouter();

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  // Auto-hide mobile nav on scroll down
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const currentScrollY = target.scrollTop;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down & past threshold - hide
        setShowMobileNav(false);
      } else {
        // Scrolling up - show
        setShowMobileNav(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    // Target the AppShell main element
    const mainElement = document.querySelector('.mantine-AppShell-main');
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const loadUserData = async () => {
    try {
      console.log('[DashboardLayout] Loading user data...');
      const supabase = createClient();
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout after 5s')), 5000)
      );
      
      const authPromise = supabase.auth.getUser();
      const result = await Promise.race([authPromise, timeoutPromise]);
      
      if (result.error) {
        console.error('[DashboardLayout] Auth error:', result.error);
        return;
      }
      
      if (result.data?.user) {
        console.log('[DashboardLayout] User loaded:', result.data.user.email);
        setUserEmail(result.data.user.email || null);
      } else {
        console.log('[DashboardLayout] No user found');
      }
    } catch (err) {
      console.error('[DashboardLayout] Error loading user data:', err);
      // Don't block rendering if auth fails
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/signin');
    router.refresh();
  };

  const items = navigation.map((item) => (
    <NavLink
      key={item.label}
      active={pathname === item.href}
      label={item.label}
      leftSection={<item.icon size={20} stroke={1.5} />}
      href={item.href}
      color="blue"
    />
  ));

  return (
    <>
      <AppShell
        layout="alt"
        header={{ height: 60 }}
        navbar={{
          width: 250,
          breakpoint: 'sm',
          collapsed: { mobile: true, desktop: false }, // Always collapsed on mobile
        }}
        padding="md"
        styles={{
          root: {
            backgroundColor: '#ffffff',
          },
          header: {
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
          },
          navbar: {
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            paddingTop: 0,
          },
          main: {
            backgroundColor: '#ffffff',
            paddingTop: 'calc(var(--app-shell-header-height, 0px) + var(--mantine-spacing-xl))',
            paddingBottom: 'calc(var(--mantine-spacing-md) + 70px)', // Space for mobile footer
          }
        }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            {/* Mobile Logo - only visible on mobile */}
            <Box hiddenFrom="sm">
              <a
                href="/"
                style={{ 
                  textDecoration: 'none', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                className="hover:opacity-80"
              >
                <img 
                  src="/megyk-logo-no-book.png" 
                  alt="Megyk Books" 
                  style={{ height: '40px', width: 'auto' }}
                />
              </a>
            </Box>
            
            {/* Spacer for desktop to push content right */}
            <Box visibleFrom="sm" />
            
            <Group gap="md">
              {userEmail && (
                <Text size="sm" c="dimmed" visibleFrom="sm">
                  {userEmail}
                </Text>
              )}
              <ActionIcon 
                variant="default" 
                size="lg" 
                onClick={handleLogout} 
                title="Logout"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  color: '#000000'
                }}
              >
                <IconLogout size={20} />
              </ActionIcon>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar visibleFrom="sm">
          {/* Logo Section */}
          <AppShell.Section 
            style={{ 
              padding: '24px 16px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <a
              href="/"
              style={{ 
                textDecoration: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="hover:opacity-80"
            >
              <img 
                src="/megyk.svg" 
                alt="Megyk Books" 
                style={{ height: '120px', width: 'auto' }}
              />
            </a>
          </AppShell.Section>
          
          {/* Navigation Section */}
          <AppShell.Section grow p="md">
            {items}
            <TourHelpButton />
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main id="nextstep-viewport">{children}</AppShell.Main>
      </AppShell>

      {/* Mobile Bottom Navigation - Facebook Style */}
      <Box
        hiddenFrom="sm"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '70px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e5e7eb',
          transform: showMobileNav ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 200,
        }}
      >
        <Group h="100%" px="xs" justify="space-around" gap={0}>
          {navigation.slice(0, 4).map((item) => (
            <UnstyledButton
              key={item.label}
              onClick={() => router.push(item.href)}
              style={{
                flex: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                color: pathname === item.href ? '#2563EB' : '#374151',
                transition: 'color 0.2s ease',
              }}
            >
              <item.icon size={24} stroke={1.5} />
              <Text size="xs" fw={500}>
                {item.label}
              </Text>
            </UnstyledButton>
          ))}
        </Group>
      </Box>
    </>
  );
}

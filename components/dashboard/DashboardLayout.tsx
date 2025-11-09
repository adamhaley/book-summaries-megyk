'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppShell,
  Burger,
  Group,
  Text,
  NavLink,
  useMantineTheme,
  ActionIcon,
  useMantineColorScheme,
  UnstyledButton,
  Stack,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconHome,
  IconBook,
  IconUser,
  IconLogout,
  IconSun,
  IconMoon,
  IconBookmark,
  IconAdjustments,
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';

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
  const [opened, { toggle }] = useDisclosure();
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showMobileNav, setShowMobileNav] = useState(true);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  // Prevent hydration mismatch and load user data
  useEffect(() => {
    setMounted(true);
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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || null);
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
      color="cyan"
    />
  ));

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: true, desktop: false }, // Always collapsed on mobile
        }}
        padding="md"
        styles={{
          main: {
            paddingTop: 'calc(var(--app-shell-header-height, 0px) + var(--mantine-spacing-xl))',
            paddingBottom: 'calc(var(--mantine-spacing-md) + 70px)', // Space for mobile footer
          }
        }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Group>
              <Text 
                size="xl" 
                fw={800}
                component="a" 
                href="/" 
                style={{ textDecoration: 'none', color: '#FFFFFF', cursor: 'pointer' }}
                className="hover:opacity-80"
              >
                Megyk Books
              </Text>
            </Group>
            <Group gap="md">
              {userEmail && (
                <Text size="sm" c="dimmed" visibleFrom="sm">
                  {userEmail}
                </Text>
              )}
              <ActionIcon
                variant="default"
                onClick={() => toggleColorScheme()}
                size="lg"
                style={{
                  backgroundColor: '#000000',
                  border: '1px solid #2a2a2a',
                  color: '#FFFFFF'
                }}
              >
                {mounted && colorScheme === 'dark' ? (
                  <IconSun size={20} />
                ) : (
                  <IconMoon size={20} />
                )}
              </ActionIcon>
              <ActionIcon 
                variant="default" 
                size="lg" 
                onClick={handleLogout} 
                title="Logout"
                style={{
                  backgroundColor: '#000000',
                  border: '1px solid #2a2a2a',
                  color: '#FFFFFF'
                }}
              >
                <IconLogout size={20} />
              </ActionIcon>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md" visibleFrom="sm">
          <AppShell.Section grow>
            {items}
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
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
          backgroundColor: '#000000',
          borderTop: '1px solid #2a2a2a',
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
                color: pathname === item.href ? '#00D2FF' : '#AAAAAA',
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

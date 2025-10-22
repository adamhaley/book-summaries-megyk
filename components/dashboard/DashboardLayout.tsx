'use client';

import { useState, useEffect } from 'react';
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
  { label: 'Dashboard', icon: IconHome, href: '/dashboard' },
  { label: 'Library', icon: IconBook, href: '/dashboard/library' },
  { label: 'My Summaries', icon: IconBookmark, href: '/dashboard/summaries' },
  { label: 'Preferences', icon: IconAdjustments, href: '/dashboard/preferences' },
  { label: 'Profile', icon: IconUser, href: '/dashboard/profile' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  // Prevent hydration mismatch and load user data
  useEffect(() => {
    setMounted(true);
    loadUserData();
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
    />
  ));

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{
        main: {
          paddingTop: 'calc(var(--app-shell-header-height, 0px) + var(--mantine-spacing-xl))'
        }
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text 
              size="xl" 
              fw={700}
              component="a" 
              href="/" 
              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
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
            >
              {mounted && colorScheme === 'dark' ? (
                <IconSun size={20} />
              ) : (
                <IconMoon size={20} />
              )}
            </ActionIcon>
            <ActionIcon variant="default" size="lg" onClick={handleLogout} title="Logout">
              <IconLogout size={20} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          {items}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

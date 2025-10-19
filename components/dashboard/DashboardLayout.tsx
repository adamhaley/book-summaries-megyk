'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  IconSettings,
  IconLogout,
  IconSun,
  IconMoon,
  IconChartBar,
  IconBookmark,
  IconAdjustments,
} from '@tabler/icons-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { label: 'Dashboard', icon: IconHome, href: '/dashboard' },
  { label: 'Library', icon: IconBook, href: '/dashboard/library' },
  { label: 'My Summaries', icon: IconBookmark, href: '/dashboard/summaries' },
  { label: 'Preferences', icon: IconAdjustments, href: '/dashboard/preferences' },
  { label: 'Analytics', icon: IconChartBar, href: '/dashboard/analytics' },
  { label: 'Profile', icon: IconUser, href: '/dashboard/profile' },
  { label: 'Settings', icon: IconSettings, href: '/dashboard/settings' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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
          paddingTop: 'calc(var(--app-shell-header-height, 0px) + var(--mantine-spacing-xs))'
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
          <Group>
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
            <ActionIcon variant="default" size="lg">
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

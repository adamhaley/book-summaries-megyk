'use client';

import { useState, useEffect } from 'react';
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
} from '@tabler/icons-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { label: 'Dashboard', icon: IconHome, href: '/dashboard' },
  { label: 'Library', icon: IconBook, href: '/dashboard/library' },
  { label: 'My Summaries', icon: IconBookmark, href: '/dashboard/summaries' },
  { label: 'Analytics', icon: IconChartBar, href: '/dashboard/analytics' },
  { label: 'Profile', icon: IconUser, href: '/dashboard/profile' },
  { label: 'Settings', icon: IconSettings, href: '/dashboard/settings' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const items = navigation.map((item, index) => (
    <NavLink
      key={item.label}
      active={index === active}
      label={item.label}
      leftSection={<item.icon size={20} stroke={1.5} />}
      onClick={() => setActive(index)}
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
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text size="xl" fw={700}>
              Book Summaries
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

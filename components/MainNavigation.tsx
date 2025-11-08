'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Group,
  Text,
  ActionIcon,
  useMantineColorScheme,
  Burger,
  Drawer,
  Stack,
  Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSun,
  IconMoon,
  IconLogout,
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';

export function MainNavigation() {
  const [mounted, setMounted] = useState(false);
  const [opened, { toggle, close }] = useDisclosure(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setIsAuthenticated(true);
      setUserEmail(session.user.email || null);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserEmail(null);
    router.push('/auth/signin');
    router.refresh();
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <>
      <nav style={{ 
        borderBottom: '1px solid #2a2a2a', 
        height: '60px',
        backgroundColor: '#000000'
      }}>
        <Group h="100%" px="md" justify="space-between">
          <Text
            size="xl"
            fw={800}
            component="a"
            href="/"
            style={{ 
              textDecoration: 'none', 
              color: '#FFFFFF', 
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
            className="hover:opacity-80"
          >
            Megyk Books
          </Text>

          {/* Desktop Navigation */}
          <Group gap="md" visibleFrom="sm">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{ color: 'var(--mantine-color-dimmed)', textDecoration: 'none' }}
                className="hover:opacity-80"
              >
                {link.label}
              </a>
            ))}

            {isAuthenticated && userEmail && (
              <Text size="sm" c="dimmed">
                {userEmail}
              </Text>
            )}

            <ActionIcon
              variant="default"
              onClick={() => toggleColorScheme()}
              size="lg"
              style={{
                backgroundColor: '#0a0a0a',
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

            {isAuthenticated && (
              <ActionIcon
                variant="default"
                size="lg"
                onClick={handleLogout}
                title="Logout"
                style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  color: '#FFFFFF'
                }}
              >
                <IconLogout size={20} />
              </ActionIcon>
            )}
          </Group>

          {/* Mobile Navigation */}
          <Group gap="sm" hiddenFrom="sm">
            <ActionIcon
              variant="default"
              onClick={() => toggleColorScheme()}
              size="lg"
              style={{
                backgroundColor: '#0a0a0a',
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
            <Burger 
              opened={opened} 
              onClick={toggle} 
              size="sm"
              color="#FFFFFF"
            />
          </Group>
        </Group>
      </nav>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        size="xs"
        padding="md"
        title="Navigation"
        position="right"
      >
        <Stack gap="md">
          {isAuthenticated && userEmail && (
            <Text size="sm" c="dimmed">
              {userEmail}
            </Text>
          )}

          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={close}
              style={{
                color: 'inherit',
                textDecoration: 'none',
                fontSize: '1.125rem',
                fontWeight: 500
              }}
              className="hover:opacity-80"
            >
              {link.label}
            </a>
          ))}

          {isAuthenticated && (
            <Button
              variant="default"
              leftSection={<IconLogout size={16} />}
              onClick={() => {
                close();
                handleLogout();
              }}
              fullWidth
            >
              Logout
            </Button>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
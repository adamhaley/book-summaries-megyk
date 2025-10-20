'use client';

import { useState, useEffect } from 'react';
import {
  Group,
  Text,
  ActionIcon,
  useMantineColorScheme,
  Burger,
  Drawer,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSun,
  IconMoon,
} from '@tabler/icons-react';

export function MainNavigation() {
  const [mounted, setMounted] = useState(false);
  const [opened, { toggle, close }] = useDisclosure(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <>
      <nav style={{ borderBottom: '1px solid var(--mantine-color-default-border)', height: '60px' }}>
        <Group h="100%" px="md" justify="space-between">
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
          </Group>

          {/* Mobile Navigation */}
          <Group gap="sm" hiddenFrom="sm">
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
            <Burger opened={opened} onClick={toggle} size="sm" />
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
        </Stack>
      </Drawer>
    </>
  );
}
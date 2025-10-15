'use client';

import { useState, useEffect } from 'react';
import {
  Group,
  Text,
  ActionIcon,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconSun,
  IconMoon,
} from '@tabler/icons-react';

export function MainNavigation() {
  const [mounted, setMounted] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
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
            Megyk Book Summaries
          </Text>
          
          <Group gap="md">
            <a href="/" style={{ color: 'var(--mantine-color-dimmed)', textDecoration: 'none' }} className="hover:opacity-80">
              Home
            </a>
            <a href="/dashboard" style={{ color: 'var(--mantine-color-dimmed)', textDecoration: 'none' }} className="hover:opacity-80">
              Dashboard
            </a>
            <a href="#" style={{ color: 'var(--mantine-color-dimmed)', textDecoration: 'none' }} className="hover:opacity-80">
              Library
            </a>
            <a href="#" style={{ color: 'var(--mantine-color-dimmed)', textDecoration: 'none' }} className="hover:opacity-80">
              Profile
            </a>
            
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
        </Group>
    </nav>
  );
}
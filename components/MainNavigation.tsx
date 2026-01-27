'use client';

import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  Group,
  Text,
  ActionIcon,
} from '@mantine/core';
import {
  IconLogout,
} from '@tabler/icons-react';

export function MainNavigation() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const isAuthenticated = !!isSignedIn;
  const userEmail = user?.primaryEmailAddress?.emailAddress || null;

  const handleLogout = async () => {
    await signOut();
    router.push('/auth/signin');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <>
      <nav style={{ 
        borderBottom: '1px solid #e5e7eb', 
        height: '140px',
        backgroundColor: '#ffffff'
      }}>
        <Group h="100%" px="md" justify="space-between">
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
              src="/megyk.svg" 
              alt="Megyk Books" 
              style={{ height: '120px', width: 'auto' }}
            />
          </a>

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

            {isAuthenticated && (
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
            )}
          </Group>

          {/* Mobile Navigation - Space for logo */}
          <Group gap="sm" hiddenFrom="sm">
            {/* Logo will go here */}
          </Group>
        </Group>
      </nav>

    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Group,
  Text,
  ActionIcon,
} from '@mantine/core';
import {
  IconLogout,
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';

export function MainNavigation() {
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('[MainNavigation] Checking auth...');
      const supabase = createClient();
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout after 5s')), 5000)
      );
      
      const authPromise = supabase.auth.getSession();
      const result = await Promise.race([authPromise, timeoutPromise]);
      
      if (result.error) {
        console.error('[MainNavigation] Auth error:', result.error);
        return;
      }
      
      if (result.data?.session?.user) {
        console.log('[MainNavigation] User authenticated:', result.data.session.user.email);
        setIsAuthenticated(true);
        setUserEmail(result.data.session.user.email || null);
      } else {
        console.log('[MainNavigation] No session found');
      }
    } catch (err) {
      console.error('[MainNavigation] Error checking auth:', err);
      // Don't block rendering if auth fails
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
        borderBottom: '1px solid #e5e7eb', 
        height: '60px',
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
              src="/logo.png" 
              alt="Megyk Books" 
              style={{ height: '40px', width: 'auto' }}
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
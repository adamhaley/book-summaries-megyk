'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  Paper,
  Portal,
  ScrollArea,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconSend, IconX } from '@tabler/icons-react';
import { Book } from '@/lib/types/books';

interface ChatWithBookProps {
  opened: boolean;
  onClose: () => void;
  book: Book | null;
}

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const renderWithLineBreaks = (content: string) =>
  content.split(/\n/).map((line, index, lines) => (
    <span key={`${index}-${line}`}>
      {line}
      {index < lines.length - 1 && <br />}
    </span>
  ));

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getChatReply = (payload: unknown) => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    const candidates = [
      data.reply,
      data.message,
      data.response,
      data.text,
      data.output,
    ];
    const found = candidates.find((value) => typeof value === 'string') as string | undefined;
    if (found) return found;
  }
  return '';
};

export function ChatWithBook({ opened, onClose, book }: ChatWithBookProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsAbortRef = useRef<AbortController | null>(null);
  const bookId = book?.id;
  const isMobile = useMediaQuery('(max-width: 576px)', true, { getInitialValueInEffect: false });

  const headerTitle = useMemo(() => {
    if (!book) return 'Chat with book';
    return `Chat with "${book.title}"`;
  }, [book]);

  useEffect(() => {
    if (!bookId) {
      setMessages([]);
      setSuggestions([]);
      suggestionsAbortRef.current?.abort();
      suggestionsAbortRef.current = null;
      return;
    }
    setMessages([]);
  }, [bookId]);

  useEffect(() => {
    if (!opened || !bookId) return;

    suggestionsAbortRef.current?.abort();
    const controller = new AbortController();
    suggestionsAbortRef.current = controller;

    setIsLoadingSuggestions(true);
    setSuggestions([]);

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[ChatWithBook] fetching suggestions', { bookId });
    }

    fetch('/api/v1/chat-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: bookId }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const details = await res.text().catch(() => '');
          throw new Error(`Failed to load suggestions (${res.status}). ${details}`.trim());
        }
        const payload = (await res.json().catch(() => ({}))) as { questions?: unknown };
        const questions = Array.isArray(payload?.questions)
          ? payload.questions.filter((q) => typeof q === 'string').slice(0, 3)
          : [];
        setSuggestions(questions as string[]);
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn('[ChatWithBook] suggestions failed', err);
        }
        // suggestions are non-critical; fail silently in UI
        setSuggestions([]);
      })
      .finally(() => {
        if (suggestionsAbortRef.current === controller) {
          setIsLoadingSuggestions(false);
        }
      });

    return () => {
      controller.abort();
      if (suggestionsAbortRef.current === controller) {
        suggestionsAbortRef.current = null;
      }
    };
  }, [opened, bookId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending, opened]);

  useEffect(() => {
    if (!opened) {
      setInput('');
      setIsSending(false);
      setErrorMessage(null);
    }
  }, [opened]);

  const sendMessageWithText = async (text: string) => {
    if (!book || !text.trim() || isSending) return;

    const messageText = text.trim();
    setInput('');
    setErrorMessage(null);
    setMessages((prev) => [...prev, { id: createId(), role: 'user', content: messageText }]);
    setIsSending(true);

    try {
      const response = await fetch('/api/v1/book-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: book.id,
          message: messageText,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to send chat message.');
      }

      const payload = await response.json().catch(() => ({}));
      const replyText = getChatReply(payload?.reply ?? payload?.data ?? payload);

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content: replyText || 'No response returned yet. Please try again.',
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Chat request failed.';
      setErrorMessage(message);
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const sendMessage = async () => {
    return sendMessageWithText(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Auto-send on click
    sendMessageWithText(suggestion);
  };

  if (!opened) return null;

  return (
    <Portal>
      <Paper
        id="tour-chatbox"
        shadow="lg"
        radius="md"
        withBorder
        style={{
          position: 'fixed',
          bottom: isMobile ? 0 : 24,
          left: isMobile ? 0 : undefined,
          right: isMobile ? 0 : 24,
          width: isMobile ? '100vw' : 480,
          maxWidth: isMobile ? '100vw' : 'calc(100vw - 32px)',
          height: 620,
          maxHeight: '85vh',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderColor: 'rgba(37, 99, 235, 0.55)',
        }}
      >
        <Group justify="space-between" px="md" py="sm" wrap="nowrap">
          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
            <img
              src="/chat-with-book/chat-with-book.png"
              alt=""
              aria-hidden="true"
              style={{ display: 'block', height: 34, width: 'auto' }}
            />
            <Tooltip label={headerTitle} withArrow>
              <Text fw={600} size="sm" lineClamp={1} style={{ flex: 1, minWidth: 0, color: '#000000' }}>
                {headerTitle}
              </Text>
            </Tooltip>
          </Group>
          <ActionIcon variant="subtle" size="sm" onClick={onClose} aria-label="Close chat">
            <IconX size={16} />
          </ActionIcon>
        </Group>
        <Divider />
        <ScrollArea style={{ flex: 1 }} px="md" py="sm">
          {(isLoadingSuggestions || suggestions.length > 0) && (
            <Box mb="sm">
              <Group gap={8} wrap="wrap">
                {isLoadingSuggestions && (
                  <Text size="xs" c="dimmed">
                    Suggestions…
                  </Text>
                )}
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    size="xs"
                    variant="light"
                    color="gray"
                    radius="xl"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isSending}
                    styles={{
                      root: {
                        backgroundColor: '#f3f4f6',
                        color: '#4b5563',
                        border: '1px solid #e5e7eb',
                        fontWeight: 500,
                        paddingLeft: 10,
                        paddingRight: 10,
                      },
                      rootHover: {
                        backgroundColor: '#e5e7eb',
                      },
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </Group>
            </Box>
          )}
          {messages.length === 0 && !isSending && (
            <Box py="md">
              <Text size="sm" c="dimmed">
                Ask a question about this book and I’ll respond here.
              </Text>
            </Box>
          )}
          {messages.map((message) => (
            <Box
              key={message.id}
              mb="sm"
              style={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                px="sm"
                py="xs"
                style={{
                  maxWidth: '80%',
                  borderRadius: 12,
                  backgroundColor: message.role === 'user' ? '#2563eb' : '#f3f4f6',
                  color: message.role === 'user' ? '#ffffff' : '#111827',
                }}
              >
                <Text size="md">{renderWithLineBreaks(message.content)}</Text>
              </Box>
            </Box>
          ))}
          {isSending && (
            <Box mb="sm" style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box
                px="sm"
                py="xs"
                style={{
                  borderRadius: 12,
                  backgroundColor: '#f3f4f6',
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Loader size="xs" color="blue" />
                <Text size="md">Thinking...</Text>
              </Box>
            </Box>
          )}
          {errorMessage && (
            <Box mb="sm">
              <Text size="xs" c="red">
                {errorMessage}
              </Text>
            </Box>
          )}
          <div ref={bottomRef} />
        </ScrollArea>
        <Divider />
        <Group px="md" py="sm" gap="xs">
          <TextInput
            id="tour-chat-input"
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            placeholder={book ? 'Type your message...' : 'Pick a book to chat'}
            disabled={!book || isSending}
            onKeyDown={handleKeyDown}
            style={{ flex: 1 }}
          />
          <ActionIcon
            variant="filled"
            color="blue"
            size="lg"
            onClick={sendMessage}
            disabled={!input.trim() || !book || isSending}
            aria-label="Send message"
          >
            <IconSend size={18} />
          </ActionIcon>
        </Group>
      </Paper>
    </Portal>
  );
}

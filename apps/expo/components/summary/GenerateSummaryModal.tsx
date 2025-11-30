import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Modal, Button } from '../ui';
import { VStack, HStack } from '../layout';
import { useTheme } from '../../theme';
import type { SummaryGenerationRequest } from '@megyk/api-client';

export interface GenerateSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (request: SummaryGenerationRequest) => Promise<void>;
  bookId: string;
  bookTitle?: string;
}

const STYLE_OPTIONS = [
  { value: 'narrative' as const, label: 'Narrative', description: 'Story-like summary with flowing prose' },
  { value: 'bullet_points' as const, label: 'Bullet Points', description: 'Concise bullet point format' },
  { value: 'workbook' as const, label: 'Workbook', description: 'Interactive with exercises and questions' },
];

const LENGTH_OPTIONS = [
  { value: '1pg' as const, label: 'Short', description: '1 sentence per chapter (~5 pages)' },
  { value: '5pg' as const, label: 'Medium', description: '1 paragraph per chapter (~10 pages)' },
  { value: '15pg' as const, label: 'Long', description: '1 page per chapter (~20 pages)' },
];

/**
 * Modal for generating book summaries
 * Replaces Mantine-based GenerateSummaryModal
 */
export function GenerateSummaryModal({
  visible,
  onClose,
  onGenerate,
  bookId,
  bookTitle,
}: GenerateSummaryModalProps) {
  const { theme } = useTheme();
  const [style, setStyle] = useState<'narrative' | 'bullet_points' | 'workbook'>('narrative');
  const [length, setLength] = useState<'1pg' | '5pg' | '15pg'>('5pg');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await onGenerate({ bookId, style, length });
      onClose();
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const title = bookTitle ? `Generate Summary: ${bookTitle}` : 'Generate Summary';

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <HStack spacing={theme.spacing[3]} justify="flex-end">
          <Button
            title="Cancel"
            onPress={onClose}
            variant="ghost"
            disabled={loading}
          />
          <Button
            title="Generate"
            onPress={handleGenerate}
            variant="primary"
            loading={loading}
          />
        </HStack>
      }
    >
      <VStack spacing={theme.spacing[6]}>
        {/* Style Selection */}
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.gray[900],
              marginBottom: theme.spacing[3],
            }}
          >
            Summary Style
          </Text>
          <VStack spacing={theme.spacing[2]}>
            {STYLE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                title={option.label}
                onPress={() => setStyle(option.value)}
                variant={style === option.value ? 'primary' : 'outline'}
                fullWidth
              />
            ))}
          </VStack>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.gray[600],
              marginTop: theme.spacing[2],
            }}
          >
            {STYLE_OPTIONS.find(o => o.value === style)?.description}
          </Text>
        </View>

        {/* Length Selection */}
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.gray[900],
              marginBottom: theme.spacing[3],
            }}
          >
            Summary Length
          </Text>
          <VStack spacing={theme.spacing[2]}>
            {LENGTH_OPTIONS.map((option) => (
              <Button
                key={option.value}
                title={option.label}
                onPress={() => setLength(option.value)}
                variant={length === option.value ? 'primary' : 'outline'}
                fullWidth
              />
            ))}
          </VStack>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.gray[600],
              marginTop: theme.spacing[2],
            }}
          >
            {LENGTH_OPTIONS.find(o => o.value === length)?.description}
          </Text>
        </View>
      </VStack>
    </Modal>
  );
}

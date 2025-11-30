import React from 'react';
import { Modal as RNModal, View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../theme';
import { Button } from './Button';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  footer,
}: ModalProps) {
  const { theme } = useTheme();

  const widthStyles: string = {
    sm: '80%',
    md: '90%',
    lg: '95%',
    full: '100%',
  }[size];

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing[4],
        }}
        onPress={onClose}
      >
        <Pressable
          style={[
            {
              backgroundColor: '#FFFFFF',
              borderRadius: theme.borderRadius.lg,
              maxHeight: '90%',
              ...theme.shadows.xl,
            },
            size === 'full' ? { width: '100%' } : { width: widthStyles as any },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: theme.spacing[4],
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.gray[200],
              }}
            >
              {title && (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '700',
                    color: theme.colors.primary.DEFAULT,
                    flex: 1,
                  }}
                >
                  {title}
                </Text>
              )}
              {showCloseButton && (
                <Pressable
                  onPress={onClose}
                  style={{
                    padding: theme.spacing[2],
                  }}
                >
                  <Text style={{ fontSize: 24, color: theme.colors.gray[600] }}>×</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Content */}
          <ScrollView
            style={{
              padding: theme.spacing[4],
            }}
            showsVerticalScrollIndicator={true}
          >
            {children}
          </ScrollView>

          {/* Footer */}
          {footer && (
            <View
              style={{
                padding: theme.spacing[4],
                borderTopWidth: 1,
                borderTopColor: theme.colors.gray[200],
              }}
            >
              {footer}
            </View>
          )}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui';
import { Container, VStack } from '../../components/layout';
import { DashboardLayout } from '../../components/dashboard';
import { useTheme } from '../../theme';
import { supabase } from '../../lib/supabase';

// Type definitions for preferences
type SummaryStyle = 'narrative' | 'bullet_points' | 'workbook';
type SummaryLength = '1pg' | '5pg' | '15pg';

interface UserPreferences {
  style: SummaryStyle;
  length: SummaryLength;
}

const SUMMARY_STYLE_OPTIONS = [
  { value: 'narrative' as const, label: 'Narrative', description: 'Story-like flow with connected ideas' },
  { value: 'bullet_points' as const, label: 'Bullet Points', description: 'Quick, scannable key points' },
  { value: 'workbook' as const, label: 'Workbook', description: 'Interactive exercises and reflections' }
];

const SUMMARY_LENGTH_OPTIONS = [
  { value: '1pg' as const, label: 'Short', description: 'One sentence per chapter' },
  { value: '5pg' as const, label: 'Medium', description: 'One paragraph per chapter' },
  { value: '15pg' as const, label: 'Long', description: 'One page per chapter' }
];

const DEFAULT_PREFERENCES: UserPreferences = {
  style: 'narrative',
  length: '5pg'
};

export default function PreferencesScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data?.preferences) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ preferences })
        .eq('user_id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Container>
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: theme.spacing[8]
          }}>
            <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          </View>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ScrollView>
        <Container>
          <VStack spacing={theme.spacing[6]}>
            {/* Header */}
            <View style={{ paddingTop: theme.spacing[4] }}>
              <Text style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2]
              }}>
                Preferences
              </Text>
              <Text style={{
                fontSize: 16,
                color: theme.colors.text.secondary
              }}>
                Customize your book summary experience
              </Text>
            </View>

            {/* Style Preferences */}
            <View>
              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[3]
              }}>
                Summary Style
              </Text>
              <VStack spacing={theme.spacing[2]}>
                {SUMMARY_STYLE_OPTIONS.map((option) => {
                  const isSelected = preferences.style === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setPreferences({ ...preferences, style: option.value as SummaryStyle })}
                      testID={`style-option-${option.value}`}
                      style={{
                        padding: theme.spacing[4],
                        borderRadius: theme.borderRadius.DEFAULT,
                        borderWidth: 2,
                        borderColor: isSelected ? theme.colors.primary[600] : theme.colors.border,
                        backgroundColor: isSelected ? theme.colors.primary[50] : theme.colors.background.paper
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing[1] }}>
                        <View style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: isSelected ? theme.colors.primary[600] : theme.colors.border,
                          backgroundColor: isSelected ? theme.colors.primary[600] : 'transparent',
                          marginRight: theme.spacing[3]
                        }} />
                        <Text style={{
                          fontSize: 18,
                          fontWeight: '600',
                          color: theme.colors.text.primary
                        }}>
                          {option.label}
                        </Text>
                      </View>
                      <Text style={{
                        fontSize: 14,
                        color: theme.colors.text.secondary,
                        marginLeft: theme.spacing[8]
                      }}>
                        {option.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </VStack>
            </View>

            {/* Length Preferences */}
            <View>
              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[3]
              }}>
                Summary Length
              </Text>
              <VStack spacing={theme.spacing[2]}>
                {SUMMARY_LENGTH_OPTIONS.map((option) => {
                  const isSelected = preferences.length === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setPreferences({ ...preferences, length: option.value as SummaryLength })}
                      testID={`length-option-${option.value}`}
                      style={{
                        padding: theme.spacing[4],
                        borderRadius: theme.borderRadius.DEFAULT,
                        borderWidth: 2,
                        borderColor: isSelected ? theme.colors.primary[600] : theme.colors.border,
                        backgroundColor: isSelected ? theme.colors.primary[50] : theme.colors.background.paper
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing[1] }}>
                        <View style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: isSelected ? theme.colors.primary[600] : theme.colors.border,
                          backgroundColor: isSelected ? theme.colors.primary[600] : 'transparent',
                          marginRight: theme.spacing[3]
                        }} />
                        <Text style={{
                          fontSize: 18,
                          fontWeight: '600',
                          color: theme.colors.text.primary
                        }}>
                          {option.label}
                        </Text>
                      </View>
                      <Text style={{
                        fontSize: 14,
                        color: theme.colors.text.secondary,
                        marginLeft: theme.spacing[8]
                      }}>
                        {option.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </VStack>
            </View>

            {/* Save Button */}
            <View style={{ paddingBottom: theme.spacing[8] }}>
              <Button
                onPress={savePreferences}
                disabled={saving}
                testID="save-preferences-button"
                style={{
                  backgroundColor: theme.colors.primary[600],
                  paddingVertical: theme.spacing[3],
                  paddingHorizontal: theme.spacing[6],
                  borderRadius: theme.borderRadius.DEFAULT
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Save Preferences
                  </Text>
                )}
              </Button>
            </View>
          </VStack>
        </Container>
      </ScrollView>
    </DashboardLayout>
  );
}

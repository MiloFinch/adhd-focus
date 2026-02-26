import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useFocus } from '../src/context/focus-context';
import { COLORS, FONT_FAMILY, GLOW, RADIUS } from '../src/theme';

export default function AddTaskScreen() {
  const router = useRouter();
  const { setTask, recentTaskTitles } = useFocus();

  const [title, setTitle] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  const onSubmit = () => {
    if (!canSubmit) {
      return;
    }

    setTask(title, estimatedPomodoros);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.label}>Co teraz robisz?</Text>
        <TextInput
          style={styles.input}
          placeholder="Co teraz robisz?"
          placeholderTextColor={COLORS.textSecondary}
          value={title}
          onChangeText={setTitle}
          autoFocus
          maxLength={100}
          selectionColor={COLORS.primary}
        />

        <Text style={styles.selectorLabel}>Ile pomodoro przewidujesz?</Text>
        <View style={styles.selectorRow}>
          {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => (
            <Pressable
              key={value}
              onPress={() => setEstimatedPomodoros(value)}
              style={({ pressed }) => [
                styles.selectorPill,
                estimatedPomodoros === value && styles.selectorPillActive,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.selectorText,
                  estimatedPomodoros === value && styles.selectorTextActive,
                ]}
              >
                {value}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          disabled={!canSubmit}
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.cta,
            !canSubmit && styles.ctaDisabled,
            pressed && canSubmit && styles.pressed,
          ]}
        >
          <Text style={styles.ctaText}>Ustaw zadanie</Text>
        </Pressable>

        <Text style={styles.recentHeading}>Ostatnie zadania</Text>
        <View style={styles.recentList}>
          {recentTaskTitles.length === 0 ? (
            <Text style={styles.emptyText}>Brak ostatnich zadań</Text>
          ) : (
            recentTaskTitles.map((item) => (
              <Pressable
                key={item}
                onPress={() => setTitle(item)}
                style={({ pressed }) => [styles.recentItem, pressed && styles.pressed]}
              >
                <Text style={styles.recentText}>{item}</Text>
              </Pressable>
            ))
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoiding: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  label: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...GLOW,
  },
  selectorLabel: {
    marginTop: 20,
    marginBottom: 10,
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY,
    fontSize: 15,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  selectorPill: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorPillActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(124,58,237,0.2)',
  },
  selectorText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY,
    fontWeight: '700',
    fontSize: 16,
  },
  selectorTextActive: {
    color: COLORS.textPrimary,
  },
  cta: {
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    ...GLOW,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '800',
  },
  recentHeading: {
    marginTop: 24,
    marginBottom: 10,
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '700',
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  recentText: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 16,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.84,
  },
});

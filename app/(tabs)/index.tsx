import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CircularTimer } from '../../src/components/CircularTimer';
import { useFocus } from '../../src/context/focus-context';
import { formatTimeMMSS } from '../../src/lib/time';
import { COLORS, FONT_FAMILY, GLOW, RADIUS } from '../../src/theme';

const phaseColor = (type: 'work' | 'short-break' | 'long-break'): string => {
  if (type === 'work') {
    return COLORS.amber;
  }

  if (type === 'short-break') {
    return COLORS.error;
  }

  return COLORS.secondary;
};

export default function HomeScreen() {
  const router = useRouter();
  const {
    hydrated,
    currentTask,
    phase,
    remainingSeconds,
    phaseProgress,
    isRunning,
    todayPomodoros,
    startTimer,
    pauseTimer,
    stopTimer,
  } = useFocus();

  const timerLabel = useMemo(() => formatTimeMMSS(remainingSeconds), [remainingSeconds]);
  const currentPhaseColor = phaseColor(phase.type);

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const mainButtonLabel = isRunning ? 'PAUSE' : 'START';
  const canStart = Boolean(currentTask) || phase.type !== 'work';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.taskCard}>
        <Text style={styles.taskLabel}>Aktualne zadanie</Text>
        <Text numberOfLines={2} style={styles.taskTitle}>
          {currentTask?.title ?? 'Brak zadania'}
        </Text>
        {currentTask ? (
          <Text style={styles.taskMeta}>
            Pomodoro: {currentTask.completedPomodoros}/{currentTask.estimatedPomodoros}
          </Text>
        ) : null}
      </View>

      <View style={styles.timerWrap}>
        <CircularTimer
          progress={phaseProgress}
          ringColor={currentPhaseColor}
          timeLabel={timerLabel}
        />
      </View>

      <Text style={styles.status}>Status: {phase.label}</Text>
      <Text style={styles.counter}>🍅 x{todayPomodoros}</Text>

      <View style={styles.actions}>
        <Pressable
          disabled={!canStart}
          onPress={() => {
            if (isRunning) {
              void pauseTimer();
            } else {
              void startTimer();
            }
          }}
          style={({ pressed }) => [
            styles.mainButton,
            isRunning ? styles.pauseButton : styles.startButton,
            !canStart && styles.disabledButton,
            pressed && canStart && styles.pressed,
          ]}
        >
          <Text style={styles.mainButtonText}>{mainButtonLabel}</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            void stopTimer();
          }}
          style={({ pressed }) => [styles.stopButton, pressed && styles.pressed]}
        >
          <Text style={styles.stopButtonText}>STOP</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            router.push('/add-task');
          }}
          style={({ pressed }) => [styles.changeTaskButton, pressed && styles.pressed]}
        >
          <Text style={styles.changeTaskText}>Zmień zadanie</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginTop: 8,
    ...GLOW,
  },
  taskLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    marginBottom: 6,
  },
  taskTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 28,
    fontWeight: '700',
  },
  taskMeta: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY,
    marginTop: 8,
    fontSize: 14,
  },
  timerWrap: {
    marginTop: 26,
    marginBottom: 8,
  },
  status: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
  },
  counter: {
    color: COLORS.secondary,
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 18,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginTop: 'auto',
    marginBottom: 18,
  },
  mainButton: {
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    ...GLOW,
  },
  startButton: {
    backgroundColor: COLORS.primary,
  },
  pauseButton: {
    backgroundColor: COLORS.amber,
  },
  mainButtonText: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  stopButton: {
    width: '100%',
    backgroundColor: COLORS.error,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '700',
  },
  changeTaskButton: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeTaskText: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
});

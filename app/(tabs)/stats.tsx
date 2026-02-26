import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFocus } from '../../src/context/focus-context';
import { COLORS, FONT_FAMILY, GLOW, RADIUS } from '../../src/theme';

const BAR_MAX_HEIGHT = 120;

export default function StatsScreen() {
  const { todayStats, weeklyStats, streak } = useFocus();

  const maxDailyPomodoros = useMemo(() => {
    const max = Math.max(...weeklyStats.map((item) => item.pomodorosCompleted), 1);
    return max;
  }, [weeklyStats]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Dzisiejsze statystyki</Text>

        <View style={styles.todayCards}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Pomodoro</Text>
            <Text style={styles.cardValue}>{todayStats.pomodorosCompleted}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Focus (min)</Text>
            <Text style={styles.cardValue}>{todayStats.focusMinutes}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Zadania</Text>
            <Text style={styles.cardValue}>{todayStats.tasksFinished}</Text>
          </View>
        </View>

        <View style={styles.streakCard}>
          <Text style={styles.streakLabel}>Streak</Text>
          <Text style={styles.streakValue}>🔥 {streak} dni</Text>
        </View>

        <Text style={styles.chartHeading}>Ostatnie 7 dni</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartBars}>
            {weeklyStats.map((day) => {
              const ratio = day.pomodorosCompleted / maxDailyPomodoros;
              const height = Math.max(8, ratio * BAR_MAX_HEIGHT);

              return (
                <View key={day.dateKey} style={styles.barColumn}>
                  <Text style={styles.barTopValue}>{day.pomodorosCompleted}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height,
                          backgroundColor:
                            day.pomodorosCompleted > 0 ? COLORS.primary : 'rgba(148,163,184,0.2)',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{day.dayLabel}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  heading: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 14,
  },
  todayCards: {
    gap: 10,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...GLOW,
  },
  cardLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    marginBottom: 3,
  },
  cardValue: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 30,
    fontWeight: '800',
  },
  streakCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.amber,
  },
  streakLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY,
    fontSize: 14,
  },
  streakValue: {
    marginTop: 6,
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 28,
    fontWeight: '800',
  },
  chartHeading: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 22,
    marginBottom: 10,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barColumn: {
    alignItems: 'center',
    width: 40,
  },
  barTopValue: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    marginBottom: 4,
  },
  barTrack: {
    height: BAR_MAX_HEIGHT,
    width: 26,
    borderRadius: 10,
    backgroundColor: 'rgba(148,163,184,0.15)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 10,
  },
  barLabel: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    textTransform: 'capitalize',
  },
});

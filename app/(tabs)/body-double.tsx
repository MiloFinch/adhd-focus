import { useAudioPlayer, AudioMode, setAudioModeAsync } from 'expo-audio';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useFocus } from '../../src/context/focus-context';
import { formatTimeMMSS } from '../../src/lib/time';
import { COLORS, FONT_FAMILY, RADIUS } from '../../src/theme';

const AMBIENT_SOUND = require('../../assets/ambient.mp3');

export default function BodyDoubleScreen() {
  const router = useRouter();
  const { phase, remainingSeconds } = useFocus();



  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const gradientLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(fade, {
          toValue: 1,
          duration: 14000,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0,
          duration: 14000,
          useNativeDriver: true,
        }),
      ]),
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
      ]),
    );

    gradientLoop.start();
    pulseLoop.start();

    return () => {
      gradientLoop.stop();
      pulseLoop.stop();
    };
  }, [fade, pulse]);


  const timerText = useMemo(() => formatTimeMMSS(remainingSeconds), [remainingSeconds]);

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.pressable} onPress={() => router.replace('/(tabs)')}>
        <LinearGradient
          colors={['#0F0F1A', '#1A1A2E', '#2E1065']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
          <LinearGradient
            colors={['#0F0F1A', '#1A1A2E', '#0F766E']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <View style={styles.centerContent}>
          <Animated.View style={[styles.orb, { transform: [{ scale: pulse }] }]} />
          <Text style={styles.message}>Pracuję razem z Tobą 👤</Text>
          <Text style={styles.hint}>Tap anywhere to exit</Text>
        </View>

        <View style={styles.timerCard}>
          <Text style={styles.phaseLabel}>{phase.label}</Text>
          <Text style={styles.timer}>{timerText}</Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pressable: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(124, 58, 237, 0.32)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 12,
    marginBottom: 26,
  },
  message: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  hint: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY,
    fontSize: 14,
  },
  timerCard: {
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(26,26,46,0.92)',
    borderColor: COLORS.primary,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 6,
  },
  phaseLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    marginBottom: 4,
  },
  timer: {
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 40,
    fontWeight: '800',
  },
});

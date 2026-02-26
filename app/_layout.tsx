import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { FocusProvider } from '../src/context/focus-context';
import { COLORS, FONT_FAMILY } from '../src/theme';

export default function RootLayout() {
  return (
    <FocusProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add-task"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            headerShown: true,
            title: 'Zmień zadanie',
            headerStyle: {
              backgroundColor: COLORS.surface,
            },
            headerTintColor: COLORS.textPrimary,
            headerTitleStyle: {
              fontFamily: FONT_FAMILY,
              fontWeight: '700',
            },
          }}
        />
      </Stack>
    </FocusProvider>
  );
}

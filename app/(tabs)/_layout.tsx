import { Tabs } from 'expo-router';
import React from 'react';

import { COLORS, FONT_FAMILY } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: 'transparent',
          height: 74,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontFamily: FONT_FAMILY,
          fontWeight: '600',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '🎯 Fokus',
        }}
      />
      <Tabs.Screen
        name="body-double"
        options={{
          title: '👥 Body Double',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '📊 Statystyki',
        }}
      />
    </Tabs>
  );
}

# ADHD Focus (Expo MVP)

Dark, minimal, one-task-at-a-time productivity app for ADHD users.

## Stack

- Expo SDK 55 + TypeScript
- expo-router (tabs + modal)
- React Native StyleSheet
- AsyncStorage (`@react-native-async-storage/async-storage`)
- expo-notifications (Pomodoro end alerts)
- expo-av (Body Double ambient loop)
- React Native Animated (timer ring + body double animation)

## Features

- One active task at a time (`Brak zadania` fallback)
- Pomodoro flow:
  - 25 work
  - 5 short break
  - 25 work
  - 5 short break
  - 25 work
  - 5 short break
  - 25 work
  - 15 long break
- Circular animated timer ring
- Start / Pause / Stop controls
- Change task modal
- Estimated pomodoros (1-8)
- Recent tasks (last 5)
- Body Double full-screen mode with ambient sound + animated gradient
- Stats screen:
  - Today's pomodoros
  - Total focus time
  - Tasks finished
  - Last 7 days bar chart (without chart library)
  - Streak counter
- Persistence for tasks/sessions/timer state via AsyncStorage

## Design System

Implemented with the requested palette and visual behavior:

- Background `#0F0F1A`
- Card `#1A1A2E`
- Primary `#7C3AED`
- Secondary `#10B981`
- Amber `#F59E0B`
- Error/break `#EF4444`
- Text primary `#F8FAFC`
- Text secondary `#94A3B8`
- Border radius `12-16`
- Purple glow shadow for active elements
- Inter font family usage across screens (`fontFamily: 'Inter'`)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start Expo:

```bash
npx expo start
```

3. Open on iOS/Android simulator or Expo Go.

## Project Structure

```text
app/
  _layout.tsx
  add-task.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    body-double.tsx
    stats.tsx
src/
  context/focus-context.tsx
  components/CircularTimer.tsx
  constants/pomodoro.ts
  lib/time.ts
  theme.ts
  types.ts
assets/
  ambient.mp3
```

## Notes

- Notifications are configured at startup and scheduled as background-safe timer completion backup.
- Ambient audio loop is bundled locally in `assets/ambient.mp3`.

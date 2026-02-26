import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { POMODORO_PHASES, phaseDurationSeconds } from '../constants/pomodoro';
import { dateKey, dayLabel, subtractDays } from '../lib/time';
import type { DayStats, PomodoroSession, PomodoroType, Task, TodayStats } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldPlaySound: true,
      shouldShowAlert: true,
      shouldSetBadge: false,
    }) as Notifications.NotificationBehavior,
});

const STORAGE_KEY = '@adhd-focus/persisted-state';

interface PersistedState {
  tasks: Task[];
  currentTaskId: string | null;
  recentTaskTitles: string[];
  sessions: PomodoroSession[];
  phaseIndex: number;
  remainingSeconds: number;
}

interface FocusContextValue {
  hydrated: boolean;
  tasks: Task[];
  currentTask: Task | null;
  recentTaskTitles: string[];
  phaseIndex: number;
  phase: (typeof POMODORO_PHASES)[number];
  remainingSeconds: number;
  phaseProgress: number;
  isRunning: boolean;
  todayPomodoros: number;
  todayStats: TodayStats;
  weeklyStats: DayStats[];
  streak: number;
  setTask: (title: string, estimatedPomodoros: number) => void;
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
}

const NOTIFICATION_ID = 'pomodoro-end';
const FocusContext = createContext<FocusContextValue | null>(null);

const createId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const configureNotifications = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('pomodoro', {
      name: 'Pomodoro',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 200, 250],
      lightColor: '#7C3AED',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.granted) {
    return;
  }

  await Notifications.requestPermissionsAsync();
};

export const FocusProvider = ({ children }: { children: React.ReactNode }) => {
  const [hydrated, setHydrated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [recentTaskTitles, setRecentTaskTitles] = useState<string[]>([]);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(phaseDurationSeconds(POMODORO_PHASES[0]));
  const [isRunning, setIsRunning] = useState(false);
  const [activeSessionStartedAt, setActiveSessionStartedAt] = useState<string | null>(null);

  const phase = POMODORO_PHASES[phaseIndex] ?? POMODORO_PHASES[0];
  const completingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadState = async () => {
      try {
        await configureNotifications();
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          return;
        }

        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        if (Array.isArray(parsed.tasks)) {
          setTasks(parsed.tasks);
        }
        if (Array.isArray(parsed.recentTaskTitles)) {
          setRecentTaskTitles(parsed.recentTaskTitles.slice(0, 5));
        }
        if (Array.isArray(parsed.sessions)) {
          setSessions(parsed.sessions);
        }
        if (typeof parsed.currentTaskId === 'string' || parsed.currentTaskId === null) {
          setCurrentTaskId(parsed.currentTaskId ?? null);
        }
        if (
          typeof parsed.phaseIndex === 'number' &&
          parsed.phaseIndex >= 0 &&
          parsed.phaseIndex < POMODORO_PHASES.length
        ) {
          setPhaseIndex(parsed.phaseIndex);
        }

        const safePhaseIndex =
          typeof parsed.phaseIndex === 'number' &&
            parsed.phaseIndex >= 0 &&
            parsed.phaseIndex < POMODORO_PHASES.length
            ? parsed.phaseIndex
            : 0;
        const fallbackSeconds = phaseDurationSeconds(POMODORO_PHASES[safePhaseIndex]);
        if (typeof parsed.remainingSeconds === 'number') {
          setRemainingSeconds(Math.max(0, parsed.remainingSeconds));
        } else {
          setRemainingSeconds(fallbackSeconds);
        }
      } catch {
        // Ignore malformed persisted data and continue with defaults.
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    };

    void loadState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const payload: PersistedState = {
      tasks,
      currentTaskId,
      recentTaskTitles,
      sessions,
      phaseIndex,
      remainingSeconds,
    };

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [currentTaskId, hydrated, phaseIndex, recentTaskTitles, remainingSeconds, sessions, tasks]);

  const cancelScheduledNotification = useCallback(async () => {
    try {
      await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
      await Notifications.dismissAllNotificationsAsync();
    } catch {
      // Ignore cancellation issues.
    }
  }, []);

  const scheduleEndNotification = useCallback(
    async (seconds: number, type: PomodoroType) => {
      if (seconds <= 0) {
        return;
      }

      await cancelScheduledNotification();

      const title = type === 'work' ? 'Koniec pomodoro' : 'Koniec przerwy';
      const body =
        type === 'work'
          ? 'Świetna robota. Zrób przerwę i wróć do zadania.'
          : 'Przerwa minęła. Wracamy do focusu.';

      try {
        await Notifications.scheduleNotificationAsync({
          identifier: NOTIFICATION_ID,
          content: {
            title,
            body,
            sound: true,
            data: { type },
          },
          trigger: {
            type: 'timeInterval',
            seconds: Math.max(1, Math.floor(seconds)),
            repeats: false,
            channelId: 'pomodoro',
          } as any,
        });
      } catch {
        // Ignore scheduling issues.
      }
    },
    [cancelScheduledNotification],
  );

  const completePhase = useCallback(async () => {
    const completedAt = new Date().toISOString();
    const sessionStartFallback = new Date(
      Date.now() - phaseDurationSeconds(phase) * 1000,
    ).toISOString();

    const session: PomodoroSession = {
      id: createId(),
      taskId: currentTaskId ?? 'no-task',
      type: phase.type,
      startedAt: activeSessionStartedAt ?? sessionStartFallback,
      completedAt,
    };

    setSessions((prev) => [...prev, session]);

    if (phase.type === 'work' && currentTaskId) {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== currentTaskId) {
            return task;
          }

          const completedPomodoros = task.completedPomodoros + 1;
          const isCompleted = completedPomodoros >= task.estimatedPomodoros;
          return {
            ...task,
            completedPomodoros,
            isCompleted,
            completedAt: isCompleted ? completedAt : task.completedAt,
          };
        }),
      );
    }

    const nextPhaseIndex = (phaseIndex + 1) % POMODORO_PHASES.length;
    const nextPhase = POMODORO_PHASES[nextPhaseIndex];

    setPhaseIndex(nextPhaseIndex);
    setRemainingSeconds(phaseDurationSeconds(nextPhase));
    setIsRunning(false);
    setActiveSessionStartedAt(null);

    await cancelScheduledNotification();
  }, [activeSessionStartedAt, cancelScheduledNotification, currentTaskId, phase, phaseIndex]);

  useEffect(() => {
    if (!hydrated || !isRunning) {
      return;
    }

    if (remainingSeconds <= 0) {
      if (completingRef.current) {
        return;
      }

      completingRef.current = true;
      void completePhase().finally(() => {
        completingRef.current = false;
      });
      return;
    }

    const timer = setTimeout(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [completePhase, hydrated, isRunning, remainingSeconds]);

  const setTask = useCallback(
    (title: string, estimatedPomodoros: number) => {
      const cleanedTitle = title.trim();
      if (!cleanedTitle) {
        return;
      }

      const task: Task = {
        id: createId(),
        title: cleanedTitle,
        estimatedPomodoros: Math.max(1, Math.min(8, estimatedPomodoros)),
        completedPomodoros: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };

      setTasks((prev) => [task, ...prev]);
      setCurrentTaskId(task.id);
      setRecentTaskTitles((prev) => {
        const normalized = cleanedTitle.toLowerCase();
        const deduped = prev.filter((item) => item.toLowerCase() !== normalized);
        return [cleanedTitle, ...deduped].slice(0, 5);
      });

      setPhaseIndex(0);
      setRemainingSeconds(phaseDurationSeconds(POMODORO_PHASES[0]));
      setIsRunning(false);
      setActiveSessionStartedAt(null);
      void cancelScheduledNotification();
    },
    [cancelScheduledNotification],
  );

  const startTimer = useCallback(async () => {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    setActiveSessionStartedAt((prev) => prev ?? new Date().toISOString());
    await scheduleEndNotification(remainingSeconds, phase.type);
  }, [isRunning, phase.type, remainingSeconds, scheduleEndNotification]);

  const pauseTimer = useCallback(async () => {
    setIsRunning(false);
    await cancelScheduledNotification();
  }, [cancelScheduledNotification]);

  const stopTimer = useCallback(async () => {
    setIsRunning(false);
    setPhaseIndex(0);
    setRemainingSeconds(phaseDurationSeconds(POMODORO_PHASES[0]));
    setActiveSessionStartedAt(null);
    await cancelScheduledNotification();
  }, [cancelScheduledNotification]);

  useEffect(() => {
    return () => {
      void cancelScheduledNotification();
    };
  }, [cancelScheduledNotification]);

  const currentTask = useMemo(
    () => tasks.find((task) => task.id === currentTaskId) ?? null,
    [currentTaskId, tasks],
  );

  const workSessionsByDay = useMemo(() => {
    const bucket = new Map<string, number>();

    for (const session of sessions) {
      if (session.type !== 'work' || !session.completedAt) {
        continue;
      }

      const key = dateKey(session.completedAt);
      bucket.set(key, (bucket.get(key) ?? 0) + 1);
    }

    return bucket;
  }, [sessions]);

  const tasksFinishedByDay = useMemo(() => {
    const bucket = new Map<string, number>();

    for (const task of tasks) {
      if (!task.isCompleted || !task.completedAt) {
        continue;
      }

      const key = dateKey(task.completedAt);
      bucket.set(key, (bucket.get(key) ?? 0) + 1);
    }

    return bucket;
  }, [tasks]);

  const weeklyStats = useMemo<DayStats[]>(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = subtractDays(6 - index);
      const key = dateKey(date);
      const pomodorosCompleted = workSessionsByDay.get(key) ?? 0;

      return {
        dateKey: key,
        dayLabel: dayLabel(date),
        pomodorosCompleted,
        focusMinutes: pomodorosCompleted * 25,
        tasksFinished: tasksFinishedByDay.get(key) ?? 0,
      };
    });
  }, [tasksFinishedByDay, workSessionsByDay]);

  const todayKey = dateKey(new Date());

  const todayStats = useMemo<TodayStats>(() => {
    const pomodorosCompleted = workSessionsByDay.get(todayKey) ?? 0;
    return {
      pomodorosCompleted,
      focusMinutes: pomodorosCompleted * 25,
      tasksFinished: tasksFinishedByDay.get(todayKey) ?? 0,
    };
  }, [tasksFinishedByDay, todayKey, workSessionsByDay]);

  const streak = useMemo(() => {
    let count = 0;

    for (let dayOffset = 0; dayOffset < 365; dayOffset += 1) {
      const key = dateKey(subtractDays(dayOffset));
      if ((workSessionsByDay.get(key) ?? 0) > 0) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }, [workSessionsByDay]);

  const phaseProgress = useMemo(() => {
    const total = phaseDurationSeconds(phase);
    if (total <= 0) {
      return 0;
    }

    return Math.min(1, Math.max(0, (total - remainingSeconds) / total));
  }, [phase, remainingSeconds]);

  const value = useMemo<FocusContextValue>(
    () => ({
      hydrated,
      tasks,
      currentTask,
      recentTaskTitles,
      phaseIndex,
      phase,
      remainingSeconds,
      phaseProgress,
      isRunning,
      todayPomodoros: todayStats.pomodorosCompleted,
      todayStats,
      weeklyStats,
      streak,
      setTask,
      startTimer,
      pauseTimer,
      stopTimer,
    }),
    [
      currentTask,
      hydrated,
      isRunning,
      phase,
      phaseIndex,
      phaseProgress,
      recentTaskTitles,
      remainingSeconds,
      setTask,
      startTimer,
      stopTimer,
      streak,
      tasks,
      todayStats,
      weeklyStats,
      pauseTimer,
    ],
  );

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
};

export const useFocus = (): FocusContextValue => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used inside FocusProvider');
  }
  return context;
};

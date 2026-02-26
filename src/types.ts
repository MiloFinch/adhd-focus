export interface Task {
  id: string;
  title: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
}

export type PomodoroType = 'work' | 'short-break' | 'long-break';

export interface PomodoroSession {
  id: string;
  taskId: string;
  type: PomodoroType;
  startedAt: string;
  completedAt?: string;
}

export interface PomodoroPhase {
  type: PomodoroType;
  label: 'Work' | 'Short Break' | 'Long Break';
  minutes: number;
}

export interface DayStats {
  dateKey: string;
  dayLabel: string;
  pomodorosCompleted: number;
  focusMinutes: number;
  tasksFinished: number;
}

export interface TodayStats {
  pomodorosCompleted: number;
  focusMinutes: number;
  tasksFinished: number;
}

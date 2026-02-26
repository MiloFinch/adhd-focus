import type { PomodoroPhase } from '../types';

export const POMODORO_PHASES: PomodoroPhase[] = [
  { type: 'work', label: 'Work', minutes: 25 },
  { type: 'short-break', label: 'Short Break', minutes: 5 },
  { type: 'work', label: 'Work', minutes: 25 },
  { type: 'short-break', label: 'Short Break', minutes: 5 },
  { type: 'work', label: 'Work', minutes: 25 },
  { type: 'short-break', label: 'Short Break', minutes: 5 },
  { type: 'work', label: 'Work', minutes: 25 },
  { type: 'long-break', label: 'Long Break', minutes: 15 },
];

export const phaseDurationSeconds = (phase: PomodoroPhase): number => phase.minutes * 60;

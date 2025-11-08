export interface SessionConfig {
  apiKey: string;
  defaultDurationMinutes: number;
  maxDurationMinutes: number;
  pauseWarningSeconds: number;
  isPro: boolean;
}

export enum SessionState {
  IDLE = 'idle',
  STARTING = 'starting',
  ACTIVE = 'active',
  PAUSED = 'paused',
  RESUMING = 'resuming',
  TERMINATING = 'terminating',
  TERMINATED = 'terminated',
  ERROR = 'error'
}

export interface SessionInfo {
  sandboxId: string | null;
  state: SessionState;
  startTime: number | null;
  durationMinutes: number;
  remainingSeconds: number;
  pauseCountdownSeconds: number;
  error: string | null;
}

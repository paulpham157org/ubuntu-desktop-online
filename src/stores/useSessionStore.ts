import { create } from 'zustand';
import { E2BSessionManager } from '../services/E2BSessionManager';
import { SessionInfo, SessionState, SessionConfig } from '../types/session';

interface SessionStore {
  sessionInfo: SessionInfo;
  sessionManager: E2BSessionManager | null;

  // Actions
  initializeManager: (config: SessionConfig) => void;
  startSession: (durationMinutes?: number) => Promise<void>;
  continueSession: () => Promise<void>;
  terminateSession: () => Promise<void>;
  executeCode: (code: string) => Promise<string>;
  updateSessionInfo: (info: SessionInfo) => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessionInfo: {
    sandboxId: null,
    state: SessionState.IDLE,
    startTime: null,
    durationMinutes: 0,
    remainingSeconds: 0,
    pauseCountdownSeconds: 0,
    error: null
  },
  sessionManager: null,

  initializeManager: (config: SessionConfig) => {
    const manager = new E2BSessionManager(config);

    // Subscribe to session updates
    manager.subscribe((info) => {
      set({ sessionInfo: info });
    });

    set({ sessionManager: manager });
  },

  startSession: async (durationMinutes?: number) => {
    const { sessionManager } = get();
    if (!sessionManager) {
      throw new Error('Session manager chưa được khởi tạo');
    }
    await sessionManager.startSession(durationMinutes);
  },

  continueSession: async () => {
    const { sessionManager } = get();
    if (!sessionManager) {
      throw new Error('Session manager chưa được khởi tạo');
    }
    await sessionManager.continueSession();
  },

  terminateSession: async () => {
    const { sessionManager } = get();
    if (!sessionManager) {
      throw new Error('Session manager chưa được khởi tạo');
    }
    await sessionManager.terminateSession();
  },

  executeCode: async (code: string) => {
    const { sessionManager } = get();
    if (!sessionManager) {
      throw new Error('Session manager chưa được khởi tạo');
    }
    return await sessionManager.executeCode(code);
  },

  updateSessionInfo: (info: SessionInfo) => {
    set({ sessionInfo: info });
  }
}));

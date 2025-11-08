import { Sandbox } from '@e2b/code-interpreter';
import { SessionConfig, SessionState, SessionInfo } from '../types/session';

export class E2BSessionManager {
  private sandbox: Sandbox | null = null;
  private config: SessionConfig;
  private sessionStartTime: number | null = null;
  private sessionDurationMs: number = 0;
  private sessionTimeoutId: NodeJS.Timeout | null = null;
  private pauseTimeoutId: NodeJS.Timeout | null = null;
  private countdownIntervalId: NodeJS.Timeout | null = null;
  private state: SessionState = SessionState.IDLE;
  private remainingSeconds: number = 0;
  private pauseCountdownSeconds: number = 0;
  private listeners: Set<(info: SessionInfo) => void> = new Set();

  constructor(config: SessionConfig) {
    this.config = config;
  }

  /**
   * Subscribe listener to receive session state change notifications
   */
  public subscribe(listener: (info: SessionInfo) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners about state changes
   */
  private notify(): void {
    const info = this.getSessionInfo();
    this.listeners.forEach(listener => listener(info));
  }

  /**
   * Get current session information
   */
  public getSessionInfo(): SessionInfo {
    return {
      sandboxId: this.sandbox?.id || null,
      state: this.state,
      startTime: this.sessionStartTime,
      durationMinutes: this.sessionDurationMs / (60 * 1000),
      remainingSeconds: this.remainingSeconds,
      pauseCountdownSeconds: this.pauseCountdownSeconds,
      error: null
    };
  }

  /**
   * Start sandbox with optional session duration
   * @param durationMinutes - Session duration (default 59 minutes, max 23h59 with Pro Plan)
   */
  public async startSession(durationMinutes?: number): Promise<void> {
    try {
      this.state = SessionState.STARTING;
      this.notify();

      // Determine session duration
      let duration = durationMinutes || this.config.defaultDurationMinutes;

      // Limit duration based on plan
      if (!this.config.isPro && duration > this.config.defaultDurationMinutes) {
        console.warn(
          `Free plan only supports up to ${this.config.defaultDurationMinutes} minutes. ` +
          `Upgrade to Pro Plan to extend up to ${this.config.maxDurationMinutes} minutes.`
        );
        duration = this.config.defaultDurationMinutes;
      } else if (duration > this.config.maxDurationMinutes) {
        duration = this.config.maxDurationMinutes;
      }

      this.sessionDurationMs = duration * 60 * 1000;
      this.sessionStartTime = Date.now();
      this.remainingSeconds = Math.floor(this.sessionDurationMs / 1000);

      // Initialize E2B sandbox
      this.sandbox = await Sandbox.create({
        apiKey: this.config.apiKey,
        timeoutMs: this.sessionDurationMs
      });

      console.log(
        `✅ Sandbox initialized: ${this.sandbox.id}\n` +
        `⏱️  Session duration: ${duration} minutes\n` +
        `📦 Plan: ${this.config.isPro ? 'Pro' : 'Free'}`
      );

      this.state = SessionState.ACTIVE;
      this.notify();

      // Start countdown
      this.startCountdown();

      // Setup auto-pause on timeout
      this.sessionTimeoutId = setTimeout(() => {
        this.pauseSession();
      }, this.sessionDurationMs);

    } catch (error) {
      this.state = SessionState.ERROR;
      this.notify();
      throw new Error(`Failed to initialize sandbox: ${error}`);
    }
  }

  /**
   * Countdown remaining time
   */
  private startCountdown(): void {
    this.countdownIntervalId = setInterval(() => {
      if (this.state === SessionState.ACTIVE && this.sessionStartTime) {
        const elapsed = Date.now() - this.sessionStartTime;
        const remaining = Math.max(0, this.sessionDurationMs - elapsed);
        this.remainingSeconds = Math.floor(remaining / 1000);

        if (this.remainingSeconds <= 0) {
          this.clearCountdown();
        }

        this.notify();
      }
    }, 1000);
  }

  /**
   * Stop countdown
   */
  private clearCountdown(): void {
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }
  }

  /**
   * Pause sandbox when time expires
   */
  private async pauseSession(): Promise<void> {
    if (!this.sandbox || this.state !== SessionState.ACTIVE) {
      return;
    }

    try {
      console.log('⏸️  Session time expired. Pausing sandbox...');

      this.state = SessionState.PAUSED;
      this.clearCountdown();
      this.notify();

      // Start 59-second countdown for user decision
      this.pauseCountdownSeconds = this.config.pauseWarningSeconds;
      this.startPauseCountdown();

      // Auto-delete sandbox after 59 seconds if no response
      this.pauseTimeoutId = setTimeout(() => {
        this.terminateSession(true);
      }, this.config.pauseWarningSeconds * 1000);

    } catch (error) {
      console.error('Error pausing sandbox:', error);
      this.state = SessionState.ERROR;
      this.notify();
    }
  }

  /**
   * Countdown waiting time after pause
   */
  private startPauseCountdown(): void {
    this.countdownIntervalId = setInterval(() => {
      if (this.state === SessionState.PAUSED) {
        this.pauseCountdownSeconds = Math.max(0, this.pauseCountdownSeconds - 1);

        if (this.pauseCountdownSeconds <= 0) {
          this.clearCountdown();
        }

        this.notify();
      }
    }, 1000);
  }

  /**
   * Continue session - user presses Continue button
   */
  public async continueSession(): Promise<void> {
    if (this.state !== SessionState.PAUSED) {
      return;
    }

    try {
      this.state = SessionState.RESUMING;
      this.notify();

      // Cancel sandbox deletion timeout
      if (this.pauseTimeoutId) {
        clearTimeout(this.pauseTimeoutId);
        this.pauseTimeoutId = null;
      }

      this.clearCountdown();

      console.log('▶️  Resuming session...');

      // Restart session with default duration
      await this.terminateSession(false);
      await this.startSession(this.config.defaultDurationMinutes);

    } catch (error) {
      console.error('Error continuing session:', error);
      this.state = SessionState.ERROR;
      this.notify();
    }
  }

  /**
   * Completely terminate sandbox
   * @param auto - True if auto-deleted due to timeout
   */
  public async terminateSession(auto: boolean = false): Promise<void> {
    if (!this.sandbox) {
      return;
    }

    try {
      this.state = SessionState.TERMINATING;
      this.notify();

      // Clear all timers
      if (this.sessionTimeoutId) {
        clearTimeout(this.sessionTimeoutId);
        this.sessionTimeoutId = null;
      }
      if (this.pauseTimeoutId) {
        clearTimeout(this.pauseTimeoutId);
        this.pauseTimeoutId = null;
      }
      this.clearCountdown();

      const sandboxId = this.sandbox.id;

      // Close sandbox
      await this.sandbox.close();
      this.sandbox = null;
      this.sessionStartTime = null;
      this.remainingSeconds = 0;
      this.pauseCountdownSeconds = 0;

      if (auto) {
        console.log(`🗑️  Sandbox ${sandboxId} deleted due to no response after 59 seconds`);
      } else {
        console.log(`✅ Sandbox ${sandboxId} closed`);
      }

      this.state = SessionState.TERMINATED;
      this.notify();

      // Reset to IDLE state after termination
      setTimeout(() => {
        this.state = SessionState.IDLE;
        this.notify();
      }, 1000);

    } catch (error) {
      console.error('Error terminating sandbox:', error);
      this.state = SessionState.ERROR;
      this.notify();
    }
  }

  /**
   * Execute code in sandbox
   */
  public async executeCode(code: string): Promise<string> {
    if (!this.sandbox || this.state !== SessionState.ACTIVE) {
      throw new Error('Sandbox not ready or paused');
    }

    try {
      const execution = await this.sandbox.runCode(code);

      let output = '';
      if (execution.logs.stdout.length > 0) {
        output += execution.logs.stdout.join('\n');
      }
      if (execution.logs.stderr.length > 0) {
        output += '\n' + execution.logs.stderr.join('\n');
      }
      if (execution.error) {
        output += '\nError: ' + execution.error.value;
      }

      return output || 'No output';
    } catch (error) {
      throw new Error(`Error executing code: ${error}`);
    }
  }

  /**
   * List files in sandbox
   */
  public async listFiles(path: string = '/'): Promise<string[]> {
    if (!this.sandbox || this.state !== SessionState.ACTIVE) {
      throw new Error('Sandbox not ready');
    }

    try {
      const result = await this.sandbox.filesystem.list(path);
      return result.map(item => item.name);
    } catch (error) {
      throw new Error(`Error listing files: ${error}`);
    }
  }

  /**
   * Cleanup on component unmount
   */
  public async cleanup(): Promise<void> {
    await this.terminateSession(false);
    this.listeners.clear();
  }
}

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
   * Đăng ký listener để nhận thông báo thay đổi trạng thái session
   */
  public subscribe(listener: (info: SessionInfo) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Thông báo cho tất cả listeners về thay đổi trạng thái
   */
  private notify(): void {
    const info = this.getSessionInfo();
    this.listeners.forEach(listener => listener(info));
  }

  /**
   * Lấy thông tin session hiện tại
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
   * Khởi tạo sandbox với thời gian làm việc tùy chọn
   * @param durationMinutes - Thời gian làm việc (mặc định 59 phút, tối đa 23h59 với Pro Plan)
   */
  public async startSession(durationMinutes?: number): Promise<void> {
    try {
      this.state = SessionState.STARTING;
      this.notify();

      // Xác định thời gian session
      let duration = durationMinutes || this.config.defaultDurationMinutes;

      // Giới hạn thời gian theo plan
      if (!this.config.isPro && duration > this.config.defaultDurationMinutes) {
        console.warn(
          `Free plan chỉ hỗ trợ tối đa ${this.config.defaultDurationMinutes} phút. ` +
          `Sử dụng Pro Plan để mở rộng lên ${this.config.maxDurationMinutes} phút.`
        );
        duration = this.config.defaultDurationMinutes;
      } else if (duration > this.config.maxDurationMinutes) {
        duration = this.config.maxDurationMinutes;
      }

      this.sessionDurationMs = duration * 60 * 1000;
      this.sessionStartTime = Date.now();
      this.remainingSeconds = Math.floor(this.sessionDurationMs / 1000);

      // Khởi tạo E2B sandbox
      this.sandbox = await Sandbox.create({
        apiKey: this.config.apiKey,
        timeoutMs: this.sessionDurationMs
      });

      console.log(
        `✅ Sandbox đã được khởi tạo: ${this.sandbox.id}\n` +
        `⏱️  Thời gian làm việc: ${duration} phút\n` +
        `📦 Plan: ${this.config.isPro ? 'Pro' : 'Free'}`
      );

      this.state = SessionState.ACTIVE;
      this.notify();

      // Bắt đầu đếm ngược
      this.startCountdown();

      // Thiết lập auto-pause khi hết thời gian
      this.sessionTimeoutId = setTimeout(() => {
        this.pauseSession();
      }, this.sessionDurationMs);

    } catch (error) {
      this.state = SessionState.ERROR;
      this.notify();
      throw new Error(`Không thể khởi tạo sandbox: ${error}`);
    }
  }

  /**
   * Đếm ngược thời gian còn lại
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
   * Dừng đếm ngược
   */
  private clearCountdown(): void {
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }
  }

  /**
   * Pause sandbox khi hết thời gian
   */
  private async pauseSession(): Promise<void> {
    if (!this.sandbox || this.state !== SessionState.ACTIVE) {
      return;
    }

    try {
      console.log('⏸️  Đã hết thời gian làm việc. Đang pause sandbox...');

      this.state = SessionState.PAUSED;
      this.clearCountdown();
      this.notify();

      // Bắt đầu đếm ngược 59 giây để người dùng quyết định
      this.pauseCountdownSeconds = this.config.pauseWarningSeconds;
      this.startPauseCountdown();

      // Tự động xóa sandbox sau 59 giây nếu không có phản hồi
      this.pauseTimeoutId = setTimeout(() => {
        this.terminateSession(true);
      }, this.config.pauseWarningSeconds * 1000);

    } catch (error) {
      console.error('Lỗi khi pause sandbox:', error);
      this.state = SessionState.ERROR;
      this.notify();
    }
  }

  /**
   * Đếm ngược thời gian chờ sau khi pause
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
   * Tiếp tục làm việc - người dùng nhấn nút Continue
   */
  public async continueSession(): Promise<void> {
    if (this.state !== SessionState.PAUSED) {
      return;
    }

    try {
      this.state = SessionState.RESUMING;
      this.notify();

      // Hủy timeout xóa sandbox
      if (this.pauseTimeoutId) {
        clearTimeout(this.pauseTimeoutId);
        this.pauseTimeoutId = null;
      }

      this.clearCountdown();

      console.log('▶️  Đang khởi động lại session...');

      // Khởi động lại session với thời gian mặc định
      await this.terminateSession(false);
      await this.startSession(this.config.defaultDurationMinutes);

    } catch (error) {
      console.error('Lỗi khi tiếp tục session:', error);
      this.state = SessionState.ERROR;
      this.notify();
    }
  }

  /**
   * Xóa hoàn toàn sandbox
   * @param auto - True nếu tự động xóa do timeout
   */
  public async terminateSession(auto: boolean = false): Promise<void> {
    if (!this.sandbox) {
      return;
    }

    try {
      this.state = SessionState.TERMINATING;
      this.notify();

      // Clear tất cả timers
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

      // Đóng sandbox
      await this.sandbox.close();
      this.sandbox = null;
      this.sessionStartTime = null;
      this.remainingSeconds = 0;
      this.pauseCountdownSeconds = 0;

      if (auto) {
        console.log(`🗑️  Sandbox ${sandboxId} đã bị xóa do không có phản hồi sau 59 giây`);
      } else {
        console.log(`✅ Sandbox ${sandboxId} đã được đóng`);
      }

      this.state = SessionState.TERMINATED;
      this.notify();

      // Reset về trạng thái IDLE sau khi terminated
      setTimeout(() => {
        this.state = SessionState.IDLE;
        this.notify();
      }, 1000);

    } catch (error) {
      console.error('Lỗi khi xóa sandbox:', error);
      this.state = SessionState.ERROR;
      this.notify();
    }
  }

  /**
   * Thực thi code trong sandbox
   */
  public async executeCode(code: string): Promise<string> {
    if (!this.sandbox || this.state !== SessionState.ACTIVE) {
      throw new Error('Sandbox chưa sẵn sàng hoặc đã bị pause');
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

      return output || 'Không có output';
    } catch (error) {
      throw new Error(`Lỗi khi thực thi code: ${error}`);
    }
  }

  /**
   * Lấy danh sách files trong sandbox
   */
  public async listFiles(path: string = '/'): Promise<string[]> {
    if (!this.sandbox || this.state !== SessionState.ACTIVE) {
      throw new Error('Sandbox chưa sẵn sàng');
    }

    try {
      const result = await this.sandbox.filesystem.list(path);
      return result.map(item => item.name);
    } catch (error) {
      throw new Error(`Lỗi khi liệt kê files: ${error}`);
    }
  }

  /**
   * Cleanup khi component unmount
   */
  public async cleanup(): Promise<void> {
    await this.terminateSession(false);
    this.listeners.clear();
  }
}

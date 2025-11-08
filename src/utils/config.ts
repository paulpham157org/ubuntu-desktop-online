import { SessionConfig } from '../types/session';

/**
 * Load configuration từ environment variables
 */
export function loadConfig(): SessionConfig {
  const apiKey = import.meta.env.E2B_API_KEY || '';

  if (!apiKey) {
    console.warn(
      '⚠️ E2B_API_KEY không được thiết lập!\n' +
      'Vui lòng tạo file .env và thêm E2B_API_KEY=your_api_key'
    );
  }

  // Kiểm tra xem có phải Pro plan không (giả định dựa trên API key format hoặc config)
  // Trong thực tế, bạn có thể check qua API hoặc dựa vào format key
  const isPro = apiKey.includes('pro') || apiKey.includes('premium');

  const defaultDurationMinutes = parseInt(
    import.meta.env.VITE_DEFAULT_SESSION_DURATION_MINUTES || '59'
  );

  const maxDurationMinutes = parseInt(
    import.meta.env.VITE_MAX_SESSION_DURATION_MINUTES || '1439'
  );

  const pauseWarningSeconds = parseInt(
    import.meta.env.VITE_PAUSE_WARNING_SECONDS || '59'
  );

  return {
    apiKey,
    defaultDurationMinutes,
    maxDurationMinutes,
    pauseWarningSeconds,
    isPro
  };
}

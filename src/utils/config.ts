import { SessionConfig } from '../types/session';

/**
 * Load configuration from environment variables
 */
export function loadConfig(): SessionConfig {
  const apiKey = import.meta.env.E2B_API_KEY || '';

  if (!apiKey) {
    console.warn(
      '⚠️ E2B_API_KEY is not set!\n' +
      'Please create a .env file and add E2B_API_KEY=your_api_key'
    );
  }

  // Check if Pro plan (assumption based on API key format or config)
  // In practice, you can check via API or based on key format
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

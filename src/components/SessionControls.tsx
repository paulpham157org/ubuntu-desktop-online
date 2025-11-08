import { useState } from 'react';
import { useSessionStore } from '../stores/useSessionStore';
import { SessionState } from '../types/session';

export function SessionControls() {
  const { sessionInfo, startSession, terminateSession } = useSessionStore();
  const [customDuration, setCustomDuration] = useState<number>(59);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await startSession(customDuration);
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Unable to start session. Please check your E2B_API_KEY');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await terminateSession();
    } catch (error) {
      console.error('Error stopping session:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateColor = (state: SessionState): string => {
    switch (state) {
      case SessionState.ACTIVE:
        return 'bg-green-500';
      case SessionState.PAUSED:
        return 'bg-orange-500';
      case SessionState.STARTING:
      case SessionState.RESUMING:
        return 'bg-blue-500';
      case SessionState.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStateText = (state: SessionState): string => {
    switch (state) {
      case SessionState.IDLE:
        return 'Waiting to Start';
      case SessionState.STARTING:
        return 'Starting...';
      case SessionState.ACTIVE:
        return 'Active';
      case SessionState.PAUSED:
        return 'Paused';
      case SessionState.RESUMING:
        return 'Resuming...';
      case SessionState.TERMINATING:
        return 'Terminating...';
      case SessionState.TERMINATED:
        return 'Terminated';
      case SessionState.ERROR:
        return 'Error';
      default:
        return state;
    }
  };

  const isActive = sessionInfo.state === SessionState.ACTIVE;
  const canStart = [SessionState.IDLE, SessionState.TERMINATED].includes(sessionInfo.state);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getStateColor(sessionInfo.state)} animate-pulse`}></div>
          <h2 className="text-xl font-bold text-gray-800">
            {getStateText(sessionInfo.state)}
          </h2>
        </div>

        {sessionInfo.sandboxId && (
          <div className="text-sm text-gray-500">
            ID: {sessionInfo.sandboxId.substring(0, 8)}...
          </div>
        )}
      </div>

      {isActive && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">⏱️ Time Remaining:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatTime(sessionInfo.remainingSeconds)}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${(sessionInfo.remainingSeconds / (sessionInfo.durationMinutes * 60)) * 100}%`
              }}
            ></div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {canStart && (
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="1439"
                value={customDuration}
                onChange={(e) => setCustomDuration(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default: 59 minutes | Max: 1439 minutes (Pro Plan)
              </p>
            </div>
            <button
              onClick={handleStart}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Starting...' : '▶️ Start'}
            </button>
          </div>
        )}

        {isActive && (
          <button
            onClick={handleStop}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Stopping...' : '⏹️ Stop Sandbox'}
          </button>
        )}
      </div>
    </div>
  );
}

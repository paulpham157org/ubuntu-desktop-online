import { useSessionStore } from '../stores/useSessionStore';

export function PauseBanner() {
  const { sessionInfo, continueSession, terminateSession } = useSessionStore();

  if (sessionInfo.state !== 'paused') {
    return null;
  }

  const handleContinue = async () => {
    await continueSession();
  };

  const handleTerminate = async () => {
    await terminateSession();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 border-4 border-orange-300 animate-pulse">
        <div className="text-center">
          <div className="mb-6">
            <svg
              className="w-20 h-20 mx-auto text-white animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            ⏰ Phiên làm việc đã hết thời gian
          </h2>

          <p className="text-white text-lg mb-6">
            Sandbox đã được tạm dừng. Bạn có muốn tiếp tục làm việc không?
          </p>

          <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-6">
            <div className="text-6xl font-bold text-white mb-2">
              {sessionInfo.pauseCountdownSeconds}
            </div>
            <div className="text-white text-sm">
              giây còn lại để quyết định
            </div>
          </div>

          <div className="text-white text-sm mb-6 bg-black bg-opacity-30 rounded-lg p-3">
            ⚠️ Nếu bạn không nhấn nút <strong>Tiếp tục</strong> trong vòng{' '}
            <strong>{sessionInfo.pauseCountdownSeconds} giây</strong>,
            <br />sandbox sẽ bị xóa hoàn toàn và không thể khôi phục!
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleContinue}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              ✅ Tiếp tục làm việc
            </button>

            <button
              onClick={handleTerminate}
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500"
            >
              🛑 Kết thúc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

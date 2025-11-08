import { useEffect } from 'react';
import { useSessionStore } from './stores/useSessionStore';
import { SessionControls } from './components/SessionControls';
import { Terminal } from './components/Terminal';
import { PauseBanner } from './components/PauseBanner';
import { loadConfig } from './utils/config';

function App() {
  const { initializeManager } = useSessionStore();

  useEffect(() => {
    // Khởi tạo session manager khi app load
    const config = loadConfig();
    initializeManager(config);

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🖥️  Ubuntu Desktop Online với E2B.dev                       ║
╟──────────────────────────────────────────────────────────────╢
║  ⏱️  Thời gian mặc định: ${config.defaultDurationMinutes} phút                             ║
║  ⏰  Thời gian tối đa: ${config.maxDurationMinutes} phút (${config.isPro ? 'Pro' : 'Free'} Plan)                  ║
║  ⏸️  Cảnh báo pause: ${config.pauseWarningSeconds} giây                               ║
╚══════════════════════════════════════════════════════════════╝
    `);
  }, [initializeManager]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Pause Banner Overlay */}
      <PauseBanner />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            🖥️ Ubuntu Desktop Online
          </h1>
          <p className="text-gray-600">
            Máy tính ảo trên trình duyệt với hạ tầng E2B.dev
          </p>
        </header>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Left Column - Session Controls */}
          <div>
            <SessionControls />

            {/* Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                📚 Hướng dẫn sử dụng
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">1.</span>
                  <span>Nhập thời gian làm việc mong muốn (mặc định 59 phút)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  <span>Nhấn "Khởi động" để tạo sandbox mới</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">3.</span>
                  <span>Viết và chạy code Python trong Terminal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">4.</span>
                  <span>Khi hết thời gian, sandbox sẽ tự động pause và hiển thị banner</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">5.</span>
                  <span>Bạn có <strong>59 giây</strong> để nhấn "Tiếp tục" hoặc sandbox sẽ bị xóa</span>
                </li>
              </ul>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Lưu ý:</strong> Pro Plan cho phép mở rộng thời gian lên tới 23h59 phút
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Terminal */}
          <div>
            <Terminal />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>
            Powered by{' '}
            <a
              href="https://e2b.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              E2B.dev
            </a>
            {' '}• Made with ❤️
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

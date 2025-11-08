import { useState } from 'react';
import { useSessionStore } from '../stores/useSessionStore';
import { SessionState } from '../types/session';

export function Terminal() {
  const { sessionInfo, executeCode } = useSessionStore();
  const [code, setCode] = useState('print("Hello from E2B!")\nprint("Python version:")\nimport sys\nprint(sys.version)');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    if (sessionInfo.state !== SessionState.ACTIVE) {
      setOutput('❌ Sandbox not ready. Please start the sandbox first.');
      return;
    }

    setLoading(true);
    setOutput('⏳ Executing...\n');

    try {
      const result = await executeCode(code);
      setOutput(result);
    } catch (error) {
      setOutput(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const isActive = sessionInfo.state === SessionState.ACTIVE;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🖥️ Python Terminal</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code:
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={!isActive}
            className="w-full h-40 px-4 py-2 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter Python code..."
          />
        </div>

        <button
          onClick={handleExecute}
          disabled={loading || !isActive}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Executing...' : '▶️ Run Code'}
        </button>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output:
          </label>
          <pre className="w-full h-48 px-4 py-2 font-mono text-sm border border-gray-300 rounded-lg bg-black text-green-400 overflow-auto">
            {output || '💡 Output will appear here...'}
          </pre>
        </div>
      </div>
    </div>
  );
}

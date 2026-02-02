"use client";

import { useState, useEffect, useCallback } from "react";

interface EmailResult {
  email: string;
  status: string;
  error?: string;
}

interface EmailStats {
  pending: number;
  sent: number;
  total: number;
}

interface SendResponse {
  success: boolean;
  message: string;
  sent?: number;
  failed?: number;
  results?: EmailResult[];
  error?: string;
}

export default function EmailDashboard() {
  const [stats, setStats] = useState<EmailStats>({ pending: 0, sent: 0, total: 0 });
  const [isSending, setIsSending] = useState(false);
  const [autoSend, setAutoSend] = useState(false);
  const [lastResults, setLastResults] = useState<EmailResult[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/email-stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  const sendEmails = useCallback(async () => {
    if (isSending) return;
    
    setIsSending(true);
    setError(null);
    addLog("Starting email send process...");

    try {
      const res = await fetch("/api/send-pending-emails");
      const data: SendResponse = await res.json();

      if (data.success) {
        if (data.sent && data.sent > 0) {
          addLog(`✅ Sent ${data.sent} emails successfully`);
        }
        if (data.failed && data.failed > 0) {
          addLog(`❌ Failed to send ${data.failed} emails`);
        }
        if (data.results) {
          setLastResults(data.results);
        }
        if (data.message === "No pending emails to send") {
          addLog("No pending emails to send");
        }
      } else {
        setError(data.error || "Unknown error");
        addLog(`❌ Error: ${data.error}`);
      }

      await fetchStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send emails";
      setError(message);
      addLog(`❌ Error: ${message}`);
    } finally {
      setIsSending(false);
    }
  }, [isSending, fetchStats]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh stats every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Auto-send emails every 10 seconds if enabled
  useEffect(() => {
    if (!autoSend) return;
    
    const interval = setInterval(() => {
      if (stats.pending > 0) {
        sendEmails();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [autoSend, stats.pending, sendEmails]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">
            📧 Email Dashboard
          </h1>
          <p className="text-gray-400">
            Genesis - Email Sending Monitor
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold">{stats.pending}</div>
            <div className="text-orange-100">Pending</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold">{stats.sent}</div>
            <div className="text-green-100">Sent</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold">{stats.total}</div>
            <div className="text-blue-100">Total Students</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Controls</h2>
              <p className="text-gray-400 text-sm">
                Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : "Never"}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={sendEmails}
                disabled={isSending || stats.pending === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isSending || stats.pending === 0
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-400 text-gray-900"
                }`}
              >
                {isSending ? "⏳ Sending..." : `📤 Send Now (${stats.pending})`}
              </button>
            </div>
          </div>

          {/* Auto-send toggle */}
          <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSend}
                onChange={(e) => {
                  setAutoSend(e.target.checked);
                  addLog(e.target.checked ? "🔄 Auto-send enabled" : "⏸️ Auto-send disabled");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
            <div>
              <span className="font-medium">Auto-send</span>
              <span className="text-gray-400 text-sm ml-2">
                (Automatically sends pending emails every 10 seconds)
              </span>
            </div>
            {autoSend && (
              <span className="ml-auto px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm animate-pulse">
                ● Active
              </span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-8">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Recent Results */}
        {lastResults.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Results</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {lastResults.map((result, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.status === "sent" ? "bg-green-500/10" : "bg-red-500/10"
                  }`}
                >
                  <span className="font-mono text-sm">{result.email}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      result.status === "sent"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {result.status === "sent" ? "✓ Sent" : "✗ Failed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Log */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
          <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">No activity yet...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-gray-300 py-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Keep this page open during the event. Stats refresh every 5 seconds.
        </div>
      </div>
    </div>
  );
}

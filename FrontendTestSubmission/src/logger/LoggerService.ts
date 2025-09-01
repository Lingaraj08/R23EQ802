export type LogEntry = {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  source: string;
  message: string;
  meta?: Record<string, any>;
};

const LOG_STORAGE_KEY = 'app_logs_v1';

export const LoggerService = {
  async send(log: LogEntry) {
    // try to POST to a logging endpoint; if it fails, persist to localStorage
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch {
      const cur = JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]') as LogEntry[];
      cur.push(log);
      // keep last 1000 entries
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(cur.slice(-1000)));
    }
  },
  getAll(): LogEntry[] {
    return JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]') as LogEntry[];
  },
};
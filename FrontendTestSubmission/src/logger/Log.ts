export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
const ALLOWED_STACKS = ['backend', 'frontend'];
const ALLOWED_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
const ALLOWED_FRONTEND_PACKAGES = ['api'];

/**
 * Log(stack, level, package, message)
 * - Matches the signature shown in the test instructions.
 * - Sends to REACT_APP_LOG_ENDPOINT or falls back to localStorage.
 */
export async function Log(
  stack: string,
  level: string,
  packageName: string,
  message: string
): Promise<void> {
  // normalize to lower-case as required by the evaluation API
  const s = (stack || '').toLowerCase();
  const l = (level || '').toLowerCase();
  const p = (packageName || '').toLowerCase();

  // basic validation (fail-safe: still store locally if invalid)
  const validStack = ALLOWED_STACKS.includes(s) ? s : 'frontend';
  const validLevel = ALLOWED_LEVELS.includes(l as LogLevel) ? (l as LogLevel) : 'info';
  const validPackage = ALLOWED_FRONTEND_PACKAGES.includes(p) ? p : 'api';

  const payload = {
    timestamp: new Date().toISOString(),
    stack: validStack,
    level: validLevel,
    package: validPackage,
    message,
  };

  const endpoint = (process.env.REACT_APP_LOG_ENDPOINT as string) || '/api/logs';
  const token = (process.env.REACT_APP_LOG_TOKEN as string) || '';

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch {
    // fallback persist to localStorage (no console.*)
    try {
      const KEY = 'app_logs_v1';
      const cur = JSON.parse(localStorage.getItem(KEY) || '[]');
      cur.push(payload);
      localStorage.setItem(KEY, JSON.stringify(cur.slice(-2000)));
    } catch {
      // swallow
    }
  }
}

export default Log;
import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Vercel Cron Keep-Alive Endpoint
 * --------------------------------
 * Called daily by Vercel Cron at 10:00 UTC (configured in vercel.json).
 * Verifies CRON_SECRET to prevent unauthorised invocations.
 *
 * Environment variable required (server-side only — never NEXT_PUBLIC_ prefix):
 *   CRON_SECRET=<your-random-secret>
 *
 * Vercel automatically sends:
 *   Authorization: Bearer <CRON_SECRET>
 * when the schedule triggers this function.
 */
export default function handler(req: IncomingMessage, res: ServerResponse): void {
  // ── Only allow GET ──────────────────────────────────────────────────────────
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, message: 'Method not allowed' }));
    return;
  }

  // ── Verify Authorization header ─────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = (req.headers['authorization'] as string | undefined) || '';

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    // Do NOT log the actual secret or the received header value
    console.warn('[cron] Unauthorized request blocked.');
    res.writeHead(401, { 'Content-Type': 'text/plain' });
    res.end('Unauthorized');
    return;
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  const timestamp = new Date().toISOString();
  console.log(`[cron] Keep-alive ping received at ${timestamp}`);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      ok: true,
      timestamp,
      message: 'MailCraftKit keep-alive ping successful',
    })
  );
}

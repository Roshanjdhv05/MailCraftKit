let appHandler: any = null;

export default async function handler(req: any, res: any) {
  // Always ensure CORS headers are present even if errors occur
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!appHandler) {
      // 1. Try loading pre-built server from dist
      try {
        const distModule = await import('../server/dist/index.js');
        appHandler = distModule.default?.default || distModule.default || distModule;
      } catch (distErr: any) {
        // 2. Fallback to src if running in ts-node or dev
        const srcModule = await import('../server/src/index.js');
        appHandler = srcModule.default?.default || srcModule.default || srcModule;
      }
    }

    return appHandler(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Function Error]:', err);
    res.status(500).json({
      success: false,
      message: err?.message || 'Internal server error occurred',
    });
  }
}

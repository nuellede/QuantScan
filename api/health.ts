import { sendJson, type VercelCompatReq, type VercelCompatRes } from '../server/vercelHttp.ts';

export default function handler(req: VercelCompatReq, res: VercelCompatRes) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  sendJson(res, 200, {
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
    runtime: 'vercel',
  });
}

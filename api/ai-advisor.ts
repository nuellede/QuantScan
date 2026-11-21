import { runAiAdvisor, type AiAdvisorRequestPayload } from '../server/geminiService.ts';
import {
  handleEndpointError,
  readJsonBody,
  sendJson,
  type VercelCompatReq,
  type VercelCompatRes,
} from '../server/vercelHttp.ts';

export default async function handler(req: VercelCompatReq, res: VercelCompatRes) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJsonBody<AiAdvisorRequestPayload>(req);
    const result = await runAiAdvisor(body);
    sendJson(res, 200, result);
  } catch (err) {
    handleEndpointError(res, err, 'Terjadi kesalahan saat memanggil Asisten AI.');
  }
}

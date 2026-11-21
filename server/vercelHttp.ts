import type { IncomingMessage, ServerResponse } from 'node:http';
import { ServiceHttpError } from './geminiService.ts';

export type VercelCompatReq = IncomingMessage & {
  body?: unknown;
  query?: Record<string, string | string[]>;
};

export type VercelCompatRes = ServerResponse & {
  status?: (code: number) => VercelCompatRes;
  json?: (data: unknown) => void;
};

export function sendJson(res: VercelCompatRes, statusCode: number, data: unknown): void {
  if (typeof res.status === 'function') {
    const target = res.status(statusCode);
    if (typeof target?.json === 'function') {
      target.json(data);
      return;
    }
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export async function readJsonBody<T>(req: VercelCompatReq): Promise<T> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return (req.body.trim() ? JSON.parse(req.body) : {}) as T;
      } catch {
        throw new ServiceHttpError(400, 'Format body JSON tidak valid.');
      }
    }
    if (typeof req.body === 'object') {
      return req.body as T;
    }
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) {
    return {} as T;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ServiceHttpError(400, 'Format body JSON tidak valid.');
  }
}

export function handleEndpointError(
  res: VercelCompatRes,
  err: unknown,
  fallbackMessage: string
): void {
  if (err instanceof ServiceHttpError) {
    sendJson(res, err.status, { error: err.message });
    return;
  }
  const message = err instanceof Error ? err.message : fallbackMessage;
  sendJson(res, 500, { error: message });
}

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  ServiceHttpError,
  runAiAdvisor,
  runChartScan,
  runNewsAnalysis,
  type AiAdvisorRequestPayload,
  type ScanRequestPayload,
} from './server/geminiService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
      runtime: 'express',
    });
  });

  app.post('/api/scan', async (req, res) => {
    try {
      const normalized = await runChartScan(req.body as ScanRequestPayload);
      res.json(normalized);
    } catch (err: unknown) {
      if (err instanceof ServiceHttpError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat memanggil AI scanner.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/news-analyze', async (req, res) => {
    try {
      const normalized = await runNewsAnalysis(req.body as { newsText?: string });
      res.json(normalized);
    } catch (err: unknown) {
      if (err instanceof ServiceHttpError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat memanggil AI analisis berita.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/ai-advisor', async (req, res) => {
    try {
      const normalized = await runAiAdvisor(req.body as AiAdvisorRequestPayload);
      res.json(normalized);
    } catch (err: unknown) {
      if (err instanceof ServiceHttpError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat memanggil Asisten AI.';
      res.status(500).json({ error: message });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`QuantScan server running on http://0.0.0.0:${port}`);
  });
}

startServer();

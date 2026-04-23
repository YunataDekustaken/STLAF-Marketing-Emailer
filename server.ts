import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Provide __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Resend
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// Resend Batch API Route
app.post('/api/send-campaign', async (req, res: any) => {
  if (!resend) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured on the server.' });
  }

  try {
    const { subject, content, recipients } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: 'No recipients provided.' });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Marketing <onboarding@resend.dev>';
    
    // Chunk array into batches of up to 50
    const CHUNK_SIZE = 50;
    const chunks = [];
    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
      chunks.push(recipients.slice(i, i + CHUNK_SIZE));
    }

    let successCount = 0;
    let failureCount = 0;
    let lastError: any = null;

    // Send chunks sequentially to be mindful of rate limits
    for (const chunk of chunks) {
      const batchParams = chunk.map((recipient: any) => ({
        from: fromEmail,
        to: [recipient.email],
        subject: subject,
        // Simple interpolation placeholder replacement
        html: content.replace(/\[Name\]/ig, recipient.name || ''),
      }));

      const { data, error } = await resend.batch.send(batchParams);

      if (error) {
        console.error("Batch error:", error);
        failureCount += chunk.length;
        lastError = error;
      } else {
        successCount += chunk.length;
      }
    }

    return res.json({
      success: failureCount === 0,
      message: 'Campaign processing complete.',
      successCount,
      failureCount,
      lastError
    });

  } catch (error: any) {
    console.error("Server error sending campaign:", error);
    return res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client with required telemetry header
function getGeminiClient(apiVersion?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no ambiente.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      ...(apiVersion ? { apiVersion } : {}),
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint to generate speech audio via Gemini 3.8 Flash Lite TTS
app.post('/api/tts/generate', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore', style = 'Natural', customStyle = '' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'O texto para conversão é obrigatório.' });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        error: 'O texto excede o limite de 5.000 caracteres por conversão. Divida o texto em partes menores.',
      });
    }

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient('v1alpha');
    } catch (err: any) {
      return res.status(500).json({
        error: 'Chave de API do Gemini não encontrada no servidor. Verifique o painel de segredos.',
        needsKey: true,
      });
    }

    // Build style description in Brazilian Portuguese
    const styleDescriptions: Record<string, string> = {
      Natural: 'Voz natural e fluida com sotaque neutro do português do Brasil, tom amigável e conversacional.',
      Comercial: 'Voz energética, publicitária, entusiasmada e envolvente, ideal para comerciais de rádio e TV.',
      Formal: 'Voz séria, sóbria, clara e pontual como um âncora de telejornal brasileiro de alta credibilidade.',
      Audiolivro: 'Voz cadenciada, expressiva e envolvente, com ritmo calmo e pausas dramáticas ideais para livros e contos.',
      Didático: 'Voz paciente, didática, acolhedora e muito clara, perfeita para videoaulas e treinamentos.',
      Calmo: 'Voz suave, calma, relaxante e aconchegante, em tom sereno e aveludado.',
    };

    const chosenStyle = customStyle?.trim()
      ? `${customStyle.trim()}. Fale em português do Brasil com pronúncia correta e entonação natural.`
      : (styleDescriptions[style] || styleDescriptions.Natural);

    // Call gemini-3.8-flash-lite-tts
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: chosenStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice, // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find((p: any) => p.inlineData?.data);
    const base64Audio = audioPart?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({
        error: 'Não foi possível gerar o áudio. Tente novamente ou use outro estilo de voz.',
      });
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: audioPart?.inlineData?.mimeType || 'audio/wav',
      voice,
      textLength: text.length,
    });
  } catch (error: any) {
    console.error('TTS Generation Error:', error);
    const message = error?.message || 'Falha na geração de áudio';
    return res.status(500).json({
      error: `Erro ao converter texto em áudio: ${message}`,
      details: error?.toString(),
    });
  }
});

// Endpoint for text enhancement / pronunciation formatting with Gemini 3.8 Flash
app.post('/api/tts/optimize-text', async (req: Request, res: Response) => {
  try {
    const { text, type = 'punctuation' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Texto obrigatório.' });
    }

    const ai = getGeminiClient('v1alpha');

    let instruction = '';
    if (type === 'punctuation') {
      instruction = `Você é um especialista em redação de roteiros para locução em Português do Brasil (PT-BR).
Melhore a pontuação do texto a seguir para que a leitura falada soe muito natural: adicione vírgulas onde houver pausas naturais de respiração, use reticências (...) para pausas reflexivas se apropriado, e corrija acentuações. Mantenha as mesmas palavras e o mesmo sentido original. Retorne APENAS o texto revisado, sem introduções ou comentários.`;
    } else if (type === 'numbers_to_words') {
      instruction = `Você é um assistente de Text-to-Speech para Português do Brasil (PT-BR).
Converta todos os números, siglas, valores monetários (R$), datas e símbolos para a forma como são pronunciados por extenso em português do Brasil (ex: 'R$ 150' para 'cento e cinquenta reais', '10/05' para 'dez de maio', '15%' para 'quinze por cento').
Retorne APENAS o texto convertido, sem explicações.`;
    } else if (type === 'emotive') {
      instruction = `Ajuste o texto a seguir para torná-lo mais expressivo e envolvente para locução falada em Português Brasileiro (PT-BR), melhorando o ritmo, cadência e impacto vocal sem mudar a mensagem central. Retorne APENAS o texto aprimorado.`;
    }

    let optimized = text;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${instruction}\n\nTexto original:\n${text}`,
      });
      optimized = response.text || text;
    } catch (err: any) {
      console.warn('Primary text model busy, trying fallback model gemini-3.1-flash-lite:', err?.message);
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `${instruction}\n\nTexto original:\n${text}`,
        });
        optimized = fallbackResponse.text || text;
      } catch (fallbackErr) {
        console.warn('Fallback model also unavailable, applying local PT-BR rules:', fallbackErr);
        // Simple local PT-BR formatting fallback
        if (type === 'punctuation') {
          optimized = text.replace(/([.!?])\s*/g, '$1 ... ').trim();
        } else if (type === 'numbers_to_words') {
          optimized = text
            .replace(/R\$\s?(\d+)/gi, '$1 reais')
            .replace(/%/g, ' por cento')
            .replace(/\b1\b/g, 'um')
            .replace(/\b2\b/g, 'dois')
            .replace(/\b3\b/g, 'três')
            .replace(/\b4\b/g, 'quatro')
            .replace(/\b5\b/g, 'cinco')
            .replace(/\b10\b/g, 'dez');
        }
      }
    }

    return res.json({ optimizedText: optimized.trim() });
  } catch (error: any) {
    console.error('Optimize Text Error:', error);
    return res.status(500).json({ error: 'Falha ao otimizar texto.', message: error?.message });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar servidor:', err);
});

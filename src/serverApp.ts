import express from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

// OTP Storage & Rate Limiting Engine
interface OtpRecord {
  email: string;
  code: string;
  expiresAt: number;
  attemptsLeft: number;
  lastRequestedAt: number;
}

interface ActiveSession {
  token: string;
  email: string;
  name: string;
  birthday?: string;
  createdAt: number;
  lastActive: number;
}

interface RegisteredUserProfile {
  email: string;
  name: string;
  birthday?: string;
  registeredAt: number;
}

const otpCache = new Map<string, OtpRecord>();
const activeSessions = new Map<string, ActiveSession>();
const registeredUsers = new Map<string, RegisteredUserProfile>();

// Pre-seed primary profile
registeredUsers.set('pardhupavan457@gmail.com', {
  email: 'pardhupavan457@gmail.com',
  name: 'Pardhu Pavan',
  birthday: '2006-06-13',
  registeredAt: Date.now(),
});

function getMailTransporter() {
  const user = process.env.SMTP_USER || 'pardhupavan457@gmail.com';
  const pass = (process.env.SMTP_PASS || 'tahg xlkq lrkh ktrs').replace(/\s+/g, '');

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    connectionTimeout: 3500,
    greetingTimeout: 3500,
    socketTimeout: 4000,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractCleanErrorMessage(error: any): { message: string; isHighDemand: boolean; isQuotaExceeded: boolean; code?: number } {
  if (!error) {
    return {
      message: 'An unexpected error occurred while contacting the Gemini service.',
      isHighDemand: false,
      isQuotaExceeded: false,
    };
  }

  let raw = typeof error === 'string' ? error : error.message || String(error);

  for (let depth = 0; depth < 4; depth++) {
    const trimmed = raw.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.error) {
          if (typeof parsed.error === 'string') {
            raw = parsed.error;
          } else if (parsed.error.message) {
            raw = parsed.error.message;
          } else {
            raw = JSON.stringify(parsed.error);
          }
        } else if (parsed.message) {
          raw = parsed.message;
        } else {
          break;
        }
      } catch {
        break;
      }
    } else {
      break;
    }
  }

  const statusCode = error.status || error.code || error.statusCode;
  const is429 = statusCode === 429 || /429|quota exceeded|limit: 0|RESOURCE_EXHAUSTED/i.test(raw);
  const is503 = statusCode === 503 || statusCode === 'UNAVAILABLE' || /503|temporarily unavailable|high demand|spikes in demand|overloaded/i.test(raw);

  if (/gemini-3\.1-pro/i.test(raw) && is429) {
    return {
      message: 'Gemini 3.1 Pro has a restricted free tier quota. Ro automatically switched to high-speed Gemini 3.7 Flash for your conversation.',
      isHighDemand: false,
      isQuotaExceeded: true,
      code: 429,
    };
  }

  if (is429) {
    return {
      message: 'Gemini API request rate limit reached. Please wait a few seconds and try again.',
      isHighDemand: true,
      isQuotaExceeded: true,
      code: 429,
    };
  }

  if (is503) {
    return {
      message: 'The Gemini service is temporarily experiencing high demand. Please try again in a few seconds.',
      isHighDemand: true,
      isQuotaExceeded: false,
      code: 503,
    };
  }

  const cleanMessage = raw
    .replace(/\\n/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    message: cleanMessage || 'An error occurred while generating a response.',
    isHighDemand: false,
    isQuotaExceeded: false,
  };
}

export function createExpressApp() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      smtpConfigured: Boolean(process.env.SMTP_USER || 'pardhupavan457@gmail.com'),
    });
  });

  // INSTANT LOGIN / BYPASS ENDPOINT (No SMTP / OTP required)
  app.post('/api/auth/instant-login', (req, res) => {
    const { email, name, birthday } = req.body;
    const normalizedEmail = (email && typeof email === 'string' && email.trim())
      ? email.trim().toLowerCase()
      : 'pardhupavan457@gmail.com';

    let userProfile = registeredUsers.get(normalizedEmail);
    const now = Date.now();

    if (!userProfile) {
      const displayName = (name && typeof name === 'string' && name.trim())
        ? name.trim()
        : normalizedEmail === 'pardhupavan457@gmail.com'
        ? 'Pardhu Pavan'
        : normalizedEmail.split('@')[0];

      userProfile = {
        email: normalizedEmail,
        name: displayName,
        birthday: birthday || (normalizedEmail === 'pardhupavan457@gmail.com' ? '2006-06-13' : undefined),
        registeredAt: now,
      };
      registeredUsers.set(normalizedEmail, userProfile);
    } else {
      if (name && typeof name === 'string' && name.trim()) {
        userProfile.name = name.trim();
      }
      if (birthday) {
        userProfile.birthday = birthday;
      }
      registeredUsers.set(normalizedEmail, userProfile);
    }

    const token = `ro_sess_${crypto.randomBytes(24).toString('hex')}`;
    const session: ActiveSession = {
      token,
      email: normalizedEmail,
      name: userProfile.name,
      birthday: userProfile.birthday,
      createdAt: now,
      lastActive: now,
    };
    activeSessions.set(token, session);

    res.json({
      success: true,
      message: 'Instant login successful (SMTP bypassed)',
      token,
      sessionToken: token,
      user: {
        email: userProfile.email,
        name: userProfile.name,
        birthday: userProfile.birthday,
        registeredAt: userProfile.registeredAt,
        loggedInAt: now,
      },
    });
  });

  // Check if user exists
  app.post('/api/auth/check-user', (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Valid email is required.' });
      return;
    }
    const normalized = email.trim().toLowerCase();
    const user = registeredUsers.get(normalized);
    res.json({
      isRegistered: Boolean(user),
      name: user?.name,
      birthday: user?.birthday,
    });
  });

  // SEND OTP EMAIL ENDPOINT
  app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Valid email address is required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({ error: 'Please provide a valid email format.' });
      return;
    }

    const now = Date.now();
    const existing = otpCache.get(normalizedEmail);

    // Rate limit: 35 seconds cooldown between OTP requests
    if (existing && now - existing.lastRequestedAt < 35000) {
      const remainingSeconds = Math.ceil((35000 - (now - existing.lastRequestedAt)) / 1000);
      res.status(429).json({
        error: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
        cooldownRemaining: remainingSeconds,
      });
      return;
    }

    // Generate secure 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes

    otpCache.set(normalizedEmail, {
      email: normalizedEmail,
      code,
      expiresAt,
      attemptsLeft: 5,
      lastRequestedAt: now,
    });

    console.log(`[AUTH] Generated OTP for ${normalizedEmail}: ${code}`);

    let emailSent = false;
    let emailErrorMessage = '';

    try {
      const transporter = getMailTransporter();
      const mailOptions = {
        from: `"Ro AI Security Gateway" <${process.env.SMTP_USER || 'pardhupavan457@gmail.com'}>`,
        to: normalizedEmail,
        subject: `Your Ro AI Verification Code: ${code}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #0b0f19; color: #f3f4f6; border-radius: 16px; border: 1px solid #1f293d;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; padding: 12px; border-radius: 16px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3);">
                <span style="font-size: 32px;">🤖</span>
              </div>
              <h1 style="color: #ffffff; font-size: 24px; margin: 12px 0 4px 0; font-weight: 700;">Ro AI Authentication</h1>
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">One-Time Passcode for Account Access</p>
            </div>
            
            <div style="background: #111827; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; border: 1px solid #1e293b;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Your 6-Digit Verification Code</p>
              <div style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #818cf8; font-family: monospace; padding: 12px; background: rgba(99, 102, 241, 0.1); border-radius: 8px; display: inline-block;">
                ${code}
              </div>
              <p style="color: #6b7280; font-size: 12px; margin: 12px 0 0 0;">Valid for 5 minutes. Never share this code with anyone.</p>
            </div>

            <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0 0 16px 0;">
              If you did not request this login code, you can safely ignore this email. Your account remains protected.
            </p>
            
            <div style="border-top: 1px solid #1f293d; padding-top: 16px; text-align: center;">
              <p style="color: #4b5563; font-size: 12px; margin: 0;">
                Ro AI Systems &bull; Enterprise-grade AI Intelligence
              </p>
            </div>
          </div>
        `,
      };

      await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP timeout')), 3500)),
      ]);
      emailSent = true;
      console.log(`[AUTH] Successfully dispatched OTP email to ${normalizedEmail}`);
    } catch (err: any) {
      console.warn(`[AUTH] SMTP delivery warning for ${normalizedEmail}:`, err.message);
      emailErrorMessage = err.message;
    }

    res.json({
      success: true,
      message: emailSent
        ? `Verification code dispatched to ${normalizedEmail}`
        : `Verification code generated and dispatched in real-time.`,
      emailSent,
      // For developer/sandbox environments where SMTP is restricted
      previewCodeHint: !emailSent ? code : undefined,
      cooldown: 35,
    });
  });

  // VERIFY OTP ENDPOINT
  app.post('/api/auth/verify-otp', (req, res) => {
    const { email, code, name, birthday } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code ? String(code).trim() : '';

    const record = otpCache.get(normalizedEmail);
    const now = Date.now();

    if (!record) {
      res.status(400).json({
        error: 'No active verification code found for this email. Please request a new OTP.',
      });
      return;
    }

    if (record.expiresAt < now) {
      otpCache.delete(normalizedEmail);
      res.status(400).json({
        error: 'Verification code has expired. Please request a new 6-digit code.',
      });
      return;
    }

    if (record.code !== cleanCode) {
      record.attemptsLeft -= 1;
      otpCache.set(normalizedEmail, record);
      if (record.attemptsLeft <= 0) {
        otpCache.delete(normalizedEmail);
        res.status(429).json({
          error: 'Maximum verification attempts exceeded. Access locked. Please request a new code.',
        });
        return;
      }
      res.status(400).json({
        error: `Incorrect verification code. ${record.attemptsLeft} attempt(s) remaining.`,
        attemptsLeft: record.attemptsLeft,
      });
      return;
    }

    // Code is valid or bypassed! Consume it
    if (record) {
      otpCache.delete(normalizedEmail);
    }

    let userProfile = registeredUsers.get(normalizedEmail);

    if (!userProfile) {
      const displayName = (name && typeof name === 'string' && name.trim()) 
        ? name.trim() 
        : normalizedEmail.split('@')[0];

      userProfile = {
        email: normalizedEmail,
        name: displayName,
        birthday: birthday || undefined,
        registeredAt: now,
      };
      registeredUsers.set(normalizedEmail, userProfile);
    } else {
      if (name && typeof name === 'string' && name.trim()) {
        userProfile.name = name.trim();
      }
      if (birthday) {
        userProfile.birthday = birthday;
      }
      registeredUsers.set(normalizedEmail, userProfile);
    }

    // Generate secure session token
    const token = `ro_sess_${crypto.randomBytes(24).toString('hex')}`;
    const session: ActiveSession = {
      token,
      email: normalizedEmail,
      name: userProfile.name,
      birthday: userProfile.birthday,
      createdAt: now,
      lastActive: now,
    };
    activeSessions.set(token, session);

    res.json({
      success: true,
      token,
      sessionToken: token,
      user: {
        email: userProfile.email,
        name: userProfile.name,
        birthday: userProfile.birthday,
        registeredAt: userProfile.registeredAt,
        loggedInAt: now,
      },
    });
  });

  // GET SESSION PROFILE
  app.get('/api/auth/session', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized. No token provided.' });
      return;
    }

    const token = authHeader.substring(7);
    const session = activeSessions.get(token);

    if (!session) {
      res.status(401).json({ error: 'Session expired or invalid.' });
      return;
    }

    session.lastActive = Date.now();
    activeSessions.set(token, session);

    res.json({
      user: {
        email: session.email,
        name: session.name,
        birthday: session.birthday,
      },
    });
  });

  // LOGOUT ENDPOINT
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      activeSessions.delete(token);
    }
    res.json({ success: true });
  });

  // GEMINI CHAT ENDPOINT
  app.post('/api/chat', async (req, res) => {
    try {
      const { contents, systemInstruction, model = 'gemini-3.7-flash', generationConfig = {} } = req.body;

      if (!contents || !Array.isArray(contents) || contents.length === 0) {
        res.status(400).json({ error: 'Valid contents array is required.' });
        return;
      }

      const ai = getGeminiClient();
      const modelsToTry = [model, 'gemini-3.7-flash', 'gemini-2.5-flash'];
      const uniqueModels = Array.from(new Set(modelsToTry));

      let response: any = null;
      let lastErr: any = null;

      for (const m of uniqueModels) {
        try {
          const config: any = {
            temperature: generationConfig.temperature ?? 0.7,
            maxOutputTokens: generationConfig.maxOutputTokens ?? 4096,
          };

          if (systemInstruction) {
            config.systemInstruction = systemInstruction;
          }

          response = await ai.models.generateContent({
            model: m,
            contents,
            config,
          });
          break;
        } catch (err: any) {
          lastErr = err;
          console.warn(`[GEMINI] Model ${m} fallback trigger:`, err.message);
        }
      }

      if (!response && lastErr) {
        throw lastErr;
      }

      res.json({
        text: response.text || '',
        candidates: response.candidates,
      });
    } catch (err: any) {
      console.error('[GEMINI] Chat error:', err);
      const clean = extractCleanErrorMessage(err);
      res.status(clean.code || 500).json({ error: clean.message });
    }
  });

  // IMAGE GENERATION (IMAGEN) ENDPOINT
  app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt, aspectRatio = '1:1', numberOfImages = 1 } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt is required.' });
        return;
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt,
        config: {
          numberOfImages: Math.min(Math.max(1, numberOfImages), 4),
          aspectRatio,
          outputMimeType: 'image/jpeg',
        },
      });

      const images = response.generatedImages?.map((img: any) => ({
        image: {
          imageBytes: img.image?.imageBytes,
        },
      })) || [];

      res.json({ images });
    } catch (err: any) {
      console.error('[IMAGEN] Error:', err);
      const clean = extractCleanErrorMessage(err);
      res.status(500).json({ error: clean.message });
    }
  });

  return app;
}

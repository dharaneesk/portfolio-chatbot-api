import crypto from "node:crypto";
import { Resend } from "resend";

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? "60000");
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? "20");
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
export const ALERT_FROM_EMAIL = process.env.ALERT_FROM_EMAIL;
export const ALERT_TO_EMAIL = process.env.ALERT_TO_EMAIL;

export function buildCorsHeaders(origin?: string) {
  const normalizedOrigin = origin?.replace(/\/$/, "");
  const allowedOrigin =
    normalizedOrigin && isAllowedOrigin(normalizedOrigin)
      ? normalizedOrigin
      : "";

  return {
    ...(allowedOrigin ? { "Access-Control-Allow-Origin": allowedOrigin } : {}),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Auth-Token, User-Agent",
    "Access-Control-Expose-Headers": "X-Request-Id",
    "Vary": "Origin, Access-Control-Request-Headers",
  };
}

export function generateRequestId() {
  return crypto.randomUUID();
}

export function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "unknown";
}

export function getAllowedOrigins(): Set<string> {
  const raw = process.env.ALLOWED_ORIGINS ?? "";
  return new Set(
    raw
      .split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
      .filter(Boolean)
  );
}

export function isAllowedOrigin(origin?: string | null): boolean {
  if (!origin) return false;
  const normalized = origin.replace(/\/$/, "");
  return getAllowedOrigins().has(normalized);
}

export function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetAt: entry.resetAt };
}

export async function sendFailureAlert({
  stage,
  requestId,
  error,
  messages,
  origin,
  clientIp,
  categories
}: {
  stage: string;
  requestId: string;
  error: unknown;
  messages?: any[];
  origin?: string;
  clientIp?: string;
  categories?: string[];
}) {

  if (!resend || !ALERT_TO_EMAIL || !ALERT_FROM_EMAIL) return;

  const errorMessage =
    error instanceof Error ? error.message : String(error);

  const userPrompt = messages
    ?.filter((m) => m.role === "user")
    .map((m) => m.parts?.map((p: any) => p.text).join(""))
    .join("\n\n");

  try {
    await resend.emails.send({
      from: ALERT_FROM_EMAIL,
      to: [ALERT_TO_EMAIL],
      subject: `🚨 Portfolio Chatbot Failure (${stage})`,
      html: `
        <h2>Chatbot Failure</h2>

        <p><b>Stage:</b> ${stage}</p>
        <p><b>Request ID:</b> ${requestId}</p>
        <p><b>Origin:</b> ${origin}</p>
        <p><b>Client IP:</b> ${clientIp}</p>
        <p><b>Categories:</b> ${(categories ?? []).join(", ")}</p>

        <h3>Error</h3>
        <pre>${errorMessage}</pre>

        <h3>User Prompt</h3>
        <pre>${userPrompt}</pre>

        <p>Time: ${new Date().toISOString()}</p>
      `
    });
    console.log("Mail sent");

  } catch (e) {
    console.error("Failed to send alert email:", e);
  }
}

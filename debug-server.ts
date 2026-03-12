import "dotenv/config";
import express, { type Request as ExpressRequest, type Response as ExpressResponse } from "express";
import { POST, OPTIONS } from "./api/chat.js";

const app = express();
const PORT = process.env.PORT || 3002;

// Read JSON bodies
app.use(express.json({ limit: "1mb" }));

function buildAbsoluteUrl(req: ExpressRequest) {
    return `${req.protocol}://${req.get("host")}${req.originalUrl}`;
}

function toWebRequest(req: ExpressRequest): Request {
    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) {
            for (const v of value) headers.append(key, v);
        } else if (value !== undefined) {
            headers.set(key, value);
        }
    }

    const method = req.method.toUpperCase();
    const hasBody = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";

    return new Request(buildAbsoluteUrl(req), {
        method,
        headers,
        body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
    });
}

async function sendWebResponse(webResponse: Response, res: ExpressResponse) {
    res.status(webResponse.status);

    webResponse.headers.forEach((value, key) => {
        res.setHeader(key, value);
    });

    if (!webResponse.body) {
        res.end();
        return;
    }

    const reader = webResponse.body.getReader();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(Buffer.from(value));
        }
    } finally {
        res.end();
    }
}

app.options("/api/chat", async (req, res) => {
    try {
        const webReq = toWebRequest(req);
        const webRes = await OPTIONS(webReq);
        await sendWebResponse(webRes, res);
    } catch (error) {
        console.error("OPTIONS /api/chat failed:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

app.post("/api/chat", async (req, res) => {
    try {
        const webReq = toWebRequest(req);
        const webRes = await POST(webReq);
        await sendWebResponse(webRes, res);
    } catch (error) {
        console.error("POST /api/chat failed:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log(`Debug server running at http://localhost:${PORT}`);
    console.log(`Chat endpoint: http://localhost:${PORT}/api/chat`);
});
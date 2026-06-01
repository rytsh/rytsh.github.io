type Env = {
  ALLOWED_ORIGIN?: string;
  DISCORD_WEBHOOK_URL: string;
};

type MessagePayload = {
  message?: unknown;
  page?: unknown;
};

type RequestMetadata = {
  browser: string;
  country: string;
  device: string;
  origin: string;
  os: string;
};

const defaultAllowedOrigins = [
  "https://rytsh.io",
  "https://www.rytsh.io",
  "https://rytsh.github.io",
];
const maxMessageLength = 800;

const json = (body: unknown, init: ResponseInit = {}, origin?: string) => {
  const headers = new Headers(init.headers);

  headers.set("Content-Type", "application/json; charset=utf-8");

  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }

  return new Response(JSON.stringify(body), { ...init, headers });
};

const getAllowedOrigins = (env: Env) => {
  const configuredOrigins = env.ALLOWED_ORIGIN?.split(",") || [];

  return new Set(
    [...defaultAllowedOrigins, ...configuredOrigins]
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
};

const isAllowedOrigin = (request: Request, env: Env) => {
  const origin = request.headers.get("Origin");

  return Boolean(origin && getAllowedOrigins(env).has(origin));
};

const createCorsHeaders = (origin: string) => ({
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
});

const normalizeMessage = (message: string) => {
  return message.replace(/\s+/g, " ").trim();
};

const trimHeader = (value: string | null, maxLength = 220) => {
  return value?.slice(0, maxLength) || "unknown";
};

const getBrowser = (userAgent: string) => {
  if (/Edg\//.test(userAgent)) {
    return "Edge";
  }

  if (/OPR\//.test(userAgent)) {
    return "Opera";
  }

  if (/SamsungBrowser\//.test(userAgent)) {
    return "Samsung Internet";
  }

  if (/CriOS\//.test(userAgent) || /Chrome\//.test(userAgent)) {
    return "Chrome";
  }

  if (/FxiOS\//.test(userAgent) || /Firefox\//.test(userAgent)) {
    return "Firefox";
  }

  if (/Safari\//.test(userAgent)) {
    return "Safari";
  }

  return "unknown";
};

const getOs = (userAgent: string) => {
  if (/Android/.test(userAgent)) {
    return "Android";
  }

  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return "iOS";
  }

  if (/Windows NT/.test(userAgent)) {
    return "Windows";
  }

  if (/Mac OS X/.test(userAgent)) {
    return "macOS";
  }

  if (/Linux/.test(userAgent)) {
    return "Linux";
  }

  return "unknown";
};

const getDevice = (userAgent: string) => {
  const lowerUserAgent = userAgent.toLowerCase();

  if (/bot|crawler|spider|crawling/.test(lowerUserAgent)) {
    return "bot";
  }

  if (/ipad|tablet|kindle|silk|playbook/.test(lowerUserAgent) || /android(?!.*mobile)/.test(lowerUserAgent)) {
    return "tablet";
  }

  if (/mobi|iphone|ipod|android.*mobile|windows phone/.test(lowerUserAgent)) {
    return "phone";
  }

  return "desktop";
};

const getRequestMetadata = (request: Request, origin: string): RequestMetadata => {
  const userAgent = trimHeader(request.headers.get("User-Agent"), 220);

  return {
    browser: getBrowser(userAgent),
    country: trimHeader(request.headers.get("CF-IPCountry"), 80),
    device: getDevice(userAgent),
    origin,
    os: getOs(userAgent),
  };
};

const createDiscordContent = (message: string, page: string | undefined, metadata: RequestMetadata) => {
  const escapedMessage = message.replace(/\n/g, "\n> ");
  const lines = [
    "**New message from rytsh.io terminal**",
    `> ${escapedMessage}`,
    "",
    `Page: ${page || "unknown"}`,
    `Time: ${new Date().toISOString()}`,
    "",
    "**Visitor**",
    `Country: ${metadata.country}`,
    `Device: ${metadata.device}`,
    `Browser: ${metadata.browser}`,
    `OS: ${metadata.os}`,
    `Origin: ${metadata.origin}`,
  ];

  return lines.join("\n");
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") || undefined;
    const allowedOrigin = origin && isAllowedOrigin(request, env) ? origin : undefined;

    if (request.method === "OPTIONS") {
      if (!allowedOrigin) {
        return new Response(null, { status: 403 });
      }

      return new Response(null, {
        headers: createCorsHeaders(allowedOrigin),
        status: 204,
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 }, allowedOrigin);
    }

    if (!allowedOrigin) {
      return json({ error: "Forbidden origin" }, { status: 403 });
    }

    if (!env.DISCORD_WEBHOOK_URL) {
      return json({ error: "Discord webhook is not configured" }, { status: 500 }, allowedOrigin);
    }

    let payload: MessagePayload;

    try {
      payload = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, { status: 400 }, allowedOrigin);
    }

    if (typeof payload.message !== "string") {
      return json({ error: "Message is required" }, { status: 400 }, allowedOrigin);
    }

    const message = normalizeMessage(payload.message);

    if (message.length < 2) {
      return json({ error: "Message is too short" }, { status: 400 }, allowedOrigin);
    }

    if (message.length > maxMessageLength) {
      return json({ error: `Message must be ${maxMessageLength} characters or less` }, { status: 400 }, allowedOrigin);
    }

    const page = typeof payload.page === "string" ? payload.page.slice(0, 200) : undefined;
    const metadata = getRequestMetadata(request, allowedOrigin);
    const discordResponse = await fetch(env.DISCORD_WEBHOOK_URL, {
      body: JSON.stringify({
        allowed_mentions: { parse: [] },
        content: createDiscordContent(message, page, metadata),
        username: "rytsh.io terminal",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!discordResponse.ok) {
      return json({ error: "Discord rejected the message" }, { status: 502 }, allowedOrigin);
    }

    return json({ ok: true }, { status: 200 }, allowedOrigin);
  },
};

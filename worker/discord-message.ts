type Env = {
  ALLOWED_ORIGIN?: string;
  DISCORD_WEBHOOK_URL: string;
};

type MessagePayload = {
  message?: unknown;
  name?: unknown;
  page?: unknown;
};

type ParsedMessagePayload = {
  message: string;
  name?: string;
  page?: string;
};

type RequestMetadata = {
  browser: string;
  country: string;
  device: string;
  origin: string;
  os: string;
};

type DiscordEmbed = {
  color: number;
  description: string;
  fields: Array<{
    inline?: boolean;
    name: string;
    value: string;
  }>;
  timestamp: string;
  title: string;
};

type DiscordPayload = {
  allowed_mentions: {
    parse: string[];
  };
  embeds: DiscordEmbed[];
  username: string;
};

const defaultAllowedOrigins = [
  "https://rytsh.io",
  "https://www.rytsh.io",
  "https://rytsh.github.io",
];
const maxMessageLength = 800;
const maxNameLength = 80;

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
  return message
    .replace(/\r\n?/g, "\n")
    .replace(/[\t ]+$/gm, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
};

const normalizeName = (name: string | undefined) => {
  return name?.replace(/\s+/g, " ").trim().slice(0, maxNameLength) || undefined;
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

const parseJsonPayload = async (request: Request) => {
  let payload: MessagePayload;

  try {
    payload = await request.json();
  } catch {
    return { error: "Invalid JSON body" };
  }

  if (typeof payload.message !== "string") {
    return { error: "Message is required" };
  }

  return {
    payload: {
      message: payload.message,
      name: typeof payload.name === "string" ? payload.name.slice(0, maxNameLength) : undefined,
      page: typeof payload.page === "string" ? payload.page.slice(0, 200) : undefined,
    },
  };
};

const formatDiscordMessage = (message: string) => {
  return message
    .split("\n")
    .map((line) => `> ${line || "\u200b"}`)
    .join("\n");
};

const createMetadataSpoiler = (metadata: RequestMetadata) => {
  return `||Country: ${metadata.country}\nDevice: ${metadata.device}\nBrowser: ${metadata.browser}\nOS: ${metadata.os}\nOrigin: ${metadata.origin}||`;
};

const createDiscordEmbeds = (
  message: string,
  page: string | undefined,
  metadata: RequestMetadata,
  name: string | undefined,
): DiscordEmbed[] => {
  const fields: DiscordEmbed["fields"] = [];

  if (name) {
    fields.push({
      inline: true,
      name: "Sender",
      value: name,
    });
  }

  fields.push(
    {
      name: "Page",
      value: page || "unknown",
    },
    {
      name: "Metadata (click to reveal)",
      value: createMetadataSpoiler(metadata),
    },
  );

  const embed: DiscordEmbed = {
    color: 0x79cd88,
    description: formatDiscordMessage(message),
    fields,
    timestamp: new Date().toISOString(),
    title: "New message from rytsh.io terminal",
  };

  return [embed];
};

const sendDiscordWebhook = (webhookUrl: string, payload: DiscordPayload) => {
  return fetch(webhookUrl, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
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

    const parsedPayload = await parseJsonPayload(request);

    if ("error" in parsedPayload) {
      return json({ error: parsedPayload.error }, { status: 400 }, allowedOrigin);
    }

    const payload = parsedPayload.payload as ParsedMessagePayload;
    const message = normalizeMessage(payload.message);
    const name = normalizeName(payload.name);

    if (!name) {
      return json({ error: "Name is required" }, { status: 400 }, allowedOrigin);
    }

    if (message.length < 2) {
      return json({ error: "Message is too short" }, { status: 400 }, allowedOrigin);
    }

    if (message.length > maxMessageLength) {
      return json({ error: `Message must be ${maxMessageLength} characters or less` }, { status: 400 }, allowedOrigin);
    }

    const metadata = getRequestMetadata(request, allowedOrigin);
    const discordPayload: DiscordPayload = {
      allowed_mentions: { parse: [] },
      embeds: createDiscordEmbeds(message, payload.page, metadata, name),
      username: "rytsh.io terminal",
    };
    const discordResponse = await sendDiscordWebhook(env.DISCORD_WEBHOOK_URL, discordPayload);

    if (!discordResponse.ok) {
      return json({ error: "Discord rejected the message" }, { status: 502 }, allowedOrigin);
    }

    return json({ ok: true }, { status: 200 }, allowedOrigin);
  },
};

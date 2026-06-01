# My Personal Page

Based on my vitesse template.

---

For deploy gh-pahes

```sh
pnpm run build && pnpm run pages
```

<details><summary>Terminal Message Worker</summary>

The homepage terminal can send messages to a Discord channel through a Cloudflare Worker.
The Worker includes coarse visitor metadata in the Discord message: Cloudflare country, device/browser/OS summary, and origin. It does not send IP addresses or raw user-agent details.

1. Create a Discord channel webhook and copy the webhook URL.
2. Log in to Cloudflare from the terminal:

```sh
pnpm dlx wrangler login
```

3. Store the Discord webhook URL as a Worker secret:

```sh
pnpm dlx wrangler secret put DISCORD_WEBHOOK_URL
```

4. Deploy the Worker:

```sh
pnpm run worker:deploy
```

5. Add the deployed Worker URL to `.env.local` or your deployment env:

```sh
VITE_MESSAGE_ENDPOINT=https://rytsh-message.<account>.workers.dev
```

Then visitors can use the terminal command:

```sh
msg hello from the site
```

For local Worker testing, put the secret in `.dev.vars`:

```sh
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

Do not commit `.dev.vars`; it is ignored by git.

</details>

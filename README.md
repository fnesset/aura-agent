# ✦ Aura — Everyday AI Assistant

A beautiful, cinematic AI assistant you can host and sell.

## 🚀 Deploy to Vercel in 5 minutes

### Step 1 — Get your code on GitHub
1. Go to [github.com](https://github.com) → **New repository** → name it `aura-agent`
2. Upload all these files (drag & drop works)

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up free
2. Click **"Add New Project"** → Import your GitHub repo
3. Click **Deploy** — Vercel auto-detects Vite ✓

### Step 3 — Add your API key (optional but recommended)
In Vercel dashboard → Your project → **Settings → Environment Variables**:
- Key: `VITE_ANTHROPIC_API_KEY`
- Value: your key from [console.anthropic.com](https://console.anthropic.com)

> Without this, users enter their own API key when they first open the app.

### Step 4 — Share your URL
Vercel gives you a free URL like `aura-agent.vercel.app` — that's your live product!

---

## 💻 Run locally

```bash
npm install
npm run dev
```

## 🎨 Customize for clients

- Change the name "Aura" in `App.jsx` line 1 and the `<title>` in `index.html`
- Change colors by searching `#d4af60` (gold) and replacing with your brand color
- Change the suggestions in the `SUGGESTIONS` array
- Change the personality in `SYSTEM_PROMPT`

---

Built with React + Vite + Anthropic Claude API

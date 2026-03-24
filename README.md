# NUVORA — We Build What's Next

> Full-service digital agency website — AI Automation, Web Design, Digital Marketing, Content Creation, CV Design, Graphic Design.

![Nuvora Agency](https://nuvora-agency.netlify.app/assets/og-image.jpg)

[![Netlify Status](https://api.netlify.com/api/v1/badges/54e6d71c-47fe-428c-a047-edf995824175/deploy-status)](https://app.netlify.com/projects/nuvora-agency)

**Live Site:** [nuvora-agency.netlify.app](https://nuvora-agency.netlify.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| 3D Graphics | Three.js r128 (self-hosted) |
| Fonts | Syne, DM Sans, JetBrains Mono (self-hosted) |
| Hosting | Netlify (free tier) |
| Forms | Netlify Forms (free, built-in) |
| DNS / CDN | Cloudflare (free tier) |

---

## Project Structure

```
nuvora-agency/
├── index.html          # Main site — all 5 sections
├── 404.html            # Custom error page
├── _redirects          # Netlify routing + HTTPS redirect
├── robots.txt          # SEO crawler rules
├── sitemap.xml         # Google indexing
├── css/
│   └── style.css       # All styles (1000+ lines)
├── js/
│   └── main.js         # Three.js scenes + all interactions
│   └── three.min.js    # Self-hosted Three.js r128
├── assets/
│   ├── fonts/          # Self-hosted woff2 font files
│   │   ├── fonts.css
│   │   ├── Syne-*.woff2
│   │   ├── DMSans-*.woff2
│   │   └── JetBrainsMono-*.woff2
│   ├── favicon.svg     # SVG favicon
│   └── og-image.jpg    # Social share preview (1200x630)
└── README.md
```

---

## Features

- Three.js WebGL background — 8,000-particle galaxy + geometric shapes
- 3D hero canvas — orbiting sphere with satellite objects
- Custom magnetic cursor with ring follow
- Preloader tied to actual asset loading
- Scroll-triggered reveal animations
- Animated stat counters (IntersectionObserver)
- Infinite marquee ticker
- Draggable / swipeable horizontal portfolio
- Glassmorphism navigation with scroll state
- Mobile-responsive (hamburger nav, touch scroll)
- Netlify Forms integration (contact form submissions)
- OG meta tags (WhatsApp, LinkedIn, Facebook previews)
- Self-hosted fonts — no Google DNS dependency
- No CDN dependencies — works in restricted networks

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/nuvora-agency.git
cd nuvora-agency

# Open with VS Code Live Server (recommended)
# OR simply open index.html in browser

# For Netlify CLI local dev:
npm install -g netlify-cli
netlify dev
```

---

## Deployment

### Auto-deploy via GitHub (recommended)
1. Push to `main` branch
2. Netlify auto-deploys in ~30 seconds

### Manual deploy
```bash
netlify deploy --dir=. --site=54e6d71c-47fe-428c-a047-edf995824175 --prod
```

---

## Team

| Name | Role |
|---|---|
| Alaa Taifour | Founder & Agency Director |
| Nader | Creative Lead |
| Saif | Outreach & Marketing |
| Ammar Shalghin | Social Media & Contract Management |

---

## Contact

- Email: latyfwr10@gmail.com
- WhatsApp: +971 562 935 388
- Location: Dubai, UAE & Syria

---

*© 2026 Nuvora Agency. All rights reserved.*

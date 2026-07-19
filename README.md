# HealthOrbit Secured Medical Ledger Portal

HealthOrbit is a next-generation, patient-controlled, secured clinical ledger portal. Built with premium design tokens, it offers patients control over their medical history timelines, lets doctors request dynamic access, and gives clinic administrators an auditing system for checking clinical credentials.

---

## Key Features

1. **Patient-Owned Timeline**: Clear cryptographic ledger track displaying doctor visits, lab panel uploads, checkups, and prescription changes.
2. **Dynamic Practitioner Clearance**: Secure access permission workflow. Clinicians request profile review authority; patients grant or deny permissions dynamically.
3. **Emergency Lifesaving Portal**: First responders/EMT unauthenticated lookup view for rapid access to blood groups, allergy matrixes, and contact information.
4. **Partner Hospital Credentials Check**: Admin network controller verifies practitioners' clinical licenses against official registration records.
5. **Apple Wallet Style Pass**: Sleek digital membership card styling for quick copy/paste of secure keys.
6. **Vercel & Stripe Aesthetics**: Beautiful custom dark mode, neon focus outline states, and interactive glassmorphism containers.

---

## Tech Stack
- **Frontend**: React (TypeScript), Tailwind CSS v4, Framer Motion, Lucide Icons.
- **Backend / Database**: Node.js & Express (TypeScript server), JSON DB Storage.
- **Bundler & Build Tool**: Vite.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local server:
   ```bash
   npm run dev
   ```
3. Run TypeScript validation checks:
   ```bash
   npm run lint
   ```
4. Build the application for production:
   ```bash
   npm run build
   ```

---

## Production Deployment Checklist

### 1. Environment & Secrets
- [ ] Set `NODE_ENV` to `production`.
- [ ] Generate and set a strong, random `JWT_SECRET` in environment configurations.
- [ ] Configure `PORT` (default is `8080` or `3000`).

### 2. Frontend & PWA
- [ ] Verify `public/manifest.json` values (`short_name`, `theme_color`, etc.).
- [ ] Verify `public/favicon.svg` is present.
- [ ] Verify HTML meta tags inside `index.html` are optimized for SEO.

### 3. Security Hardening
- [ ] Ensure HTTPS is enabled at the routing layer (e.g. Nginx, Cloudflare, or hosting provider).
- [ ] Enforce rate-limiting on emergency retrieval APIs.
- [ ] Enforce maximum upload limits on patient report PDFs or images.

### 4. Build & Run
- [ ] Run `npm run build` to generate optimized client bundle assets.
- [ ] Start node production server using `node dist/server.cjs` or a process manager like PM2.

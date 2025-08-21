# Trilliox Landing Page (Polished Package)

This is a ready-to-host static site. Contents:
- `index.html` — Neon blue–purple + gold–black theme with animated glowing buttons
- `assets/logo.png` — Placeholder logo (also used as favicon)

## How to use
1. Replace `assets/logo.png` with your actual logo file named **logo.png** (same path).
2. Open `index.html` in a browser to preview.
3. Update links:
   - Social links in the header (`#` → your actual X/Telegram/Discord URLs).
   - Whitepaper link in the hero CTA.
4. FormSubmit is configured to send to **trilliox@gmail.com**:
   ```html
   <form action="https://formsubmit.co/trilliox@gmail.com" method="POST">
   ```
   You can add a redirect with `_next` (uncomment in the HTML) to send users to a thank-you page.

## Deploy
- **Vercel**: Create a new project, drag-drop this folder or connect a Git repo. Framework preset: *Other* (static). 
- **GitHub Pages**: Push to a repo and enable Pages.
- **Netlify**: Drag-drop the folder.

Button display is guaranteed because `.btn` and `button` explicitly use `display:inline-flex`, and the HTML structure is valid.
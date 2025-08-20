# Trilliox Landing Page

🚀 Simple waitlist landing page for Trilliox, built with Tailwind CSS and FormSubmit.

## 📂 Project Structure
- `index.html` → Landing page with email waitlist form
- `thankyou.html` → Thank-you page shown after form submission

## ⚡ How it works
1. User enters email and clicks **Join Waitlist**.
2. FormSubmit sends the email to the address you configure.
3. After submission, the user is redirected to `thankyou.html`.

## 🔧 Setup Instructions

### 1. Update Email
In `index.html`, replace this with your real email:
```html
<form action="https://formsubmit.co/Trilliox@gmail.com" method="POST">
```

### 2. Update Redirect URL
Change the `_next` hidden input to your Vercel domain:
```html
<input type="hidden" name="_next" value="https://your-vercel-site.vercel.app/thankyou.html">
```

### 3. Deploy
1. Push this project to a **GitHub repo**.
2. Go to [Vercel](https://vercel.com) → Import GitHub Repo.
3. Deploy → Your site goes live instantly 🎉.

---
✅ Done! Your Trilliox waitlist page is live and collecting emails.

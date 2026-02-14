# 🔖 Smart Bookmark App

A simple, secure, and real-time bookmark manager built using modern full-stack tools.

This application allows users to sign in with Google, save bookmarks privately, and view updates instantly across multiple tabs.

---

## 🚀 Live Demo

👉 **Live URL:**
https://smart-bookmark-app-ten.vercel.app/

---

## 🧰 Tech Stack

### Frontend

* **Next.js (App Router)** — modern React framework for fast and optimized UI
* **Tailwind CSS** — utility-first styling

### Backend & Database

* **Supabase**

  * Google OAuth Authentication
  * PostgreSQL database
  * Real-time updates

### Deployment & Version Control

* **Vercel** — cloud hosting & CI/CD
* **GitHub** — repository & version control

---

## ✨ Features

✅ Google login authentication
✅ Add bookmarks (URL + title)
✅ Bookmarks are private per user
✅ Real-time sync across multiple tabs
✅ Delete bookmarks
✅ Fully deployed and production-ready

---

## 🔐 Authentication Flow

1. User signs in using Google OAuth.
2. Supabase verifies identity and creates a session.
3. A secure JWT token is stored in the browser.
4. All database requests are authenticated using this token.

---

## 🗄 Database Design

### bookmarks table

| Column     | Type      | Description       |
| ---------- | --------- | ----------------- |
| id         | uuid      | Primary key       |
| user_id    | uuid      | Owner of bookmark |
| title      | text      | Bookmark title    |
| url        | text      | Bookmark link     |
| created_at | timestamp | Creation time     |

Row Level Security ensures users can only access their own bookmarks.

---

## ⚙️ Local Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/UdhayaKiran30/smart-bookmark-app.git
cd smart-bookmark-app
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create `.env.local`

Add:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 4️⃣ Run development server

```bash
npm run dev
```

---

## ☁️ Deployment

The app is deployed using Vercel.

Steps:

1. Push project to GitHub
2. Import repo in Vercel
3. Add environment variables
4. Deploy

---

## ⚠️ Challenges Faced & How I Solved Them

### 🔹 1. OAuth Redirect Issues

**Problem:** After login, users were not redirected properly.

**Solution:**
Configured correct **Site URL** and **Redirect URL** in Supabase authentication settings.

---

### 🔹 2. Vercel Deployment Errors

**Problem:** Build failed due to unsupported config files and font imports.

**Solution:**

* Renamed `next.config.ts` → `next.config.mjs`
* Removed unsupported fonts and used Google fonts supported by Next.js

---

### 🔹 3. Environment Variables Not Working

**Problem:** App failed to connect to Supabase after deployment.

**Solution:**
Added required environment variables in Vercel project settings.

---

### 🔹 4. Real-time Updates Not Syncing

**Problem:** Changes were not appearing across tabs.

**Solution:**
Enabled Supabase realtime and subscribed to database changes.

---

### 🔹 5. Git Push Conflicts

**Problem:** Remote repository had existing commits.

**Solution:**
Pulled remote changes and merged before pushing updates.

---

## 🧠 What I Learned

* Implementing OAuth authentication
* Managing sessions using JWT
* Real-time data syncing
* Debugging deployment issues
* Using serverless architecture
* Production deployment workflow

---

## 🔮 Future Improvements

* Edit bookmarks feature
* Search & filter bookmarks
* Bookmark tags & categories
* Dark mode UI
* Mobile UI optimization

---

## 📌 Author

**Your Name**
GitHub: https://github.com/your-username

---

## ⭐ Acknowledgements

Thanks to the official documentation and developer tools that helped me understand modern full-stack workflows.

---

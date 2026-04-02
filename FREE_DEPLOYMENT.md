# 🚀 Free Cloud Deployment Guide

Deploying a microservices architecture (Frontend, Backend, ML, Database, and Cache) completely for free requires splitting the services across platforms that offer excellent free tiers. 

Here is the most reliable, error-free strategy.

## 🏗️ The "Free Tier" Stack Architecture

1. **Frontend (Next.js)** -> **[Vercel](https://vercel.com)** (Native Next.js support, lightning fast, extremely generous free tier).
2. **Databases (PostgreSQL)** -> **[Supabase](https://supabase.com)** or **[Neon](https://neon.tech)** (Excellent free serverless PostgreSQL).
3. **Cache (Redis)** -> **[Upstash](https://upstash.com)** (Serverless Redis, entirely free for low traffic).
4. **Backend (API) & ML Service** -> **[Render](https://render.com)** (Offers free Web Services for running Python/FastAPI Docker containers).

---

## 🔒 How to handle `.env` URLs without errors
**CRITICAL RULE:** You **never** put your production URLs or passwords in your local `.env` file. Doing so leads to security risks and cross-origin (CORS) errors. 

Your `.env` file stays local. For production, you will copy-paste these URLs directly into the **Settings > Environment Variables** dashboard of the respective hosting platforms (Vercel & Render).

---

## 🚦 Step-by-Step Deployment Execution

### Part 1: Deep Guide - How to get Upstash and Supabase URLs

Getting the connection strings requires a few clicks. Here is the exact path:

**🟢 How to get the Upstash Redis URL (`REDIS_URL`)**
1. Go to [console.upstash.com](https://console.upstash.com/) and sign in.
2. On the dashboard, click the **"Create Database"** button under the Redis section.
3. **Name:** Enter `aqi-cache`. **Type & Region:** Select "Regional" and choose a region close to you mapping the free tier. 
4. Click the **"Create"** button.
5. You will immediately be taken to your new database's dashboard. Scroll down slightly to find the **"Connect"** box.
6. Look for the field marked **URL** (it will start with `rediss://default:password@...`).
7. Click the copy icon next to it. **This is your `REDIS_URL`.**

**🔵 How to get the Supabase PostgreSQL URL (`DATABASE_URL`)**
1. Go to [supabase.com](https://supabase.com/) and sign in (GitHub sign-in is easiest).
2. Click the **"New Project"** button. Select your organization.
3. **Name:** Enter `aqi-db`.
4. **Database Password:** Enter a very strong password. **Write this password down or copy it somewhere safe immediately**, you will need it in a second!
5. Select a region, and click **"Create New Project"** (Wait 1-2 minutes for it to build).
6. Once built, look at the far-left dark sidebar menu and click the **Settings (Gear Icon ⚙️)** at the very bottom.
7. In the settings menu, click on **"Database"**.
8. Scroll down until you see the **"Connection string"** section. Click the **"URI"** tab.
9. You will see a link that looks like this:
   `postgresql://postgres.xxxxxx:[YOUR-PASSWORD]@aws-0-xx.pooler.supabase.com:6543/postgres`
10. Copy that entire string. 
11. **CRITICAL FINAL STEP:** Wherever you paste this, you must manually delete the literal text `[YOUR-PASSWORD]` and type in the actual strong password you created in Step 4. **This fully constructed string is your `DATABASE_URL`.**

### Part 2: Deploy the ML Service (Render)
Render needs to host our Python containers. 
1. Create a free Render account and link your GitHub repository.
2. Create a **New Web Service** -> Connect your repo.
3. **Configuration**:
   - **Root Directory**: `apps/ml`
   - **Environment**: `Docker`
4. Wait for it to deploy. Once successful, copy its public URL: `https://aqi-ml-service.onrender.com`

### Part 3: Deploy the Main API (Render)
1. Create another **New Web Service** in Render -> Connect repo.
2. **Configuration**:
   - **Root Directory**: `apps/api`
   - **Environment**: `Docker`
3. **Environment Variables**: Add these exact keys into Render's dashboard (NOT your code):
   - `DATABASE_URL` = *(Paste your Supabase/Neon URL here)*
   - `REDIS_URL` = *(Paste your Upstash URL here)*
   - `ML_SERVICE_URL` = *(Paste your Render ML Service URL here)*
4. Deploy the API. Once successful, copy its public URL: `https://aqi-main-api.onrender.com`

### Part 4: Deploy the Frontend (Vercel)
1. Go to Vercel and link your GitHub account.
2. **Import Project** -> Select your repo.
3. **Configuration**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
4. **Environment Variables**: Add this exactly into Vercel's dashboard:
   - `NEXT_PUBLIC_API_URL` = *(Paste your Render Main API URL here, e.g., https://aqi-main-api.onrender.com)*
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID` = service_p6gziu8
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` = template_r17kqv2
   - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` = yMJ907wxocRpRlH9F
5. Click **Deploy**.

## 🎉 Summary
By following these steps, you isolate your secrets away from your code history, and you utilize specialized free tiers so you won't pay a dime. 
- Vercel talks to Render (API).
- Render (API) talks to Upstash (Redis), Supabase (DB), and Render (ML).
Everything connects securely!

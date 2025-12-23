# 🚀 Resume Analyzer (Gemini AI)

An **AI-powered Resume Analyzer** that evaluates resumes against job descriptions and provides an **ATS score**, skill gap analysis, and actionable feedback — built using **Gemini SDK**, **Node.js**, and **React (Vite)**.

### 📽️ *Demo video available on YouTube.*

---

## ✨ Features

- 📄 Upload resume in **PDF format**
- 🧠 AI-powered analysis using **Gemini SDK**
- 📝 Optional **Job Description** input
- 📊 ATS score generation
- 🔍 Skill match & missing skills detection
- 💡 Strengths, weaknesses & improvement suggestions
- ⚡ Fast, clean UI with Tailwind CSS

---

## 🧠 How It Works

1. User uploads resume (PDF)
2. Resume text is extracted server-side
3. Gemini AI analyzes resume + job description
4. Structured output is validated
5. ATS score & insights are returned to UI

---

## 🧱 Tech Stack

### Backend
- Node.js
- Gemini SDK
- Express.js
- Multer (PDF upload)
- PDF text extraction
- Zod (output validation)

### Frontend
- React (Vite)
- TypeScript
- Tailwind CSS

---

## 🗂️ Project Structure

```
resume-analyzer/
├── backend/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
├── README.md
└── .gitignore
````
---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_BASE_URI = http://localhost:5173
````

### Frontend (`frontend/.env`)

```env
VITE_BACKEND_URL=http://localhost:3000
```

---

## 🚀 Running Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deployment

### Frontend

* Hosted on Vercel
* Root directory: `frontend`
* Build command: `npm run build`
* Output directory: `dist`

### Backend

* Hosted on Render
* Root directory: `backend`
* Node version: 18+

---

# AI-Powered Job Application Assistant

A browser-based productivity platform designed to eliminate repetitive job application work using AI, while keeping the user in complete control of the final submission.

## Overview
This platform automates form-filling across popular career portals (Greenhouse, Lever, Ashby, Workday, etc.) using a Chrome Extension and a Next.js Dashboard. A Node.js backend handles profile management and interfaces with the Google Gemini AI for smart field mapping, resume parsing, and cover letter generation.

## Project Architecture
The project is divided into three main components:
1. **`dashboard/`** - Next.js 14 frontend application
2. **`backend/`** - Node.js/Express API with PostgreSQL (Prisma)
3. **`extension/`** - Chrome/Edge Manifest V3 Browser Extension

## Getting Started

### 1. Backend Setup
Navigate to the `backend/` directory, copy `.env.example` to `.env`, add your `DATABASE_URL` and `GEMINI_API_KEY`, then run:
```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

### 2. Dashboard Setup
Navigate to the `dashboard/` directory, copy `.env.example` to `.env.local`, then run:
```bash
npm install
npm run dev
```

### 3. Extension Setup
1. Open Google Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `extension/` directory from this repository

## Core Features
- **Smart Form Autofill**: Extension detects form fields on job portals and uses Gemini AI to map them accurately regardless of naming conventions.
- **Resume Parsing**: Upload a resume to automatically extract structured data (experience, skills, education) into your profile.
- **Cover Letter Generation**: AI-generated, highly personalized cover letters based on your profile and the specific job description.
- **Application Tracking**: A central dashboard to track all your applications, interview statuses, and overall job hunt progress.

## Technologies
- **Frontend**: Next.js, React, Vanilla CSS (Glassmorphism), Playwright
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL, NextAuth.js
- **Extension**: Vanilla JS, Chrome Manifest V3 APIs
- **AI**: Google Gemini API

## License
MIT License

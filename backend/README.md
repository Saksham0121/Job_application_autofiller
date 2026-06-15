# Job Autofiller - Backend API

The Node.js and Express backend for the Job Autofiller AI project.

## Tech Stack
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT & bcrypt
- **AI Integration**: Google Gemini API
- **Logging**: Winston

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Google Gemini API Key

### Setup
1. Install dependencies
   ```bash
   npm install
   ```

2. Configure environment
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

3. Setup Database
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

4. Run the server
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000`.

## API Routes
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate user
- `GET /api/profile` - Get user profile for autofill
- `POST /api/resume/upload` - Upload and parse resume with Gemini
- `POST /api/ai/classify-fields` - Extension endpoint for mapping form fields
- `POST /api/ai/cover-letter` - Generate tailored cover letters

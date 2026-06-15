# Job Autofiller - Dashboard UI

The Next.js frontend dashboard for the Job Autofiller AI project.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Vanilla CSS with dark mode glassmorphism
- **Authentication**: NextAuth.js
- **Testing**: Playwright

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Backend API running locally

### Setup
1. Install dependencies
   ```bash
   npm install
   ```

2. Configure environment
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

3. Run the development server
   ```bash
   npm run dev
   ```
   The dashboard will be available at `http://localhost:3000`.

## End-to-End Testing
We use Playwright for E2E testing the authentication flows.
```bash
npx playwright test
```

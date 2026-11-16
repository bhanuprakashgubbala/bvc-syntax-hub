# NextGen Labs / Codex System - Student Coding Platform

An enterprise-grade, interactive learning and coding assessment platform built with Next.js, Monaco Editor, SQLite + Prisma, Agentic AI features, and a **Multi-Server Code Execution System with Automatic Backup Support**.

---

## ⚡ Multi-Server Code Execution System

The platform features a centralized, resilient compiler architecture that eliminates dependence on any single execution server:

### Supported Compiler Servers:
1. **Server 1: Default Server (Selected by default)**
   - High-performance NextGen compilation cluster leveraging Wandbox and internal CE resilience.
   - **Live & Active** out-of-the-box with zero configuration needed.
2. **Server 2: OnlineCompiler.io Server**
   - Official OnlineCompiler.io cloud API (`api.onlinecompiler.io`).
   - Configurable via `ONLINECOMPILER_API_KEY` in `.env.local`.
3. **Server 3: JDoodle Server**
   - Official JDoodle execution API (`api.jdoodle.com`).
   - Configurable via `JDOODLE_CLIENT_ID` and `JDOODLE_CLIENT_SECRET` in `.env.local`.
4. **Server 4: Codapi Server**
   - Official Codapi Open Sandbox Engine (`api.codapi.org`).
   - **Live & Active** out-of-the-box (no mandatory key required).
5. **Server 5: CE.Judge Server**
   - Official Judge0 CE open execution system (`ce.judge0.com`).
   - **Live & Active** out-of-the-box (no mandatory key required).

### Dual-Dropdown Compiler Header Layout:
```
[ Select Compiler Server ▼ ]     [ Select Language ▼ ]
```
- **Independent Switching**: Changing the server preserves code and selected language. Changing language preserves selected server.
- **Auto-Backup & Failover Support**: When enabled, failures on any primary node automatically fail over to an available cluster node without crashing user sessions.
- **Failover Recommendations**: In manual mode, clear error messages are surfaced alongside 1-click fallback buttons (`👉 Switch to Default Server and Run`, `👉 Switch to Codapi Server and Run`).

---

## 🤖 AI Teaching Assistant & Socratic Code Tutor

The platform includes an advanced **Socratic AI Teaching Assistant** and a **Code Completion & Pass Percentage Engine**:

### Core Capabilities:
1. **Interactive Socratic Tutor (`components/AIChatDrawer.js`)**:
   - Slide-out assistant synchronized in real-time with the Monaco Editor.
   - Operates in patient college-professor mode: provides line-by-line intuition, debugging hints, and complexity analysis.
   - Quick prompt chips: *"Socratic Hint"*, *"Diagnose Error"*, *"Analyze Complexity (Big-O)"*, *"Test Edge Cases"*.

2. **Code Pass & Completion Percentage Calculator (`utils/codeAnalyzer.js`)**:
   - Real-time heuristic scoring of code structure, function declarations, loop depth, data structure usage, and test cases.
   - Displays a dynamic visual progress bar and pass metric pill (`Optimal`, `Partially Complete`, `Needs Work`) in the CodeArena workspace and console tabs.

3. **Backend API Route (`app/api/ai-tutor/route.js`)**:
   - Supports optional **Google Gemini** (`GEMINI_API_KEY`) and **OpenAI** (`OPENAI_API_KEY`).
   - Built-in heuristic engine fallback with zero external dependencies.

---

## ⚙️ Environment Variables Setup (`.env.local`)

```env
# Multi-Server Execution Configuration
ONLINECOMPILER_API_KEY=""

JDOODLE_CLIENT_ID=""
JDOODLE_CLIENT_SECRET=""

CODAPI_API_KEY=""

JUDGE0_HOST="https://ce.judge0.com"
JUDGE0_API_KEY=""

# Optional AI Tutor Integration (Gemini / OpenAI)
GEMINI_API_KEY="your-google-gemini-api-key"
OPENAI_API_KEY="your-openai-api-key"

# Database & Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Gmail SMTP for OTP dispatch (optional)
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-char-app-password"
```

---

## 🚀 Running Locally

```bash
# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Student Portal:** [http://localhost:3000/user](http://localhost:3000/user)
- **CodeArena Workspace:** [http://localhost:3000/user/codearena](http://localhost:3000/user/codearena)
- **Codespace IDE:** [http://localhost:3000/user/codespace](http://localhost:3000/user/codespace)
- **Admin Portal:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
  - Default Admin: `admin@nextgenlabs.co` / `admin123` (or Master Key: `NGL-ROOT-ADMIN-2026`)

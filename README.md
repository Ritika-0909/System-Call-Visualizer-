# Syscall Vista – Interactive System Call Visualizer

Syscall Vista upgrades the original React + Vite demo into a full teaching lab for Linux system calls. Learners can paste or upload real C programs, watch them compile and execute inside a sandboxed subprocess, capture the live `strace` output, and step through rich visualizations that follow execution from user mode, into the kernel, and back again.

## Feature Highlights
- **Real code tracing** – GCC compiles your program, `strace -ff -tt -T` records every syscall (including child processes), and the Flask API returns structured JSON with counts, sequence, raw trace lines, and program output.
- **Animated walkthroughs** – Eight core syscalls (`open`, `read`, `write`, `close`, `fork`, `execve`, `wait`, `exit`) each include beginner and advanced explanations, register snapshots, kernel stack views, and data structure callouts.
- **Interactive analytics** – Bar/pie charts for frequency, a timeline scatter plot for chronological exploration, filters by category, and drill-down into raw `strace` lines.
- **Dual perspectives** – Toggle between beginner-friendly storytelling and advanced register/kernel details inside the visualization component.
- **Exportable reports** – Generate a single HTML file that captures the summary, syscall sequence, stdout/stderr, and the original source code.

## Architecture Overview

```
frontend (React + Vite + Tailwind + ShadCN)       backend (Flask + gcc + strace)
┌────────────────────────────────────────┐        ┌───────────────────────────────┐
│ TraceAnalyzer.tsx                      │  POST  │ /analyze                       │
│  - CodeEditor with upload/run          │ ─────▶ │ 1. write code.c to /tmp        │
│  - SyscallList & SyscallVisualization  │        │ 2. gcc -O0 code.c -> code.out  │
│  - SyscallTimeline & SyscallAnalytics  │ ◀───── │ 3. strace -ff code.out         │
│  - Glossary, stdout/stderr viewer      │  JSON  │ 4. parse trace -> summary      │
└────────────────────────────────────────┘        └───────────────────────────────┘
```

Visualization blueprints live under `src/visuals/*Flow.ts`; `src/utils/syscallVisualizations.ts` registers them for consumption by `SyscallVisualization.tsx`.

## Prerequisites

| Dependency | Purpose | Notes |
|------------|---------|-------|
| **Linux** (or WSL2) | Runs traced binaries & `strace` | Running on macOS/Windows directly is not supported. |
| **gcc** | Compiles uploaded C files | Ensure `gcc` is in `PATH`. |
| **strace** | Captures system calls | Install via `sudo apt install strace` (Debian/Ubuntu) or equivalent. |
| **Python 3.10+** | Flask backend | Virtual environment recommended. |
| **Node.js 18+** | React frontend | Yarn/npm/pnpm acceptable; repository uses npm. |

## Backend Setup (Flask + GCC + strace)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # On Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt

# optional: customise timeout (default 5s)
export SYSCALL_VISTA_TIMEOUT=7

python app.py                      # or: flask --app app run
```

Endpoints:
- `GET /health` – readiness probe.
- `POST /analyze` – accepts `multipart/form-data` (file upload) or JSON `{ "code": "<c source>" }`.

Successful responses resemble:

```json
{
  "id": "5fda9f3c3b3e4b8a9a24d3bb76d54f76",
  "summary": { "execve": 1, "write": 1, "close": 1, "exit": 1 },
  "sequence": ["execve", "brk", "mmap", "write", "close", "exit"],
  "events": [
    {
      "index": 3,
      "name": "write",
      "timestamp": 170.123456,
      "duration": 0.000053,
      "pid": 23145,
      "result": "27",
      "raw": "170.123456 write(1, \"Hello from Syscall Vista!\\n\", 27) = 27 <0.000053>"
    }
  ],
  "stdout": "Hello from Syscall Vista!\n",
  "stderr": "",
  "source": "int main(void) { ... }"
}
```

Each request runs inside a fresh temporary directory that is deleted after analysis.

## Frontend Setup (React + Vite)

```bash
npm install

# point the frontend at the Flask API (defaults to http://localhost:5000)
echo "VITE_API_URL=http://127.0.0.1:5000" > .env
# optional: surface the backend timeout to the UI helper text
echo "VITE_ANALYSIS_TIMEOUT=5" >> .env

npm run dev
```

Visit `http://localhost:5173` (Vite default). Paste or upload a C program, then click **Run Analysis**.

## Exploring the UI

1. **Code Editor** – Enhanced `CodeEditor` component supports uploads, inline editing, and a one-click “Run Analysis” action.
2. **Trace Summary** – Displays total events, unique syscalls, filtered lists, and raw trace inspection.
3. **Analytics** – Bar & pie charts summarise syscall usage by name and category.
4. **Visualization** – Interactive stepper with beginner/advanced toggles for the eight featured syscalls.
5. **Timeline** – Scatter plot showing when each syscall occurred, coupled with a scrollable log of `strace` lines.
6. **Glossary & Output** – Right sidebar retains the existing glossary plus live stdout/stderr capture.
7. **Report Export** – Downloads an HTML snapshot suitable for sharing or printing.

## Security Considerations

- Only run the backend against trusted or sandboxed code. For classroom use, consider containerising the service or adding seccomp/cgroup policies.
- The default timeout (5s) prevents runaway processes; adjust via `SYSCALL_VISTA_TIMEOUT` and mirror the value in `VITE_ANALYSIS_TIMEOUT` for accurate UI messaging.

## Project Structure

```
backend/
  app.py               # Flask server orchestrating compile → strace → parse
  requirements.txt
src/
  components/
    TraceAnalyzer.tsx  # Main workflow coordinator
    SyscallTimeline.tsx
    SyscallAnalytics.tsx
    SyscallVisualization.tsx
    CodeEditor.tsx     # Upload + run enhancements
  visuals/
    openFlow.ts, readFlow.ts, writeFlow.ts, closeFlow.ts,
    forkFlow.ts, execveFlow.ts, waitFlow.ts, exitFlow.ts
  utils/
    syscallVisualizations.ts  # Registry for visualization data
    syscallParser.ts          # Static parser + helper utilities
```

## Troubleshooting

| Symptom | Possible Cause | Fix |
|---------|----------------|-----|
| `strace: command not found` | strace not installed on host | `sudo apt install strace` (Debian/Ubuntu) |
| `Compilation failed` errors | Invalid C code or missing headers | Check the returned `stderr` field or export report for diagnostics. |
| Timeline empty | Program crashed before issuing syscalls | Inspect `stderr`; ensure binary runs successfully outside the analyzer. |
| CORS/network errors | Frontend cannot reach backend | Confirm `VITE_API_URL` matches the Flask server URL/port. |

Enjoy exploring the journey from user space to kernel space and back again!


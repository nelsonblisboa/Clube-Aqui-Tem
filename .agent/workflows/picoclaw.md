---
description: Automate tasks using PicoClaw as a sub-agent
---

PicoClaw is an ultra-lightweight agent assistant written in Go, optimized for efficiency and edge hardware. Use this workflow to interact with, configure or deploy PicoClaw as part of your system.

### Prerequisites
- PicoClaw repository cloned to `C:\Users\Nelson\Desktop\picoclaw`
- Go installed (for source build) or Docker installed.

### Common Tasks

#### 1. Configuration & Setup
To configure PicoClaw to use your local Ollama models:
1. Navigate to `C:\Users\Nelson\Desktop\picoclaw\config\config_sample.yaml`.
2. Update the `llm_backend` to use `ollama` and set the models (`qwen3-coder`, `llama3`).
3. Run the onboarding process: `./picoclaw onboard` (source) or via Docker.

#### 2. Run PicoClaw as a CLI Sub-Agent
Use PicoClaw for quick "one-shot" tasks:
```bash
cd C:\Users\Nelson\Desktop\picoclaw
# Ask a question or submit a task to the sub-agent
./picoclaw -m "Analyze the latest log file at c:\Users\Nelson\Desktop\Clube-Aqui-Tem\logs\waha.log"
```

#### 3. Start Web Console (Launcher)
To manage multiple agents or use the Web UI:
```bash
cd C:\Users\Nelson\Desktop\picoclaw
./picoclaw-launcher
# Open http://localhost:18800 in your browser.
```

#### 4. Project Integration (Monitoring)
To deploy PicoClaw to monitor a specific part of your project (e.g. WhatsApp status):
1. Create a tool for PicoClaw in `pkg/agent/tools/`.
2. Rebuild PicoClaw using `go build`.
3. Set a cron task in PicoClaw to monitor the WAHA API every 5 minutes.

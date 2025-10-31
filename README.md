# 🚀 AutoMate Installer

**One-click installer for the complete AutoMate AI Automation Hub**

No coding. No configuration. Just double-click and it works.

---

## 🎯 What This Does

The AutoMate Installer sets up your complete AI automation environment in about 10 minutes:

- ✅ **AutoChat** - Beautiful AI chat interface
- ✅ **AutoHub** - Multi-channel conversation engine  
- ✅ **AutoMem** - Semantic memory system with FalkorDB + Qdrant
- ✅ **Docker** - Containerized database services
- ✅ **All dependencies** - Git, Node.js, Python, Docker

**Result:** A fully functional AI automation hub at `~/AutoMate`

---

## 💻 Download

### macOS
```bash
AutoMate-Installer.dmg
```
Double-click to install, then launch AutoMate Installer.app

### Windows
```bash
AutoMate-Setup.exe
```
Run the installer and follow the prompts

### Linux
```bash
AutoMate-Installer.AppImage
```
Make executable: `chmod +x AutoMate-Installer.AppImage` and run

---

## 📋 Prerequisites

**Minimum Requirements:**
- macOS 12+, Windows 10+, or Linux
- 8GB RAM
- 5GB free disk space
- Internet connection

**That's it!** The installer will handle everything else.

---

## 🎨 Installation Flow

### 1. Welcome Screen
Shows what will be installed and estimated time

### 2. System Check
Automatically detects missing dependencies and offers to install them

### 3. API Keys Setup
- **Anthropic (Claude)** - Required for AI assistant
- **OpenAI** - Optional for embeddings
- **Cursor** - Optional for IDE integration

Each key includes:
- Why it's needed
- Link to get the key
- Test button to validate before proceeding

### 4. Installation Progress
Real-time progress bar showing:
- Current step
- Completed steps
- Overall progress percentage

### 5. Success!
Shows all running services with clickable URLs:
- AutoChat UI: http://localhost:3000
- AutoHub API: http://localhost:3001
- AutoMem API: http://localhost:8001

---

## 🔧 What Gets Installed

```
~/AutoMate/
├── .env                  # Environment configuration
├── autoChat/             # UI (from stevew00dy/autochat)
├── autohub/              # Engine (from verygoodplugins/autohub)
└── automem/              # Memory (from verygoodplugins/automem)
```

### Services Started

- **FalkorDB** (port 6379) - Graph database
- **Qdrant** (port 6333) - Vector database
- **AutoMem API** (port 8001) - Memory service
- **AutoHub** (port 3001) - Chat server
- **AutoChat** (port 3000) - Web UI

---

## 🚀 After Installation

### Open AutoChat
Visit http://localhost:3000 or click "Open AutoChat" button

### Manage Services
All services run in the background. To stop/restart:

```bash
cd ~/AutoMate

# Stop services
cd automem && docker-compose down
pkill -f "node.*autohub"
pkill -f "npm run dev"

# Start services
cd automem && docker-compose up -d
cd ../autohub && npm start &
cd ../autoChat && npm run dev &
```

---

## 🛠️ Development

Want to customize or contribute to the installer?

### Setup
```bash
git clone https://github.com/[your-repo]/automate-installer.git
cd automate-installer
npm install
```

### Run in Development
```bash
npm run dev
```

### Build Distributable
```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux  
npm run build:linux

# All platforms
npm run dist
```

Outputs will be in `dist/` folder.

---

## 🏗️ Architecture

### Technology Stack

**UI:**
- Electron (cross-platform app)
- Vanilla JavaScript (no framework overhead)
- Modern CSS with animations

**Backend:**
- Node.js for scripting
- execa for shell commands
- axios for API validation
- dockerode for Docker management

### Components

- `src/main.js` - Electron main process
- `src/ui/` - Frontend UI
- `src/installer/` - Installation logic
- `scripts/` - Platform-specific scripts

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on your platform
5. Submit a pull request

---

## 📝 License

MIT License - see LICENSE file

---

## 🙏 Credits

Built with love by the AutoMate team.

**Components:**
- **AutoChat** by Steve Woody
- **AutoHub** by Jack Arturo (VeryGoodPlugins)
- **AutoMem** by Jack Arturo (VeryGoodPlugins)

---

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/[your-repo]/automate-installer/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/[your-repo]/automate-installer/discussions)
- 📧 Email: support@automate.ai

---

## 🎉 That's It!

You now have a complete AI automation hub. No coding required.

**Next steps:**
1. Open AutoChat at http://localhost:3000
2. Start chatting with Claude
3. Explore the integrations
4. Build your automations

Welcome to AutoMate! 🤖


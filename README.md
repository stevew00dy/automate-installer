# 🚀 AutoMate Installer

**One-click installer for macOS** - Complete AI automation hub in 10 minutes

No coding. No terminal. No configuration. Just double-click.

**Platform:** macOS 10.13+ only

---

## 🎯 What This Does

Installs and configures your complete AI automation environment:

- ✅ **AutoChat** - Beautiful AI chat interface  
- ✅ **AutoHub** - Multi-channel conversation engine  
- ✅ **AutoMem** - Semantic memory (FalkorDB + Qdrant)  
- ✅ **Docker** - Database containers  
- ✅ **All dependencies** - Git, Node.js, Python, Docker Desktop

**Installs to:** `~/AutoMate`

---

## 🖱️ For Users (Non-Technical)

### Installation:
1. Download `AutoMate Installer.app`
2. Double-click to launch
3. Enter your [Anthropic API key](https://console.anthropic.com)
4. Click "Install"
5. Wait ~10 minutes
6. AutoChat opens automatically!

**That's it.** No terminal. No coding.

---

## 🧪 For Developers

### Build from Source:
```bash
git clone https://github.com/stevew00dy/automate-installer.git
cd automate-installer
npm install
npm start
```

### Create Desktop App:
```bash
cd ~/Desktop
open "AutoMate Installer.app"
```

The app is already on your Desktop after following the repo setup!

---

## 📦 What Gets Installed

### System Dependencies (via Homebrew):
- **Git** - Repository cloning
- **Node.js** - JavaScript runtime for AutoChat & AutoHub
- **Python 3.11** - Backend for AutoMem
- **Docker Desktop** - Database containers

### AutoMate Components:
- **AutoChat** (`~/AutoMate/autoChat`) - React UI on port 3000
- **AutoHub** (`~/AutoMate/autohub`) - Node.js API on port 3001
- **AutoMem** (`~/AutoMate/automem`) - Flask API on port 8001

### Databases (Docker):
- **FalkorDB** - Graph database (conversations, memories) on port 6379
- **Qdrant** - Vector database (semantic search) on port 6333

---

## ⚙️ Configuration

### API Keys Required:
- **Anthropic** (REQUIRED) - Powers Claude AI assistant
  - Get yours: https://console.anthropic.com
  - Used for chat, reasoning, automation

- **OpenAI** (OPTIONAL) - For embeddings and alternate models
  - Get yours: https://platform.openai.com
  - Can skip and use free alternatives

### Auto-Generated:
- `.env` file with all configuration
- Unique `AUTOMEM_API_KEY`
- Port assignments
- Database credentials

---

## 🔍 What the Installer Does

### Step 1: System Check (30 seconds)
- Checks macOS version (10.13+)
- Verifies RAM (8GB minimum)
- Checks disk space (5GB+ needed)
- Detects Git, Node, Python, Docker

**If missing:** Offers "Install Missing Tools" button → installs via Homebrew

### Step 2: API Keys (1 minute)
- Validates Anthropic key (tests actual API call)
- Optionally validates OpenAI key
- Can skip OpenAI (uses free alternatives)

### Step 3: Installation (8-10 minutes)
1. Creates `~/AutoMate` directory
2. Clones repos from GitHub
3. Installs npm dependencies (~3 min)
4. Installs Python dependencies (~2 min)
5. Starts Docker containers (~2 min)
6. Initializes databases
7. Starts AutoHub & AutoChat servers

### Step 4: Success!
- Shows service URLs
- Opens AutoChat at http://localhost:3000
- All services running and ready

---

## 🚨 Troubleshooting

### "Docker not running"
**Fix:** Open Docker Desktop manually
```bash
open -a Docker
```
Wait for it to start, then click "Retry" in installer

### "Port already in use"
**Fix:** Stop conflicting services
```bash
lsof -i :3000  # AutoChat
lsof -i :3001  # AutoHub
lsof -i :8001  # AutoMem
```
Kill the process and restart installer

### "Git clone failed"
**Fix:** Check internet connection and GitHub access
- Ensure you can reach github.com
- If AutoChat clone fails (private repo), contact maintainer

### "npm install failed"
**Fix:** Check Node.js version
```bash
node --version  # Should be v16+
```
If < v16, run: `brew upgrade node`

---

## 🔧 Advanced

### Manual Installation:
If the installer fails, you can install manually:

```bash
# 1. Create directory
mkdir ~/AutoMate && cd ~/AutoMate

# 2. Clone repos
git clone https://github.com/stevew00dy/autochat.git autoChat
git clone https://github.com/verygoodplugins/autohub.git
git clone https://github.com/verygoodplugins/automem.git

# 3. Create .env
cat > .env << 'EOF'
ANTHROPIC_API_KEY=your-key-here
AUTOMEM_API_KEY=$(uuidgen)
AUTOMEM_ENDPOINT=http://localhost:8001
AUTOHUB_PORT=3001
AUTOCHAT_PORT=3000
OWNER_NAME=Your Name
EOF

# 4. Install dependencies
cd autoChat && npm install && cd ..
cd autohub && npm install && cd ..
cd automem && pip3 install -r requirements.txt && cd ..

# 5. Start Docker
cd automem && docker-compose up -d && cd ..

# 6. Start services
cd autohub && npm start &
cd autoChat && npm run dev &
```

### Uninstall:
```bash
# Stop services
docker stop $(docker ps -q)

# Remove AutoMate
rm -rf ~/AutoMate

# Remove app
rm -rf ~/Desktop/"AutoMate Installer.app"
```

---

## 🎨 Technical Stack

### Frontend:
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling

### Backend:
- **Node.js/Express** - AutoHub API
- **Flask/Python** - AutoMem API
- **Electron** - Installer app

### Databases:
- **FalkorDB** - Graph database (conversations, memory relationships)
- **Qdrant** - Vector database (semantic search, embeddings)
- **SQLite** - Local storage (migrated to FalkorDB)

### AI:
- **Anthropic Claude** - Primary AI model
- **OpenAI** - Optional embeddings

---

## 📊 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS** | macOS 10.13+ | macOS 12+ |
| **RAM** | 8GB | 16GB+ |
| **Disk** | 5GB free | 10GB+ free |
| **Internet** | Required | Broadband |
| **macOS Version** | High Sierra | Ventura+ |

---

## 🤝 Contributing

### For the Installer:
1. Fork this repo
2. Create feature branch
3. Test on fresh macOS VM
4. Submit PR

### For AutoMate Components:
- **AutoChat**: https://github.com/stevew00dy/autochat
- **AutoHub**: https://github.com/verygoodplugins/autohub
- **AutoMem**: https://github.com/verygoodplugins/automem

---

## 📝 License

MIT License - See LICENSE file

---

## 🙏 Credits

- **AutoMate** - Steve Woody
- **AutoHub & AutoMem** - Jack Arturo (@verygoodplugins)
- **Built with** - Electron, React, Node.js, Python, FalkorDB, Qdrant

---

## 📞 Support

- **Issues**: https://github.com/stevew00dy/automate-installer/issues
- **Docs**: See `TESTING-GUIDE.md` for detailed testing instructions

---

**🎉 Made with ❤️ for the Mac community**

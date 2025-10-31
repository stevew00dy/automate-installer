# 🧪 AutoMate Installer Testing Guide

## ✅ What the Installer Does

The installer automatically:
1. **Checks system requirements** (RAM, disk space, OS)
2. **Detects missing dependencies** (Git, Node.js, Docker, Python)
3. **Offers to install missing tools** (via Homebrew on macOS)
4. **Validates API keys** (tests with actual API calls)
5. **Clones repositories** (AutoChat, AutoHub, AutoMem)
6. **Installs dependencies** (npm, pip, Docker images)
7. **Starts all services** (AutoChat, AutoHub, AutoMem, FalkorDB, Qdrant)
8. **Opens AutoChat** in browser

**Expected Time:** ~10 minutes on a fresh machine

---

## 🖥️ Testing on a Different Machine

### Best Test Scenarios:

**Scenario 1: Fresh Mac** (RECOMMENDED)
- Clean macOS install (VM or fresh laptop)
- No developer tools installed
- Tests full installation flow

**Scenario 2: Partial Setup Mac**
- Has some tools (e.g., Node.js) but missing others (e.g., Docker)
- Tests selective installation

**Scenario 3: Your Current Mac** (SAFE)
- All tools already present
- Tests the "everything already installed" path
- Won't reinstall anything

---

## 📋 What Gets Checked

### System Requirements:
- ✅ **Operating System:** macOS 10.13+, Windows 10+, or Linux
- ✅ **RAM:** 8GB minimum (16GB recommended)
- ✅ **Disk Space:** 5GB+ free
- ✅ **Internet:** Required for downloads

### Required Dependencies:
- ✅ **Git:** Version control (for cloning repos)
- ✅ **Node.js:** v16+ (for AutoChat & AutoHub)
- ✅ **Docker:** For FalkorDB & Qdrant databases
- ✅ **Python:** 3.9+ (for AutoMem)

### API Keys:
- ✅ **Anthropic API Key:** REQUIRED (powers Claude)
- ✅ **OpenAI API Key:** OPTIONAL (for embeddings)

---

## 🎬 Testing Flow

### Step 1: System Check Screen
**What happens:**
- Installer checks for Git, Node, Docker, Python
- Shows ✅ for installed, ⚠️ for missing

**If dependencies missing:**
- Shows "Install Missing Tools" button
- Clicking installs via Homebrew (macOS)
- Takes ~5-10 minutes depending on what's missing

**Expected behavior:**
- If all tools present → "Continue" button enabled
- If tools missing → "Install Missing Tools" button appears
- After install → Rechecks system, then enables "Continue"

---

### Step 2: API Keys Screen
**What happens:**
- Asks for Anthropic API key (required)
- Asks for OpenAI API key (optional, can skip)

**Testing API keys:**
- Click "Test Key" button
- Makes actual API call to verify
- Shows ✓ Valid or ✗ Invalid

**Expected behavior:**
- Can proceed with just Anthropic key
- Can skip OpenAI key (uses free alternatives)
- "Install" button only enabled when Anthropic key provided

---

### Step 3: Installation Screen
**What happens:**
- Creates `~/AutoMate` directory
- Clones 3 repos from GitHub
- Installs npm/pip dependencies
- Starts Docker containers
- Launches services

**Progress indicators:**
- Shows current step (e.g., "Cloning AutoChat...")
- Progress bar increases (0% → 100%)
- Completed steps show ✅

**Expected time:**
- ~2 min: Clone repos
- ~3-5 min: Install dependencies
- ~2-3 min: Start Docker & services
- **Total: ~10 minutes**

---

### Step 4: Success Screen
**What happens:**
- Shows all services running
- Lists URLs for AutoChat, AutoHub, AutoMem
- "Open AutoChat" button

**Expected behavior:**
- Clicking URLs opens browser
- Services are accessible
- AutoChat loads at localhost:3000

---

## 🐛 Known Issues & Limitations

### Current Limitations:
1. **Homebrew install requires password** - User needs to enter sudo password if Homebrew not installed
2. **Docker Desktop** - Must be running (installer doesn't auto-start it)
3. **AutoChat repo is private** - Will fail if not authenticated (need to fix this!)
4. **No rollback** - If installation fails partway, leaves partial install

### Issues to Fix:
- [ ] AutoChat repo should be public or handle auth
- [ ] Check if Docker Desktop is running (not just installed)
- [ ] Better error messages for specific failures
- [ ] Add "Retry" button if steps fail
- [ ] Add cleanup/uninstall option

---

## 🧪 How to Test on Different Machine

### Option A: Using a VM (SAFEST)
```bash
# Create macOS VM (using UTM, Parallels, or VirtualBox)
# Download AutoMate Installer.app
# Double-click and test full flow
```

**Pros:**
- Clean slate
- Can test full installation
- Safe (VM is isolated)

**Cons:**
- Need VM software
- Takes time to set up

---

### Option B: Use a Friend's Mac (EASIEST)
```bash
# Send them: AutoMate-Installer.zip
# They: Unzip, double-click, follow prompts
# You: Watch over their shoulder (or screen share)
```

**Pros:**
- Real-world test
- See actual user experience
- Find UX issues

**Cons:**
- Need a willing friend
- Their machine gets AutoMate installed

---

### Option C: Fresh User Account on Your Mac
```bash
# System Preferences → Users & Groups → Add User
# Log in as new user (fresh home directory)
# Copy AutoMate Installer.app to new user's Desktop
# Test installation
```

**Pros:**
- Tests on your hardware
- Can delete user account after

**Cons:**
- Still shares system-level tools (Homebrew, Docker Desktop)
- Not a truly "fresh" system

---

### Option D: GitHub Actions / CI (BEST FOR AUTOMATION)
```yaml
# .github/workflows/test-installer.yml
# Run installer in GitHub Actions on fresh Ubuntu/macOS
```

**Pros:**
- Automated testing
- Truly fresh system every time
- Can test on multiple OSes

**Cons:**
- Need to set up CI workflow
- Limited interaction (can't see UI)

---

## 📊 Test Checklist

Use this to verify everything works:

### Pre-Installation:
- [ ] .app file double-clicks successfully
- [ ] UI window opens
- [ ] Welcome screen displays correctly
- [ ] Can scroll to see all content

### System Check:
- [ ] Detects installed tools correctly
- [ ] Shows missing tools as ⚠️
- [ ] "Install Missing Tools" button appears if needed
- [ ] Installation of missing tools completes successfully
- [ ] Re-check after install shows ✅

### API Keys:
- [ ] Can paste API key
- [ ] "Test Key" validates correctly
- [ ] Invalid key shows error
- [ ] Valid key enables "Install" button
- [ ] Can skip OpenAI key

### Installation:
- [ ] Progress bar moves smoothly
- [ ] Each step shows in UI
- [ ] No errors during clone
- [ ] npm install completes
- [ ] Docker containers start
- [ ] Services become accessible

### Success:
- [ ] Success screen displays
- [ ] All URLs are clickable
- [ ] AutoChat opens in browser
- [ ] Can create a conversation
- [ ] Memory tools work

---

## 🚨 If Something Fails

### Error: "Git not found"
**Fix:** Installer should offer to install it
**Manual:** `brew install git`

### Error: "Docker not running"
**Fix:** Open Docker Desktop manually
**Future:** Installer should detect and prompt

### Error: "AutoChat clone failed"
**Fix:** Repo is private - need to make public or handle auth
**Workaround:** Clone manually with credentials

### Error: "Port already in use"
**Fix:** Stop conflicting services
**Check:** `lsof -i :3000` (AutoChat), `:3001` (AutoHub), `:8001` (AutoMem)

### Error: "npm install failed"
**Fix:** Check Node.js version (need 16+)
**Workaround:** `nvm install 18 && nvm use 18`

---

## 💡 Recommended Testing Order

1. **Test on your machine first** (sanity check)
2. **Create a VM** (full flow test)
3. **Test on friend's machine** (real user test)
4. **Set up CI** (automated regression testing)

---

## 🎯 Success Criteria

The installer is **production-ready** when:
- ✅ Installs successfully on fresh macOS (10.13+)
- ✅ Installs successfully on fresh Windows 10+
- ✅ Handles missing dependencies gracefully
- ✅ Validates API keys correctly
- ✅ All services start and are accessible
- ✅ AutoChat opens and works
- ✅ Takes < 15 minutes on average internet
- ✅ Provides clear error messages if something fails
- ✅ Doesn't require any terminal commands

---

## 📞 Questions to Ask Testers

1. Was the process clear and easy to follow?
2. Did any step feel confusing?
3. How long did the installation take?
4. Did any errors occur? (screenshot if possible)
5. Were the API key instructions clear?
6. Did AutoChat open automatically at the end?
7. Would you recommend this to a non-technical friend?

---

## 🔧 Next Improvements

### High Priority:
1. Make AutoChat repo public (or handle auth)
2. Check if Docker Desktop is running
3. Add retry logic for failed steps
4. Better error messages

### Medium Priority:
5. Add uninstall/cleanup option
6. Show estimated time remaining
7. Add "Skip" option for already-installed components
8. Create DMG for easier distribution

### Low Priority:
9. Windows support
10. Linux support
11. Custom install location
12. Offline mode (bundled dependencies)

---

**Ready to test?** Start with your current machine, then move to a fresh VM! 🚀


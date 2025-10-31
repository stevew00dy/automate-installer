const os = require('os');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const execAsync = promisify(exec);

class Installer {
  constructor() {
    this.installPath = path.join(process.env.HOME, 'AutoMate');
  }

  // System Check (macOS only)
  async checkSystem() {
    const checks = [];

    // Check macOS version
    const { stdout: osVersion } = await execAsync('sw_vers -productVersion');
    const majorVersion = parseInt(osVersion.split('.')[0]);
    checks.push({
      name: 'macOS Version',
      passed: majorVersion >= 10,
      required: true,
      message: `macOS ${osVersion.trim()} ${majorVersion >= 10 ? '✓' : '(need 10.13+)'}`
    });

    // Check RAM
    const totalRAM = Math.round(os.totalmem() / (1024 ** 3));
    checks.push({
      name: 'RAM',
      passed: totalRAM >= 8,
      required: true,
      message: `${totalRAM}GB ${totalRAM >= 8 ? '✓' : '(minimum 8GB required)'}`
    });

    // Check disk space
    try {
      const { stdout } = await execAsync('df -h ~ | tail -1');
      const available = stdout.split(/\s+/)[3];
      checks.push({
        name: 'Disk Space',
        passed: true,
        required: true,
        message: `${available} available ✓`
      });
    } catch (error) {
      checks.push({
        name: 'Disk Space',
        passed: false,
        required: true,
        message: 'Could not check'
      });
    }

    // Check Git
    try {
      await execAsync('git --version');
      checks.push({
        name: 'Git',
        passed: true,
        required: true,
        message: 'Installed'
      });
    } catch (error) {
      checks.push({
        name: 'Git',
        passed: false,
        required: true,
        message: 'Not installed'
      });
    }

    // Check Node.js
    try {
      const { stdout } = await execAsync('node --version');
      const version = stdout.trim();
      checks.push({
        name: 'Node.js',
        passed: true,
        required: true,
        message: version
      });
    } catch (error) {
      checks.push({
        name: 'Node.js',
        passed: false,
        required: true,
        message: 'Not installed'
      });
    }

    // Check Docker
    try {
      await execAsync('docker --version');
      checks.push({
        name: 'Docker',
        passed: true,
        required: true,
        message: 'Installed'
      });
    } catch (error) {
      checks.push({
        name: 'Docker',
        passed: false,
        required: true,
        message: 'Not installed'
      });
    }

    // Check Python
    try {
      const { stdout } = await execAsync('python3 --version');
      checks.push({
        name: 'Python',
        passed: true,
        required: true,
        message: stdout.trim()
      });
    } catch (error) {
      checks.push({
        name: 'Python',
        passed: false,
        required: true,
        message: 'Not installed'
      });
    }

    // Check Docker Desktop (macOS specific)
    try {
      await execAsync('docker --version');
      // Check if Docker Desktop is actually running
      try {
        await execAsync('docker ps');
        checks.push({
          name: 'Docker Desktop',
          passed: true,
          required: true,
          message: 'Running ✓'
        });
      } catch (error) {
        checks.push({
          name: 'Docker Desktop',
          passed: false,
          required: true,
          message: 'Installed but not running - please open Docker Desktop'
        });
      }
    } catch (error) {
      checks.push({
        name: 'Docker Desktop',
        passed: false,
        required: true,
        message: 'Not installed'
      });
    }

    return checks;
  }

  // Install Dependencies (macOS only)
  async installDependencies() {
    // Check if Homebrew is installed
    try {
      await execAsync('which brew');
    } catch (error) {
      // Install Homebrew
      await execAsync('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
    }

    // Install missing dependencies
    const checks = await this.checkSystem();
    const toInstall = [];

    checks.forEach(check => {
      if (!check.passed && check.required) {
        if (check.name === 'Git') toInstall.push('git');
        if (check.name === 'Node.js') toInstall.push('node');
        if (check.name === 'Python') toInstall.push('python@3.11');
        if (check.name === 'Docker') toInstall.push('--cask docker');
      }
    });

    if (toInstall.length > 0) {
      await execAsync(`brew install ${toInstall.join(' ')}`);
      
      // If Docker was installed, open Docker Desktop
      if (toInstall.includes('--cask docker')) {
        await execAsync('open -a Docker');
        // Wait for Docker to start
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  // Validate API Key
  async validateApiKey(provider, key) {
    try {
      if (provider === 'anthropic') {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        }, {
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          }
        });
        return response.status === 200;
      } else if (provider === 'openai') {
        const response = await axios.get('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${key}`
          }
        });
        return response.status === 200;
      }
    } catch (error) {
      console.error('API key validation error:', error.message);
      return false;
    }
  }

  // Main Installation
  async startInstallation(config, progressCallback) {
    const steps = [
      { name: 'Creating ~/AutoMate directory', action: () => this.createDirectory(config) },
      { name: 'Cloning AutoChat from GitHub', action: () => this.cloneRepo('autochat', config) },
      { name: 'Cloning AutoHub from GitHub', action: () => this.cloneRepo('autohub', config) },
      { name: 'Cloning AutoMem from GitHub', action: () => this.cloneRepo('automem', config) },
      { name: 'Generating .env configuration', action: () => this.createEnvFile(config) },
      { name: 'Installing AutoChat dependencies (npm)', action: () => this.installNpmDeps('autoChat', config) },
      { name: 'Installing AutoHub dependencies (npm)', action: () => this.installNpmDeps('autohub', config) },
      { name: 'Installing AutoMem dependencies (pip)', action: () => this.installPythonDeps(config) },
      { name: 'Starting Docker containers (FalkorDB, Qdrant)', action: () => this.startDocker(config) },
      { name: 'Initializing databases', action: () => this.initDatabases(config) },
      { name: 'Starting AutoHub server', action: () => this.startAutoHub(config) },
      { name: 'Starting AutoChat UI', action: () => this.startAutoChat(config) }
    ];

    const completed = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const percent = Math.round(((i + 1) / steps.length) * 100);

      progressCallback({
        percent,
        step: i + 1,
        message: step.name,
        completed: [...completed]
      });

      try {
        await step.action();
        completed.push(step.name);
      } catch (error) {
        throw new Error(`${step.name} failed: ${error.message}`);
      }
    }

    progressCallback({
      percent: 100,
      step: steps.length,
      message: 'Installation complete!',
      completed
    });
  }

  async createDirectory(config) {
    await fs.mkdir(config.installPath, { recursive: true });
  }

  async cloneRepo(repo, config) {
    const repos = {
      'autochat': 'https://github.com/stevew00dy/autochat.git',
      'autohub': 'https://github.com/verygoodplugins/autohub.git',
      'automem': 'https://github.com/verygoodplugins/automem.git'
    };

    const repoPath = path.join(config.installPath, repo);
    
    // Check if repo is bundled in the app
    const bundledPath = path.join(__dirname, '../../bundled-repos', repo);
    
    try {
      await fs.access(bundledPath);
      // Bundled repo exists - copy it instead of cloning
      console.log(`Using bundled ${repo}...`);
      await this.copyDir(bundledPath, repoPath);
    } catch (error) {
      // Not bundled - clone from GitHub
      console.log(`Cloning ${repo} from GitHub...`);
      await execAsync(`git clone ${repos[repo]} ${repoPath}`);
    }
  }

  async copyDir(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  async createEnvFile(config) {
    const envContent = `
# AutoMate Environment Configuration
# Generated by AutoMate Installer

# Anthropic API
${config.anthropicKey && config.anthropicKey !== 'SKIP' ? `ANTHROPIC_API_KEY=${config.anthropicKey}` : '# ANTHROPIC_API_KEY=your-key-here  # Add your key from https://console.anthropic.com'}

# OpenAI API (Optional)
${config.openaiKey && config.openaiKey !== 'SKIP' ? `OPENAI_API_KEY=${config.openaiKey}` : '# OPENAI_API_KEY='}

# AutoMem Configuration
AUTOMEM_API_KEY=${uuidv4()}
AUTOMEM_ENDPOINT=http://localhost:8001

# Service Ports
AUTOHUB_PORT=3001
AUTOCHAT_PORT=3000
AUTOMEM_PORT=8001
FALKORDB_PORT=6379
QDRANT_PORT=6333

# Owner Configuration
OWNER_NAME=Steve
    `.trim();

    await fs.writeFile(path.join(config.installPath, '.env'), envContent);
  }

  async installNpmDeps(dir, config) {
    const dirPath = path.join(config.installPath, dir);
    await execAsync('npm install', { cwd: dirPath });
  }

  async installPythonDeps(config) {
    const dirPath = path.join(config.installPath, 'automem');
    await execAsync('pip3 install -r requirements.txt', { cwd: dirPath });
  }

  async startDocker(config) {
    const dirPath = path.join(config.installPath, 'automem');
    await execAsync('docker-compose up -d', { cwd: dirPath });
    
    // Wait for services to be ready
    await this.waitForService('http://localhost:6379', 30);
    await this.waitForService('http://localhost:6333', 30);
  }

  async initDatabases(config) {
    // Wait a bit for databases to fully initialize
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  async startAutoHub(config) {
    const dirPath = path.join(config.installPath, 'autohub');
    exec('npm start', { cwd: dirPath, detached: true });
    await this.waitForService('http://localhost:3001', 30);
  }

  async startAutoChat(config) {
    const dirPath = path.join(config.installPath, 'autoChat');
    exec('npm run dev', { cwd: dirPath, detached: true });
    await this.waitForService('http://localhost:3000', 30);
  }

  async waitForService(url, timeoutSeconds) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutSeconds * 1000) {
      try {
        await axios.get(url, { timeout: 1000 });
        return true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error(`Service at ${url} did not become ready`);
  }
}

module.exports = new Installer();


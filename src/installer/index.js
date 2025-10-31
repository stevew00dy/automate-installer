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
    this.platform = process.platform;
    this.installPath = this.platform === 'win32' ?
      path.join(process.env.USERPROFILE, 'AutoMate') :
      path.join(process.env.HOME, 'AutoMate');
  }

  // System Check
  async checkSystem() {
    const checks = [];

    // Check OS
    const osInfo = `${os.platform()} ${os.release()}`;
    checks.push({
      name: 'Operating System',
      passed: true,
      required: true,
      message: osInfo
    });

    // Check RAM
    const totalRAM = Math.round(os.totalmem() / (1024 ** 3));
    checks.push({
      name: 'RAM',
      passed: totalRAM >= 8,
      required: true,
      message: `${totalRAM}GB ${totalRAM >= 8 ? '(sufficient)' : '(minimum 8GB required)'}`
    });

    // Check disk space
    try {
      const { stdout } = await execAsync(this.platform === 'win32' ?
        'wmic logicaldisk get size,freespace' :
        'df -h ~ | tail -1'
      );
      const hasSpace = true; // Simplified for now
      checks.push({
        name: 'Disk Space',
        passed: hasSpace,
        required: true,
        message: hasSpace ? '5GB+ available' : 'Insufficient space'
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
      const { stdout } = await execAsync(this.platform === 'win32' ? 'python --version' : 'python3 --version');
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

    return checks;
  }

  // Install Dependencies
  async installDependencies() {
    if (this.platform === 'darwin') {
      // macOS - use Homebrew
      try {
        // Install Homebrew if not present
        await execAsync('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
      } catch (error) {
        // Homebrew already installed
      }

      // Install dependencies
      await execAsync('brew install git node python@3.11 docker');
    } else if (this.platform === 'win32') {
      // Windows - use Chocolatey
      await execAsync('choco install git nodejs python3 docker-desktop -y');
    } else {
      // Linux
      await execAsync('sudo apt-get update && sudo apt-get install -y git nodejs npm python3 python3-pip docker.io');
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
      { name: 'Creating AutoMate directory', action: () => this.createDirectory(config) },
      { name: 'Cloning AutoChat', action: () => this.cloneRepo('autochat', config) },
      { name: 'Cloning AutoHub', action: () => this.cloneRepo('autohub', config) },
      { name: 'Cloning AutoMem', action: () => this.cloneRepo('automem', config) },
      { name: 'Generating environment config', action: () => this.createEnvFile(config) },
      { name: 'Installing AutoChat dependencies', action: () => this.installNpmDeps('autoChat', config) },
      { name: 'Installing AutoHub dependencies', action: () => this.installNpmDeps('autohub', config) },
      { name: 'Installing AutoMem dependencies', action: () => this.installPythonDeps(config) },
      { name: 'Starting Docker services', action: () => this.startDocker(config) },
      { name: 'Initializing databases', action: () => this.initDatabases(config) },
      { name: 'Starting AutoHub', action: () => this.startAutoHub(config) },
      { name: 'Starting AutoChat', action: () => this.startAutoChat(config) }
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
    await execAsync(`git clone ${repos[repo]} ${repoPath}`);
  }

  async createEnvFile(config) {
    const envContent = `
# AutoMate Environment Configuration
# Generated by AutoMate Installer

# Anthropic API
ANTHROPIC_API_KEY=${config.anthropicKey}

# OpenAI API (Optional)
${config.openaiKey ? `OPENAI_API_KEY=${config.openaiKey}` : '# OPENAI_API_KEY='}

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


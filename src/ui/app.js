const { ipcRenderer } = require('electron');

// Navigation
function goToScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`${screenId}-screen`).classList.add('active');

  if (screenId === 'system-check') {
    checkSystem();
  }
}

// System Check
async function checkSystem() {
  const statusDiv = document.getElementById('system-status');
  const continueBtn = document.getElementById('continue-from-check');
  
  statusDiv.innerHTML = '<p style="color: #9ca3af;">Checking system requirements...</p>';
  continueBtn.disabled = true;

  try {
    const results = await ipcRenderer.invoke('check-system');
    
    let html = '';
    let allPass = true;

    for (const check of results) {
      const icon = check.passed ? '✅' : '⚠️';
      const color = check.passed ? '#10b981' : '#f59e0b';
      html += `
        <div class="status-item">
          <span class="status-icon">${icon}</span>
          <div style="flex: 1;">
            <div>${check.name}</div>
            <div style="font-size: 12px; color: ${color};">${check.message}</div>
          </div>
        </div>
      `;
      if (!check.passed && check.required) allPass = false;
    }

    statusDiv.innerHTML = html;
    continueBtn.disabled = !allPass;

    if (!allPass) {
      statusDiv.innerHTML += `
        <div style="margin-top: 20px; padding: 16px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.3);">
          <p style="color: #f59e0b; margin-bottom: 8px;">⚠️ Missing Dependencies</p>
          <p style="font-size: 12px; color: #9ca3af;">Some required tools are missing. Click below to install them automatically.</p>
          <button class="btn-primary" style="margin-top: 12px; padding: 8px 16px; font-size: 12px;" onclick="installDependencies()">Install Missing Tools</button>
        </div>
      `;
    }
  } catch (error) {
    statusDiv.innerHTML = `<p style="color: #ef4444;">Error: ${error.message}</p>`;
  }
}

async function installDependencies() {
  const statusDiv = document.getElementById('system-status');
  statusDiv.innerHTML = `
    <div class="status-item">
      <div class="spinner"></div>
      <div>Installing dependencies...</div>
    </div>
  `;

  try {
    await ipcRenderer.invoke('install-dependencies');
    await checkSystem(); // Re-check after installation
  } catch (error) {
    statusDiv.innerHTML = `<p style="color: #ef4444;">Installation failed: ${error.message}</p>`;
  }
}

// API Key Validation
const apiKeys = {
  anthropic: null,
  openai: null
};

async function testKey(provider) {
  const input = document.getElementById(`${provider}-key`);
  const key = input.value.trim();
  
  if (!key) {
    alert('Please enter an API key');
    return;
  }

  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Testing...';

  try {
    const valid = await ipcRenderer.invoke('validate-api-key', provider, key);
    
    if (valid) {
      apiKeys[provider] = key;
      btn.textContent = '✓ Valid';
      btn.style.background = '#10b981';
      btn.style.color = 'white';
      
      // Enable continue button if Anthropic key is valid
      if (provider === 'anthropic') {
        document.getElementById('continue-from-keys').disabled = false;
      }
    } else {
      btn.textContent = '✗ Invalid';
      btn.style.background = '#ef4444';
      btn.style.color = 'white';
      setTimeout(() => {
        btn.textContent = 'Test Key';
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 2000);
    }
  } catch (error) {
    alert(`Error testing key: ${error.message}`);
    btn.disabled = false;
    btn.textContent = 'Test Key';
  }
}

// Check if OpenAI is skipped
function skipOpenAI() {
  apiKeys.openai = 'SKIP';
  
  // Show confirmation
  document.getElementById('openai-skipped').style.display = 'block';
  document.getElementById('skip-openai-btn').textContent = '✓ Skipped';
  document.getElementById('skip-openai-btn').style.background = '#10b981';
  document.getElementById('skip-openai-btn').style.color = 'white';
  document.getElementById('openai-key').disabled = true;
  document.getElementById('openai-key').style.opacity = '0.5';
  
  // Always enable install button (Anthropic is now optional too)
  document.getElementById('continue-from-keys').disabled = false;
}

// Skip Anthropic (allow install without API key)
function skipAnthropic() {
  apiKeys.anthropic = 'SKIP';
  
  // Show warning
  document.getElementById('anthropic-skipped').style.display = 'block';
  document.getElementById('skip-anthropic-btn').textContent = '✓ Skipped';
  document.getElementById('skip-anthropic-btn').style.background = '#fbbf24';
  document.getElementById('skip-anthropic-btn').style.color = 'white';
  document.getElementById('anthropic-key').disabled = true;
  document.getElementById('anthropic-key').style.opacity = '0.5';
  
  // Enable install button
  document.getElementById('continue-from-keys').disabled = false;
}

// Auto-enable continue button on Anthropic key input OR enable by default
document.addEventListener('DOMContentLoaded', () => {
  // Enable install button by default (keys are optional)
  document.getElementById('continue-from-keys').disabled = false;
});

document.getElementById('anthropic-key')?.addEventListener('input', (e) => {
  // Just update the key, button is already enabled
  if (e.target.value.trim()) {
    apiKeys.anthropic = e.target.value.trim();
  }
});

// Installation
async function startInstallation() {
  goToScreen('installation');

  const config = {
    anthropicKey: apiKeys.anthropic,
    openaiKey: apiKeys.openai === 'SKIP' ? null : apiKeys.openai,
    installPath: `${process.env.HOME}/AutoMate`
  };

  // Listen for progress updates
  ipcRenderer.on('installation-progress', (event, progress) => {
    updateProgress(progress);
  });

  try {
    await ipcRenderer.invoke('start-installation', config);
    goToScreen('success');
  } catch (error) {
    alert(`Installation failed: ${error.message}`);
  }
}

function updateProgress(progress) {
  const { percent, step, message, completed } = progress;
  
  document.getElementById('progress').style.width = `${percent}%`;
  document.getElementById('current-step').textContent = message;
  
  const statusDiv = document.getElementById('installation-status');
  
  if (completed && completed.length > 0) {
    let html = '';
    for (const item of completed) {
      html += `
        <div class="status-item">
          <span class="status-icon">✅</span>
          <div>${item}</div>
        </div>
      `;
    }
    statusDiv.innerHTML = html;
  }
}

// Open URL
async function openUrl(url) {
  await ipcRenderer.invoke('open-url', url);
}

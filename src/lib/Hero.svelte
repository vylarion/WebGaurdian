<script>
  import { onMount } from 'svelte';
  import SecurityStatus from './Security.Status.svelte';
  import ThreatsList from './ThreatsList.svelte';
  import Settings from './Settings.svelte';

  let currentUrl = '';
  let securityData = {
    isSecure: true,
    riskScore: 0,
    threats: [],
    trackersBlocked: 0,
    lastScan: null
  };
  let activeTab = 'security'; // security, threats, settings
  let isLoading = true;

  onMount(async () => {
    await loadCurrentTabData();
    await loadSecurityAnalysis();

    // Listen for updates from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'update_tracker_count') {
        securityData.trackersBlocked = message.count;
      }
    });
  });

  async function loadCurrentTabData() {
    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      currentUrl = tab?.url || 'Unknown';
    } catch (error) {
      console.error('Failed to get current tab:', error);
      currentUrl = 'Error loading URL';
    }
  }

  async function loadSecurityAnalysis() {
    isLoading = true;
    try {
      // Request analysis from background script
      const response = await chrome.runtime.sendMessage({ 
        type: 'get_analysis',
        url: currentUrl 
      });
      
      if (response) {
        securityData = {
          isSecure: response.riskScore < 30,
          riskScore: response.riskScore || 0,
          threats: response.threats || [],
          trackersBlocked: response.trackersBlocked || 0,
          lastScan: response.timestamp ? new Date(response.timestamp) : new Date()
        };
      }
    } catch (error) {
      console.error('Failed to load security analysis:', error);
    } finally {
      isLoading = false;
    }
  }

  async function runQuickScan() {
    isLoading = true;
    try {
      await chrome.runtime.sendMessage({ 
        type: 'force_scan',
        url: currentUrl 
      });
      await loadSecurityAnalysis();
    } catch (error) {
      console.error('Failed to run scan:', error);
      isLoading = false;
    }
  }

  function formatUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  function getSecurityColor(riskScore) {
    if (riskScore < 30) return '#22c55e'; // Green
    if (riskScore < 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  }

  function getSecurityStatus(riskScore) {
    if (riskScore < 30) return 'Secure';
    if (riskScore < 60) return 'Caution';
    return 'Dangerous';
  }
</script>

<main class="webguardian-popup">
  <!-- Header -->
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <div class="shield-icon">🛡️</div>
        <h1>WebGuardian</h1>
      </div>
      <div class="url-display">
        <span class="url-text" title={currentUrl}>
          {formatUrl(currentUrl)}
        </span>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <div class="content">
    {#if isLoading}
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Scanning website...</p>
      </div>
    {:else}
      <!-- Navigation Tabs -->
      <nav class="tabs">
        <button 
          class="tab-button" 
          class:active={activeTab === 'security'}
          on:click={() => activeTab = 'security'}
        >
          Security
        </button>
        <button 
          class="tab-button" 
          class:active={activeTab === 'threats'}
          on:click={() => activeTab = 'threats'}
        >
          Threats ({securityData.threats.length})
        </button>
        <button 
          class="tab-button" 
          class:active={activeTab === 'settings'}
          on:click={() => activeTab = 'settings'}
        >
          Settings
        </button>
      </nav>

      <!-- Tab Content -->
      <div class="tab-content">
        {#if activeTab === 'security'}
          <SecurityStatus {securityData} {runQuickScan} />
        {:else if activeTab === 'threats'}
          <ThreatsList threats={securityData.threats} />
        {:else if activeTab === 'settings'}
          <Settings />
        {/if}
      </div>
    {/if}
  </div>

  <!-- Footer -->
  <footer class="footer">
    <div class="status-indicator">
      <div 
        class="status-dot" 
        style="background-color: {getSecurityColor(securityData.riskScore)}"
      ></div>
      <span class="status-text">
        {getSecurityStatus(securityData.riskScore)}
      </span>
    </div>
    {#if securityData.lastScan}
      <div class="last-scan">
        Last scan: {securityData.lastScan.toLocaleTimeString()}
      </div>
    {/if}
  </footer>
</main>

<style>
  .webguardian-popup {
    width: 380px;
    min-height: 500px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #333;
    display: flex;
    flex-direction: column;
  }

  .header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .shield-icon {
    font-size: 24px;
  }

  .logo h1 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .url-display {
    flex: 1;
    margin-left: 16px;
  }

  .url-text {
    font-size: 12px;
    color: #666;
    background: rgba(0, 0, 0, 0.05);
    padding: 4px 8px;
    border-radius: 12px;
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
  }

  .content {
    flex: 1;
    background: white;
    display: flex;
    flex-direction: column;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    gap: 16px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .tab-button {
    flex: 1;
    padding: 12px 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    transition: all 0.2s;
    position: relative;
  }

  .tab-button:hover {
    background: rgba(103, 126, 234, 0.1);
    color: #667eea;
  }

  .tab-button.active {
    color: #667eea;
    background: white;
  }

  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #667eea;
  }

  .tab-content {
    flex: 1;
    padding: 16px;
    min-height: 300px;
  }

  .footer {
    background: rgba(0, 0, 0, 0.02);
    border-top: 1px solid #e5e7eb;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .status-text {
    font-weight: 600;
  }

  .last-scan {
    color: #6b7280;
  }
</style>
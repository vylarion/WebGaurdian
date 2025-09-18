<script lang="ts">
  import { onMount } from 'svelte';
  import SecurityStatus from './Security.Status.svelte';
  import ThreatsList from './ThreatsList.svelte';
  import Settings from './Settings.svelte';
  import type { Threat, SecurityData, ChromeResponse } from './types';

  let currentUrl: string = '';
  let securityData: SecurityData = {
    isSecure: true,
    riskScore: 0,
    threats: [],
    trackersBlocked: 0,
    lastScan: null
  };
  let activeTab: 'security' | 'threats' | 'settings' = 'security';
  let isLoading: boolean = true;
  let extensionError: boolean = false;

  onMount(async (): Promise<void> => {
    // Check if we're in extension context
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      await loadCurrentTabData();
      await loadSecurityAnalysis();
    } else {
      // Fallback for development/testing
      extensionError = true;
      currentUrl = 'example.com';
      securityData = {
        isSecure: true,
        riskScore: 25,
        threats: [
          {
            type: 'tracker',
            severity: 'medium',
            description: 'Sample tracker detected for demo purposes'
          }
        ],
        trackersBlocked: 5,
        lastScan: new Date()
      };
      isLoading = false;
    }
  });

  async function loadCurrentTabData(): Promise<void> {
    try {
      if (chrome?.tabs?.query) {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        currentUrl = tab?.url || 'Unknown';
      }
    } catch (error) {
      console.error('Failed to get current tab:', error);
      currentUrl = 'Error loading URL';
    }
  }

  async function loadSecurityAnalysis(): Promise<void> {
    isLoading = true;
    try {
      if (chrome?.runtime?.sendMessage) {
        const response: ChromeResponse = await chrome.runtime.sendMessage({ 
          type: 'get_analysis',
          url: currentUrl 
        });
        
        if (response) {
          securityData = {
            isSecure: (response.riskScore || 0) < 30,
            riskScore: response.riskScore || 0,
            threats: response.threats || [],
            trackersBlocked: response.trackersBlocked || 0,
            lastScan: response.timestamp ? new Date(response.timestamp) : new Date()
          };
        }
      }
    } catch (error) {
      console.error('Failed to load security analysis:', error);
    } finally {
      isLoading = false;
    }
  }

  async function runQuickScan(): Promise<void> {
    isLoading = true;
    try {
      if (chrome?.runtime?.sendMessage) {
        await chrome.runtime.sendMessage({ 
          type: 'force_scan',
          url: currentUrl 
        });
        await loadSecurityAnalysis();
      } else {
        // Demo scan for development
        setTimeout(() => {
          securityData.riskScore = Math.floor(Math.random() * 100);
          securityData.lastScan = new Date();
          isLoading = false;
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to run scan:', error);
      isLoading = false;
    }
  }

  function formatUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  function getSecurityColor(riskScore: number): string {
    if (riskScore < 30) return '#22c55e'; // Green
    if (riskScore < 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  }

  function getSecurityStatus(riskScore: number): string {
    if (riskScore < 30) return 'Secure';
    if (riskScore < 60) return 'Caution';
    return 'Dangerous';
  }

  function setActiveTab(tab: 'security' | 'threats' | 'settings'): void {
    activeTab = tab;
  }
</script>

<main class="webguardian-popup">
  <!-- Development Warning -->
  {#if extensionError}
    <div class="dev-warning">
      <p>⚠️ Development Mode - Chrome Extension APIs not available</p>
    </div>
  {/if}

  <!-- Header -->
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <div class="shield-icon">🛡️</div>
        <h1>WebGuardian</h1>
      </div>
      <div class="url-display">
        <span class="url-label">Current site:</span>
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
          on:click={() => setActiveTab('security')}
        >
          Security
        </button>
        <button 
          class="tab-button" 
          class:active={activeTab === 'threats'}
          on:click={() => setActiveTab('threats')}
        >
          Threats ({securityData.threats.length})
        </button>
        <button 
          class="tab-button" 
          class:active={activeTab === 'settings'}
          on:click={() => setActiveTab('settings')}
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
    background: #0a0a0a;
    color: #f8fafc;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  }

  .dev-warning {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: #ffffff;
    padding: 10px;
    text-align: center;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.025em;
  }

  .header {
    background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
    backdrop-filter: blur(20px);
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .shield-icon {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  }

  h1 {
    font-size: 18px;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: -0.025em;
  }

  .url-display {
    background: rgba(255, 255, 255, 0.05);
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 11px;
    color: #cbd5e1;
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    backdrop-filter: blur(10px);
    font-weight: 500;
  }

  .content {
    flex: 1;
    background: #0f0f0f;
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
    border: 3px solid #333333;
    border-top: 3px solid #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .tabs {
    display: flex;
    gap: 4px;
    margin: 0 20px 20px 20px;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    padding: 4px;
    border-radius: 12px;
  }

  .tab-button {
    flex: 1;
    padding: 12px 16px;
    background: none;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  .tab-button:hover {
    color: #f1f5f9;
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-1px);
  }

  .tab-button.active {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: #ffffff;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  .tab-content {
    flex: 1;
    padding: 20px;
    min-height: 300px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%);
  }

  .footer {
    background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: #a1a1aa;
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
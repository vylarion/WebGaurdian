<script lang="ts">
  import { onMount } from 'svelte';
  import type { Settings, Stats, ChromeStorageResult } from './types';

  let settings: Settings = {
    realTimeProtection: true,
    blockMaliciousSites: true,
    blockPhishing: true,
    blockTrackers: true,
    blockCryptominers: true,
    showWarnings: true,
    autoScan: true,
    notificationLevel: 'medium',
    scanFrequency: 'realtime',
    whitelistMode: false
  };

  let stats: Stats = {
    sitesScanned: 1247,
    threatsBlocked: 23,
    trackersBlocked: 1456,
    malwareDetected: 5,
    phishingBlocked: 12
  };

  let isExtension: boolean = false;
  let saveStatus: string = '';

  onMount(async (): Promise<void> => {
    console.log('Settings component mounted');
    
    // Check if we're in extension context
    isExtension = typeof chrome !== 'undefined' && !!chrome.storage;
    console.log('Is extension context:', isExtension);
    
    if (isExtension) {
      await loadSettings();
      await loadStats();
    }
  });

  async function loadSettings(): Promise<void> {
    try {
      console.log('Loading settings...');
      if (chrome?.storage?.sync) {
        const result: ChromeStorageResult = await chrome.storage.sync.get('webguardian_settings');
        console.log('Loaded settings:', result);
        if (result.webguardian_settings) {
          settings = { ...settings, ...result.webguardian_settings };
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async function loadStats(): Promise<void> {
    try {
      console.log('Loading stats...');
      if (chrome?.storage?.local) {
        const result: ChromeStorageResult = await chrome.storage.local.get('webguardian_stats');
        console.log('Loaded stats:', result);
        if (result.webguardian_stats) {
          stats = { ...stats, ...result.webguardian_stats };
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  async function saveSettings(): Promise<void> {
    console.log('Saving settings...', settings);
    saveStatus = 'Saving...';
    
    try {
      if (chrome?.storage?.sync) {
        await chrome.storage.sync.set({ webguardian_settings: settings });
        console.log('Settings saved successfully');
        
        // Notify background script
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({
            type: 'settings_updated',
            settings: settings
          }).catch((err) => console.log('Background script not ready:', err));
        }
        
        saveStatus = 'Saved!';
        setTimeout(() => saveStatus = '', 2000);
      } else {
        console.log('Chrome storage not available - settings not saved');
        saveStatus = 'Not saved (dev mode)';
        setTimeout(() => saveStatus = '', 2000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      saveStatus = 'Error saving';
      setTimeout(() => saveStatus = '', 2000);
    }
  }

  async function resetSettings(): Promise<void> {
    if (confirm('Reset all settings to default?')) {
      console.log('Resetting settings to default');
      settings = {
        realTimeProtection: true,
        blockMaliciousSites: true,
        blockPhishing: true,
        blockTrackers: true,
        blockCryptominers: true,
        showWarnings: true,
        autoScan: true,
        notificationLevel: 'medium',
        scanFrequency: 'realtime',
        whitelistMode: false
      };
      await saveSettings();
    }
  }

  async function clearData(): Promise<void> {
    if (confirm('Clear all data and statistics?')) {
      try {
        console.log('Clearing all data');
        if (chrome?.storage?.local) {
          await chrome.storage.local.clear();
        }
        stats = {
          sitesScanned: 0,
          threatsBlocked: 0,
          trackersBlocked: 0,
          malwareDetected: 0,
          phishingBlocked: 0
        };
        console.log('Data cleared successfully');
      } catch (error) {
        console.error('Failed to clear data:', error);
      }
    }
  }

  // Simplified event handlers that don't rely on complex DOM manipulation
  function handleToggle(settingName: keyof Settings): void {
    console.log(`Toggling ${settingName} from ${settings[settingName]} to ${!settings[settingName]}`);
    settings = {
      ...settings,
      [settingName]: !settings[settingName]
    };
    saveSettings();
  }

  function handleSelectChange(settingName: keyof Settings, value: string): void {
    console.log(`Changing ${settingName} to ${value}`);
    settings = {
      ...settings,
      [settingName]: value
    };
    saveSettings();
  }
</script>

<div class="settings-container">
  {#if !isExtension}
    <div class="dev-notice">
      <p>🔧 Development Mode - Settings will not persist</p>
    </div>
  {/if}

  {#if saveStatus}
    <div class="save-status" class:success={saveStatus === 'Saved!'} class:error={saveStatus.includes('Error')}>
      {saveStatus}
    </div>
  {/if}

  <!-- Protection Settings -->
  <div class="settings-section">
    <h3 class="section-title">🛡️ Protection Settings</h3>
    
    <div class="setting-group">
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-title">Real-time Protection</div>
          <div class="setting-description">Monitor websites in real-time</div>
        </div>
        <button 
          class="toggle-button" 
          class:active={settings.realTimeProtection}
          on:click={() => handleToggle('realTimeProtection')}
        >
          {settings.realTimeProtection ? 'ON' : 'OFF'}
        </button>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-title">Block Malicious Sites</div>
          <div class="setting-description">Block known dangerous websites</div>
        </div>
        <button 
          class="toggle-button" 
          class:active={settings.blockMaliciousSites}
          on:click={() => handleToggle('blockMaliciousSites')}
        >
          {settings.blockMaliciousSites ? 'ON' : 'OFF'}
        </button>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-title">Phishing Protection</div>
          <div class="setting-description">Detect phishing attempts</div>
        </div>
        <button 
          class="toggle-button" 
          class:active={settings.blockPhishing}
          on:click={() => handleToggle('blockPhishing')}
        >
          {settings.blockPhishing ? 'ON' : 'OFF'}
        </button>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-title">Block Trackers</div>
          <div class="setting-description">Block privacy trackers</div>
        </div>
        <button 
          class="toggle-button" 
          class:active={settings.blockTrackers}
          on:click={() => handleToggle('blockTrackers')}
        >
          {settings.blockTrackers ? 'ON' : 'OFF'}
        </button>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-title">Block Cryptominers</div>
          <div class="setting-description">Prevent unauthorized crypto mining</div>
        </div>
        <button 
          class="toggle-button" 
          class:active={settings.blockCryptominers}
          on:click={() => handleToggle('blockCryptominers')}
        >
          {settings.blockCryptominers ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  </div>

  <!-- Notification Settings -->
  <div class="settings-section">
    <h3 class="section-title">🔔 Notification Settings</h3>
    
    <div class="setting-group">
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-title">Show Security Warnings</div>
          <div class="setting-description">Display popup warnings for threats</div>
        </div>
        <button 
          class="toggle-button" 
          class:active={settings.showWarnings}
          on:click={() => handleToggle('showWarnings')}
        >
          {settings.showWarnings ? 'ON' : 'OFF'}
        </button>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-title">Notification Level</div>
          <div class="setting-description">Choose notification frequency</div>
        </div>
        <div class="select-group">
          {#each ['low', 'medium', 'high'] as level}
            <button 
              class="select-button" 
              class:active={settings.notificationLevel === level}
              on:click={() => handleSelectChange('notificationLevel', level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          {/each}
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-title">Scan Frequency</div>
          <div class="setting-description">How often to scan websites</div>
        </div>
        <div class="select-group">
          {#each [['realtime', 'Real-time'], ['periodic', 'Periodic'], ['manual', 'Manual']] as [value, label]}
            <button 
              class="select-button" 
              class:active={settings.scanFrequency === value}
              on:click={() => handleSelectChange('scanFrequency', value)}
            >
              {label}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Statistics -->
  <div class="settings-section">
    <h3 class="section-title">📊 Protection Statistics</h3>
    
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-number">{stats.sitesScanned.toLocaleString()}</div>
        <div class="stat-label">Sites Scanned</div>
      </div>
      
      <div class="stat-box">
        <div class="stat-number">{stats.threatsBlocked}</div>
        <div class="stat-label">Threats Blocked</div>
      </div>
      
      <div class="stat-box">
        <div class="stat-number">{stats.trackersBlocked.toLocaleString()}</div>
        <div class="stat-label">Trackers Blocked</div>
      </div>
      
      <div class="stat-box">
        <div class="stat-number">{stats.malwareDetected}</div>
        <div class="stat-label">Malware Detected</div>
      </div>
    </div>
  </div>

  <!-- Actions -->
  <div class="settings-section">
    <h3 class="section-title">⚙️ Actions</h3>
    
    <div class="action-buttons">
      <button class="action-button reset-button" on:click={resetSettings}>
        🔄 Reset Settings
      </button>
      
      <button class="action-button clear-button" on:click={clearData}>
        🗑️ Clear Data
      </button>
    </div>
  </div>
</div>

<style>
  .settings-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    overflow-y: auto;
    padding: 0 8px 16px 0;
    overscroll-behavior: contain;
  }

  .dev-notice {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 10px 16px;
    margin: 16px;
    font-size: 12px;
    color: #94a3b8;
    backdrop-filter: blur(10px);
  }

  .save-status {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 10px 16px;
    margin: 16px;
    font-size: 12px;
    text-align: center;
    color: #94a3b8;
    backdrop-filter: blur(10px);
  }

  .save-status.success {
    background: rgba(22, 101, 52, 0.2);
    color: #4ade80;
    border-color: rgba(74, 222, 128, 0.3);
  }

  .save-status.error {
    background: rgba(153, 27, 27, 0.2);
    color: #f87171;
    border-color: rgba(248, 113, 113, 0.3);
  }

  .settings-section {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
  }

  .section-title {
    margin: 0;
    padding: 12px 16px;
    background: #1a1a1a;
    border-bottom: 1px solid #333333;
    font-size: 14px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .setting-group {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 0;
  }

  .setting-info {
    flex: 1;
  }

  .setting-title {
    font-size: 13px;
    font-weight: 500;
    color: #e2e8f0;
    margin-bottom: 2px;
  }

  .setting-description {
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.3;
  }

  .toggle-button {
    background: #262626;
    color: #94a3b8;
    border: 1px solid #333333;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 50px;
  }

  .toggle-button.active {
    background: #4f46e5;
    color: white;
    border-color: #4f46e5;
  }

  .toggle-button:hover {
    background: #333333;
  }

  .toggle-button.active:hover {
    background: #4338ca;
  }

  .select-group {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .select-button {
    background: #262626;
    color: #94a3b8;
    border: 1px solid #333333;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .select-button.active {
    background: #4f46e5;
    color: white;
    border-color: #4f46e5;
  }

  .select-button:hover {
    background: #333333;
  }

  .select-button.active:hover {
    background: #4338ca;
  }

  .stats-grid {
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    width: 100%;
    box-sizing: border-box;
  }

  .stat-box {
    text-align: center;
    padding: 12px;
    background: #f8fafc;
    border-radius: 6px;
  }

  .stat-number {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
    line-height: 1;
  }

  .stat-label {
    font-size: 10px;
    color: #6b7280;
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 0.025em;
    margin-top: 4px;
  }

  .action-buttons {
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .action-button {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
    background: white;
    text-align: center;
  }

  .action-button:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .reset-button {
    border-color: #f59e0b;
    color: #f59e0b;
  }

  .clear-button {
    border-color: #ef4444;
    color: #ef4444;
  }

  /* Scrollbar styling */
  .settings-container::-webkit-scrollbar {
    width: 8px;
  }

  .settings-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .settings-container::-webkit-scrollbar-thumb {
    background: #333333;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  .settings-container::-webkit-scrollbar-thumb:hover {
    background: #4f46e5;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  
  /* Ensure proper spacing between sections */
  .settings-section:not(:last-child) {
    margin-bottom: 8px;
  }
</style>
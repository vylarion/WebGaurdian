<script>
  export let securityData;
  export let runQuickScan;

  let isScanning = false;

  async function handleScan() {
    isScanning = true;
    await runQuickScan();
    isScanning = false;
  }

  function getSecurityGrade(riskScore) {
    if (riskScore < 20) return 'A+';
    if (riskScore < 30) return 'A';
    if (riskScore < 40) return 'B';
    if (riskScore < 60) return 'C';
    if (riskScore < 80) return 'D';
    return 'F';
  }

  function getGradeColor(grade) {
    switch(grade) {
      case 'A+':
      case 'A': return '#22c55e';
      case 'B': return '#84cc16';
      case 'C': return '#f59e0b';
      case 'D': return '#f97316';
      case 'F': return '#ef4444';
      default: return '#6b7280';
    }
  }
</script>

<div class="security-status">
  <!-- Main Security Score -->
  <div class="security-score-card">
    <div class="score-container">
      <div 
        class="score-circle" 
        style="--score: {100 - securityData.riskScore}; --color: {getGradeColor(getSecurityGrade(securityData.riskScore))}"
      >
        <div class="score-inner">
          <div class="grade">{getSecurityGrade(securityData.riskScore)}</div>
          <div class="score-text">{100 - securityData.riskScore}/100</div>
        </div>
      </div>
      
      <div class="score-info">
        <h3 class="security-title">
          {#if securityData.isSecure}
            ✅ Site is Secure
          {:else}
            ⚠️ Security Issues Found
          {/if}
        </h3>
        <p class="risk-description">
          {#if securityData.riskScore < 30}
            This website appears safe to browse with no major security concerns detected.
          {:else if securityData.riskScore < 60}
            Some potential security issues detected. Browse with caution.
          {:else}
            Multiple security threats detected. Consider avoiding this website.
          {/if}
        </p>
      </div>
    </div>
  </div>

  <!-- Quick Stats -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">🛡️</div>
      <div class="stat-content">
        <div class="stat-number">{securityData.threats.length}</div>
        <div class="stat-label">Threats Found</div>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">🚫</div>
      <div class="stat-content">
        <div class="stat-number">{securityData.trackersBlocked}</div>
        <div class="stat-label">Trackers Blocked</div>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">🔒</div>
      <div class="stat-content">
        <div class="stat-number">{location.protocol === 'https:' ? 'Yes' : 'No'}</div>
        <div class="stat-label">HTTPS Enabled</div>
      </div>
    </div>
  </div>

  <!-- Security Features -->
  <div class="security-features">
    <h4>Security Analysis</h4>
    
    <div class="feature-list">
      <div class="feature-item">
        <div class="feature-icon" class:active={securityData.riskScore < 30}>🔍</div>
        <div class="feature-text">
          <div class="feature-title">Malware Scan</div>
          <div class="feature-status">
            {securityData.riskScore < 30 ? 'Clean' : 'Issues Detected'}
          </div>
        </div>
      </div>
      
      <div class="feature-item">
        <div class="feature-icon" class:active={securityData.threats.length === 0}>🎣</div>
        <div class="feature-text">
          <div class="feature-title">Phishing Protection</div>
          <div class="feature-status">
            {securityData.threats.some(t => t.type === 'phishing') ? 'Phishing Detected' : 'Protected'}
          </div>
        </div>
      </div>
      
      <div class="feature-item">
        <div class="feature-icon" class:active={securityData.trackersBlocked === 0}>👁️</div>
        <div class="feature-text">
          <div class="feature-title">Privacy Trackers</div>
          <div class="feature-status">
            {securityData.trackersBlocked > 0 ? `${securityData.trackersBlocked} Blocked` : 'None Detected'}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Action Button -->
  <div class="action-section">
    <button 
      class="scan-button" 
      class:scanning={isScanning}
      on:click={handleScan}
      disabled={isScanning}
    >
      {#if isScanning}
        <div class="button-spinner"></div>
        Scanning...
      {:else}
        🔄 Run Quick Scan
      {/if}
    </button>
  </div>
</div>

<style>
  .security-status {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .security-score-card {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e2e8f0;
  }

  .score-container {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .score-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: conic-gradient(
      var(--color) calc(var(--score) * 3.6deg), 
      #e5e7eb calc(var(--score) * 3.6deg)
    );
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .score-inner {
    width: 60px;
    height: 60px;
    background: white;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .grade {
    font-size: 18px;
    font-weight: 700;
    color: var(--color);
    line-height: 1;
  }

  .score-text {
    font-size: 10px;
    color: #6b7280;
    font-weight: 500;
  }

  .score-info {
    flex: 1;
  }

  .security-title {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .risk-description {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .stat-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    font-size: 16px;
  }

  .stat-content {
    text-align: center;
  }

  .stat-number {
    font-size: 16px;
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
  }

  .security-features {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
  }

  .security-features h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
  }

  .feature-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .feature-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    font-size: 14px;
    transition: all 0.2s;
  }

  .feature-icon.active {
    background: #dcfce7;
  }

  .feature-text {
    flex: 1;
  }

  .feature-title {
    font-size: 13px;
    font-weight: 500;
    color: #1f2937;
    line-height: 1;
    margin-bottom: 2px;
  }

  .feature-status {
    font-size: 11px;
    color: #6b7280;
  }

  .action-section {
    display: flex;
    justify-content: center;
  }

  .scan-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    min-width: 140px;
    justify-content: center;
  }

  .scan-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .scan-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .scan-button.scanning {
    background: #6b7280;
  }

  .button-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
<script lang="ts">
  import type { Threat } from './types';

  export let threats: Threat[] = [];

  function getThreatIcon(type: string): string {
    const icons: Record<string, string> = {
      malicious_domain: '🚫',
      phishing: '🎣',
      tracker: '👁️',
      malware: '🦠',
      suspicious_script: '⚠️',
      cryptomining: '⛏️',
      clickjacking: '🖱️',
      ai_detection: '🤖',
      default: '⚠️'
    };
    return icons[type] || icons.default;
  }

  function getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    };
    return colors[severity] || colors.medium;
  }

  function getSeverityBadge(severity: string): string {
    const badges: Record<string, string> = {
      low: 'Low Risk',
      medium: 'Medium Risk', 
      high: 'High Risk',
      critical: 'Critical'
    };
    return badges[severity] || 'Unknown';
  }

  function formatThreatType(type: string): string {
    return type
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function getRecommendation(threat: Threat): string {
    const recommendations: Record<string, string> = {
      malicious_domain: "Leave this website immediately and avoid sharing personal information.",
      phishing: "Do not enter any passwords or personal details. This appears to be a phishing attempt.",
      tracker: "Your browsing activity may be monitored. Consider using privacy mode.",
      malware: "This site may contain harmful software. Scan your device for infections.",
      suspicious_script: "Potentially malicious code detected. Avoid downloads from this site.",
      cryptomining: "This website may be using your device to mine cryptocurrency without permission.",
      clickjacking: "This page may be trying to trick you into clicking hidden elements.",
      ai_detection: "Our AI system has flagged this content as potentially suspicious."
    };
    return recommendations[threat.type] || "Exercise caution when browsing this website.";
  }

  function toggleDetails(threat: Threat): void {
    threat.showDetails = !threat.showDetails;
    threats = threats; // Trigger reactivity
  }
</script>

<div class="threats-list">
  {#if threats.length === 0}
    <div class="no-threats">
      <div class="success-icon">✅</div>
      <h3>No Threats Detected</h3>
      <p>This website appears to be safe. No security threats were found during our analysis.</p>
      <div class="safety-tips">
        <h4>Stay Safe Online:</h4>
        <ul>
          <li>Always verify website URLs before entering personal information</li>
          <li>Look for HTTPS encryption (🔒) in your address bar</li>
          <li>Be cautious of urgent requests for personal information</li>
          <li>Keep your browser and extensions up to date</li>
        </ul>
      </div>
    </div>
  {:else}
    <div class="threats-header">
      <h3>🚨 {threats.length} Security {threats.length === 1 ? 'Threat' : 'Threats'} Detected</h3>
      <p>We found the following security issues on this website:</p>
    </div>

    <div class="threats-container">
      {#each threats as threat, index}
        <div class="threat-card" class:high-risk={threat.severity === 'high' || threat.severity === 'critical'}>
          <div class="threat-header">
            <div class="threat-icon">
              {getThreatIcon(threat.type)}
            </div>
            <div class="threat-title">
              <h4>{formatThreatType(threat.type)}</h4>
              <div 
                class="severity-badge" 
                style="background-color: {getSeverityColor(threat.severity)}20; color: {getSeverityColor(threat.severity)}"
              >
                {getSeverityBadge(threat.severity)}
              </div>
            </div>
          </div>

          <div class="threat-description">
            <p>{threat.description}</p>
          </div>

          <div class="threat-recommendation">
            <div class="recommendation-header">
              <strong>💡 Recommendation:</strong>
            </div>
            <p>{getRecommendation(threat)}</p>
          </div>

          {#if threat.details}
            <div class="threat-details">
              <button 
                class="details-toggle"
                on:click={() => toggleDetails(threat)}
              >
                {threat.showDetails ? 'Hide' : 'Show'} Technical Details
                <span class="toggle-icon" class:rotated={threat.showDetails}>▼</span>
              </button>
              
              {#if threat.showDetails}
                <div class="details-content">
                  <pre>{JSON.stringify(threat.details, null, 2)}</pre>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <div class="threats-footer">
      <div class="action-buttons">
        <button class="report-button" on:click={() => alert('Report feature coming soon!')}>
          📋 Report False Positive
        </button>
        <button class="learn-more-button" on:click={() => alert('Learn more feature coming soon!')}>
          📖 Learn More About These Threats
        </button>
      </div>
      
      <div class="protection-tip">
        <div class="tip-icon">💡</div>
        <div class="tip-content">
          <strong>Tip:</strong> Consider leaving this website if critical or high-risk threats are detected.
          Your safety is our priority.
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .threats-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .no-threats {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 24px 16px;
    background: #121212;
    border-radius: 8px;
    border: 1px solid #333333;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .success-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .no-threats h3 {
    margin: 0 0 8px 0;
    color: #166534;
    font-size: 18px;
  }

  .no-threats p {
    margin: 0 0 20px 0;
    color: #166534;
    opacity: 0.8;
    font-size: 14px;
  }

  .safety-tips {
    background: #0f0f0f;
    padding: 16px;
    border-radius: 8px;
    text-align: left;
    border: 1px solid #333333;
  }

  .safety-tips h4 {
    margin: 0 0 12px 0;
    color: #10b981;
    font-size: 14px;
  }

  .safety-tips ul {
    margin: 0;
    padding-left: 16px;
    color: #94a3b8;
  }

  .safety-tips li {
    font-size: 12px;
    margin-bottom: 4px;
    opacity: 0.9;
  }

  .threats-header {
    text-align: center;
    padding: 16px;
    background: #1a1a1a;
    border-radius: 8px;
    border: 1px solid #333333;
  }

  .threats-header h3 {
    margin: 0 0 8px 0;
    color: #ef4444;
    font-size: 16px;
  }

  .threats-header p {
    margin: 0;
    color: #94a3b8;
    font-size: 13px;
    opacity: 0.8;
  }

  .threats-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 300px;
    overflow-y: auto;
  }

  .threat-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
    border-radius: 12px;
    margin-bottom: 16px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-left: 3px solid #f59e0b;
    padding: 20px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }

  .threat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .threat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .threat-card:hover::before {
    opacity: 1;
  }

  .threat-card.high-risk {
    border-left-color: #ef4444;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  }

  .threat-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .threat-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    backdrop-filter: blur(10px);
  }

  .threat-title {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .threat-title h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .severity-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .threat-description {
    margin-bottom: 12px;
  }

  .threat-description p {
    margin: 0;
    font-size: 13px;
    color: #4b5563;
    line-height: 1.5;
  }

  .threat-recommendation {
    background: #f8fafc;
    padding: 12px;
    border-radius: 6px;
    border-left: 3px solid #3b82f6;
    margin-bottom: 12px;
  }

  .recommendation-header {
    margin-bottom: 4px;
    font-size: 12px;
    color: #1e40af;
  }

  .threat-recommendation p {
    margin: 0;
    font-size: 12px;
    color: #1e40af;
    line-height: 1.4;
  }

  .threat-details {
    border-top: 1px solid #e5e7eb;
    padding-top: 12px;
  }

  .details-toggle {
    background: none;
    border: none;
    color: #6366f1;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0;
    font-weight: 500;
  }

  .details-toggle:hover {
    text-decoration: underline;
  }

  .toggle-icon {
    transition: transform 0.2s;
  }

  .toggle-icon.rotated {
    transform: rotate(180deg);
  }

  .details-content {
    margin-top: 8px;
    background: #1f2937;
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
  }

  .details-content pre {
    margin: 0;
    font-size: 10px;
    color: #e5e7eb;
    font-family: 'Courier New', monospace;
  }

  .threats-footer {
    border-top: 1px solid #e5e7eb;
    padding-top: 16px;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .report-button,
  .learn-more-button {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 6px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .report-button:hover,
  .learn-more-button:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .protection-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fffbeb;
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #fed7aa;
  }

  .tip-icon {
    font-size: 16px;
  }

  .tip-content {
    flex: 1;
    font-size: 11px;
    color: #92400e;
  }

  .tip-content strong {
    color: #78350f;
  }
</style>
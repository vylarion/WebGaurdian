// Shared type definitions for WebGuardian extension

export interface Threat {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details?: any;
  showDetails?: boolean;
}

export interface SecurityData {
  isSecure: boolean;
  riskScore: number;
  threats: Threat[];
  trackersBlocked: number;
  lastScan: Date | null;
}

export interface Settings {
  realTimeProtection: boolean;
  blockMaliciousSites: boolean;
  blockPhishing: boolean;
  blockTrackers: boolean;
  blockCryptominers: boolean;
  showWarnings: boolean;
  autoScan: boolean;
  notificationLevel: 'low' | 'medium' | 'high';
  scanFrequency: 'realtime' | 'periodic' | 'manual';
  whitelistMode: boolean;
}

export interface Stats {
  sitesScanned: number;
  threatsBlocked: number;
  trackersBlocked: number;
  malwareDetected: number;
  phishingBlocked: number;
}

export interface ChromeResponse {
  riskScore?: number;
  threats?: Threat[];
  trackersBlocked?: number;
  timestamp?: number;
}

export interface ChromeStorageResult {
  webguardian_settings?: Settings;
  webguardian_stats?: Stats;
}
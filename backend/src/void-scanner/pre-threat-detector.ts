import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import { performance } from 'perf_hooks';

// Types for network monitoring
export interface NetworkPacket {
  timestamp: number;
  sourceIP: string;
  destIP: string;
  sourcePort: number;
  destPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  size: number;
  flags?: string[];
}

export interface ThreatSignature {
  id: string;
  type: 'VOID_SILENCE' | 'DGA_DOMAIN' | 'PORT_SCAN';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  metadata: Record<string, any>;
  timestamp: number;
}

export interface SilenceWindow {
  startTime: number;
  endTime: number;
  expectedTraffic: number;
  actualTraffic: number;
  suspiciousSilence: boolean;
}

export interface PortScanPattern {
  sourceIP: string;
  targetPorts: Set<number>;
  timeWindow: number;
  scanType: 'HORIZONTAL' | 'VERTICAL' | 'STEALTH';
  intensity: number;
}

/**
 * VoidScanner - Advanced Pre-Threat Detection System
 * 
 * Implements sophisticated algorithms for detecting pre-attack indicators:
 * - Network silence analysis using statistical anomaly detection
 * - DGA (Domain Generation Algorithm) detection via entropy analysis
 * - Port scan pattern recognition with behavioral analysis
 */
export class VoidScanner extends EventEmitter {
  private readonly config = {
    silenceThreshold: 0.3, // 30% deviation from baseline
    entropyThreshold: 4.2, // Shannon entropy threshold for DGA
    portScanThreshold: 10, // Minimum ports to trigger scan detection
    timeWindow: 60000, // 1 minute time windows
    maxDomainLength: 253, // RFC max domain length
    minDomainEntropy: 3.5, // Minimum entropy for suspicious domains
    baselineWindow: 300000, // 5 minutes for baseline calculation
  };

  private networkBaseline: Map<string, number> = new Map();
  private silenceWindows: SilenceWindow[] = [];
  private portScanTracker: Map<string, PortScanPattern> = new Map();
  private domainCache: Map<string, number> = new Map();
  private isActive: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(private logger = console) {
    super();
    this.setupEventHandlers();
  }

  /**
   * Initialize the VoidScanner with baseline traffic analysis
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info('VoidScanner: Initializing pre-threat detection system');
      
      // Calculate initial network baseline
      await this.establishNetworkBaseline();
      
      // Start continuous monitoring
      this.startContinuousMonitoring();
      
      this.isActive = true;
      this.emit('initialized');
      
      this.logger.info('VoidScanner: Successfully initialized');
    } catch (error) {
      this.logger.error('VoidScanner: Initialization failed', error);
      throw new Error(`VoidScanner initialization failed: ${error}`);
    }
  }

  /**
   * Analyze network packet for threat indicators
   */
  public async analyzePacket(packet: NetworkPacket): Promise<ThreatSignature[]> {
    if (!this.isActive) {
      throw new Error('VoidScanner not initialized');
    }

    const threats: ThreatSignature[] = [];

    try {
      // Network silence analysis
      const silenceThreat = await this.detectNetworkSilence(packet);
      if (silenceThreat) threats.push(silenceThreat);

      // Port scan detection
      const portScanThreat = await this.detectPortScan(packet);
      if (portScanThreat) threats.push(portScanThreat);

      // Update tracking data
      this.updateNetworkMetrics(packet);

    } catch (error) {
      this.logger.error('VoidScanner: Packet analysis failed', error);
    }

    return threats;
  }

  /**
   * Analyze domain for DGA characteristics using entropy calculation
   */
  public async analyzeDomain(domain: string): Promise<ThreatSignature | null> {
    try {
      if (!domain || domain.length > this.config.maxDomainLength) {
        return null;
      }

      // Check cache first
      const cachedEntropy = this.domainCache.get(domain);
      if (cachedEntropy !== undefined) {
        return cachedEntropy > this.config.entropyThreshold ? 
          this.createDGAThreat(domain, cachedEntropy) : null;
      }

      // Calculate Shannon entropy
      const entropy = this.calculateShannonEntropy(domain);
      this.domainCache.set(domain, entropy);

      // Analyze domain characteristics
      const dgaScore = await this.analyzeDGACharacteristics(domain, entropy);

      if (dgaScore.isDGA) {
        return this.createDGAThreat(domain, entropy, dgaScore);
      }

      return null;
    } catch (error) {
      this.logger.error('VoidScanner: Domain analysis failed', error);
      return null;
    }
  }

  /**
   * Calculate Shannon entropy for domain analysis
   */
  private calculateShannonEntropy(domain: string): number {
    const cleanDomain = domain.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanDomain.length === 0) return 0;

    const frequency: Map<string, number> = new Map();
    
    // Count character frequencies
    for (const char of cleanDomain) {
      frequency.set(char, (frequency.get(char) || 0) + 1);
    }

    // Calculate Shannon entropy: H(X) = -Σ P(xi) * log2(P(xi))
    let entropy = 0;
    const length = cleanDomain.length;
    
    for (const count of frequency.values()) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }

    return entropy;
  }

  /**
   * Analyze domain for DGA characteristics
   */
  private async analyzeDGACharacteristics(domain: string, entropy: number): Promise<{
    isDGA: boolean;
    confidence: number;
    characteristics: string[];
  }> {
    const characteristics: string[] = [];
    let suspiciousScore = 0;

    // High entropy check
    if (entropy > this.config.entropyThreshold) {
      characteristics.push('HIGH_ENTROPY');
      suspiciousScore += 0.4;
    }

    // Length analysis
    const domainParts = domain.split('.');
    const subdomain = domainParts[0];
    
    if (subdomain.length > 12) {
      characteristics.push('LONG_SUBDOMAIN');
      suspiciousScore += 0.2;
    }

    // Character distribution analysis
    const vowelRatio = this.calculateVowelRatio(subdomain);
    if (vowelRatio < 0.2 || vowelRatio > 0.6) {
      characteristics.push('UNUSUAL_VOWEL_RATIO');
      suspiciousScore += 0.2;
    }

    // Digit ratio analysis
    const digitRatio = this.calculateDigitRatio(subdomain);
    if (digitRatio > 0.3) {
      characteristics.push('HIGH_DIGIT_RATIO');
      suspiciousScore += 0.25;
    }

    // Sequential character analysis
    if (this.hasSequentialPatterns(subdomain)) {
      characteristics.push('SEQUENTIAL_PATTERNS');
      suspiciousScore += 0.15;
    }

    // N-gram analysis for randomness
    const ngramScore = this.analyzeNgrams(subdomain);
    if (ngramScore > 0.7) {
      characteristics.push('RANDOM_NGRAMS');
      suspiciousScore += 0.2;
    }

    return {
      isDGA: suspiciousScore > 0.6,
      confidence: Math.min(suspiciousScore, 1.0),
      characteristics
    };
  }

  /**
   * Detect network silence anomalies
   */
  private async detectNetworkSilence(packet: NetworkPacket): Promise<ThreatSignature | null> {
    const networkKey = `${packet.sourceIP}-${packet.destIP}`;
    const currentTime = packet.timestamp;
    
    // Find current time window
    const windowStart = Math.floor(currentTime / this.config.timeWindow) * this.config.timeWindow;
    const windowEnd = windowStart + this.config.timeWindow;

    // Get baseline traffic for this network pair
    const baseline = this.networkBaseline.get(networkKey) || 0;
    if (baseline === 0) return null; // No baseline yet

    // Count current window traffic
    const currentTraffic = this.countTrafficInWindow(networkKey, windowStart, windowEnd);
    
    // Calculate deviation from baseline
    const deviation = Math.abs(currentTraffic - baseline) / baseline;

    if (deviation > this.config.silenceThreshold && currentTraffic < baseline * 0.5) {
      // Suspicious silence detected
      const silenceWindow: SilenceWindow = {
        startTime: windowStart,
        endTime: windowEnd,
        expectedTraffic: baseline,
        actualTraffic: currentTraffic,
        suspiciousSilence: true
      };

      this.silenceWindows.push(silenceWindow);

      return {
        id: crypto.randomUUID(),
        type: 'VOID_SILENCE',
        severity: deviation > 0.7 ? 'HIGH' : 'MEDIUM',
        confidence: Math.min(deviation, 1.0),
        metadata: {
          networkPair: networkKey,
          baseline,
          currentTraffic,
          deviation,
          window: silenceWindow
        },
        timestamp: currentTime
      };
    }

    return null;
  }

  /**
   * Detect port scanning patterns
   */
  private async detectPortScan(packet: NetworkPacket): Promise<ThreatSignature | null> {
    if (packet.protocol !== 'TCP') return null;

    const scanKey = packet.sourceIP;
    const currentTime = packet.timestamp;
    
    // Get or create port scan pattern
    let pattern = this.portScanTracker.get(scanKey);
    if (!pattern) {
      pattern = {
        sourceIP: packet.sourceIP,
        targetPorts: new Set(),
        timeWindow: currentTime,
        scanType: 'VERTICAL',
        intensity: 0
      };
      this.portScanTracker.set(scanKey, pattern);
    }

    // Add target port
    pattern.targetPorts.add(packet.destPort);
    pattern.intensity++;

    // Clean old entries
    if (currentTime - pattern.timeWindow > this.config.timeWindow) {
      pattern.targetPorts.clear();
      pattern.timeWindow = currentTime;
      pattern.intensity = 1;
    }

    // Analyze scan characteristics
    const uniquePorts = pattern.targetPorts.size;
    const timeSpan = currentTime - pattern.timeWindow;
    
    if (uniquePorts >= this.config.portScanThreshold) {
      // Determine scan type
      pattern.scanType = this.determineScanType(pattern, timeSpan);
      
      // Calculate threat severity
      const severity = this.calculatePortScanSeverity(uniquePorts, pattern.intensity, timeSpan);
      
      return {
        id: crypto.randomUUID(),
        type: 'PORT_SCAN',
        severity,
        confidence: Math.min(uniquePorts / 50, 1.0), // Max confidence at 50 ports
        metadata: {
          sourceIP: pattern.sourceIP,
          uniquePorts,
          totalAttempts: pattern.intensity,
          scanType: pattern.scanType,
          timeSpan,
          portsScanned: Array.from(pattern.targetPorts).sort((a, b) => a - b)
        },
        timestamp: currentTime
      };
    }

    return null;
  }

  /**
   * Helper methods for analysis
   */
  private calculateVowelRatio(text: string): number {
    const vowels = text.match(/[aeiou]/gi) || [];
    return vowels.length / text.length;
  }

  private calculateDigitRatio(text: string): number {
    const digits = text.match(/\d/g) || [];
    return digits.length / text.length;
  }

  private hasSequentialPatterns(text: string): boolean {
    let sequentialCount = 0;
    for (let i = 0; i < text.length - 2; i++) {
      const a = text.charCodeAt(i);
      const b = text.charCodeAt(i + 1);
      const c = text.charCodeAt(i + 2);
      if ((b === a + 1 && c === b + 1) || (b === a - 1 && c === b - 1)) {
        sequentialCount++;
      }
    }
    return sequentialCount / Math.max(text.length - 2, 1) > 0.2;
  }

  private analyzeNgrams(text: string): number {
    if (text.length < 3) return 0;
    
    const trigrams = new Set<string>();
    for (let i = 0; i <= text.length - 3; i++) {
      trigrams.add(text.substring(i, i + 3));
    }
    
    // Higher uniqueness ratio suggests more randomness
    return trigrams.size / Math.max(text.length - 2, 1);
  }

  private determineScanType(pattern: PortScanPattern, timeSpan: number): 'HORIZONTAL' | 'VERTICAL' | 'STEALTH' {
    const portsPerSecond = pattern.targetPorts.size / (timeSpan / 1000);
    
    if (portsPerSecond > 10) {
      return 'VERTICAL'; // Fast vertical scan
    } else if (portsPerSecond < 1) {
      return 'STEALTH'; // Slow stealth scan
    } else {
      return 'HORIZONTAL'; // Moderate horizontal scan
    }
  }

  private calculatePortScanSeverity(uniquePorts: number, intensity: number, timeSpan: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const portsPerSecond = uniquePorts / (timeSpan / 1000);
    
    if (uniquePorts > 100 || portsPerSecond > 50) {
      return 'CRITICAL';
    } else if (uniquePorts > 50 || portsPerSecond > 20) {
      return 'HIGH';
    } else if (uniquePorts > 20 || portsPerSecond > 5) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  private async establishNetworkBaseline(): Promise<void> {
    // In production, this would analyze historical traffic data
    // For now, we'll establish a simple baseline
    this.networkBaseline.clear();
    this.logger.info('VoidScanner: Network baseline established');
  }

  private countTrafficInWindow(networkKey: string, start: number, end: number): number {
    // This would count actual traffic in the time window
    // Implementation would depend on traffic storage mechanism
    return 0;
  }

  private updateNetworkMetrics(packet: NetworkPacket): void {
    const networkKey = `${packet.sourceIP}-${packet.destIP}`;
    const current = this.networkBaseline.get(networkKey) || 0;
    this.networkBaseline.set(networkKey, current + 1);
  }

  private createDGAThreat(domain: string, entropy: number, dgaScore?: any): ThreatSignature {
    return {
      id: crypto.randomUUID(),
      type: 'DGA_DOMAIN',
      severity: entropy > 5.0 ? 'HIGH' : 'MEDIUM',
      confidence: dgaScore?.confidence || Math.min(entropy / 6, 1.0),
      metadata: {
        domain,
        entropy,
        characteristics: dgaScore?.characteristics || ['HIGH_ENTROPY'],
        analysisTime: performance.now()
      },
      timestamp: Date.now()
    };
  }

  private startContinuousMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.performPeriodicAnalysis();
    }, this.config.timeWindow);
  }

  private performPeriodicAnalysis(): void {
    try {
      // Clean old tracking data
      this.cleanOldTrackingData();
      
      // Analyze accumulated patterns
      this.analyzeAccumulatedPatterns();
      
      this.emit('analysis_complete', {
        timestamp: Date.now(),
        activeScans: this.portScanTracker.size,
        silenceWindows: this.silenceWindows.length,
        baselineEntries: this.networkBaseline.size
      });
    } catch (error) {
      this.logger.error('VoidScanner: Periodic analysis failed', error);
    }
  }

  private cleanOldTrackingData(): void {
    const currentTime = Date.now();
    const cutoffTime = currentTime - (this.config.timeWindow * 5); // Keep 5 windows

    // Clean port scan data
    for (const [key, pattern] of this.portScanTracker) {
      if (pattern.timeWindow < cutoffTime) {
        this.portScanTracker.delete(key);
      }
    }

    // Clean silence windows
    this.silenceWindows = this.silenceWindows.filter(
      window => window.endTime > cutoffTime
    );

    // Clean domain cache (keep only recent entries)
    if (this.domainCache.size > 1000) {
      // Keep most recent 500 entries
      const entries = Array.from(this.domainCache.entries()).slice(-500);
      this.domainCache.clear();
      entries.forEach(([domain, entropy]) => {
        this.domainCache.set(domain, entropy);
      });
    }
  }

  private analyzeAccumulatedPatterns(): void {
    // Analyze patterns across multiple time windows
    // This could detect coordinated attacks or advanced persistent threats
    const patterns = {
      multiSourceScans: this.detectMultiSourceScans(),
      coordinatedSilence: this.detectCoordinatedSilence(),
      dgaClusters: this.detectDGAClusters()
    };

    if (patterns.multiSourceScans || patterns.coordinatedSilence || patterns.dgaClusters) {
      this.emit('advanced_threat_detected', patterns);
    }
  }

  private detectMultiSourceScans(): boolean {
    // Detect if multiple IPs are scanning similar port ranges
    const portRanges = new Map<string, string[]>();
    
    for (const [ip, pattern] of this.portScanTracker) {
      const ports = Array.from(pattern.targetPorts).sort((a, b) => a - b);
      const range = `${ports[0]}-${ports[ports.length - 1]}`;
      
      if (!portRanges.has(range)) {
        portRanges.set(range, []);
      }
      portRanges.get(range)!.push(ip);
    }

    return Array.from(portRanges.values()).some(ips => ips.length > 3);
  }

  private detectCoordinatedSilence(): boolean {
    // Detect if multiple network pairs show simultaneous silence
    const currentTime = Date.now();
    const recentSilence = this.silenceWindows.filter(
      window => currentTime - window.endTime < this.config.timeWindow * 2
    );

    return recentSilence.length > 5;
  }

  private detectDGAClusters(): boolean {
    // Detect clusters of DGA domains (would require domain history)
    return this.domainCache.size > 50 && 
           Array.from(this.domainCache.values())
             .filter(entropy => entropy > this.config.entropyThreshold)
             .length > 10;
  }

  private setupEventHandlers(): void {
    this.on('error', (error) => {
      this.logger.error('VoidScanner: Error event', error);
    });
  }

  public async shutdown(): Promise<void> {
    try {
      this.isActive = false;
      
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = undefined;
      }

      // Clear all tracking data
      this.networkBaseline.clear();
      this.silenceWindows.length = 0;
      this.portScanTracker.clear();
      this.domainCache.clear();

      this.emit('shutdown');
      this.logger.info('VoidScanner: Successfully shut down');
    } catch (error) {
      this.logger.error('VoidScanner: Shutdown failed', error);
      throw error;
    }
  }

  // Getters for monitoring
  public getStats() {
    return {
      isActive: this.isActive,
      baselineEntries: this.networkBaseline.size,
      activeScans: this.portScanTracker.size,
      silenceWindows: this.silenceWindows.length,
      cachedDomains: this.domainCache.size,
      config: this.config
    };
  }
}

export default VoidScanner;
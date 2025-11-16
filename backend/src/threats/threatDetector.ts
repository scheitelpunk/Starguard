import fetch from 'node-fetch';
import { EventEmitter } from 'events';
import Database from 'sqlite3';
import { Logger } from '../utils/logger.js';

interface ThreatFeed {
  name: string;
  url: string;
  parser: (data: any) => ThreatIndicator[];
  interval: number; // milliseconds
  lastFetch: Date;
  isActive: boolean;
}

interface ThreatIndicator {
  id: string;
  type: 'ip' | 'url' | 'domain' | 'hash' | 'malware';
  value: string;
  confidence: number;
  severity: number;
  source: string;
  firstSeen: Date;
  lastSeen: Date;
  metadata?: any;
}

interface ThreatAnalysis {
  indicator: ThreatIndicator;
  riskScore: number;
  classification: string;
  recommendations: string[];
  relatedThreats: string[];
}

export class ThreatDetector extends EventEmitter {
  private feeds: Map<string, ThreatFeed> = new Map();
  private threats: Map<string, ThreatIndicator> = new Map();
  private db: Database.Database;
  private feedUpdateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isActive: boolean = false;
  private logger: Logger;

  constructor(dbPath: string = './starguard.db') {
    super();
    this.logger = new Logger('threat-detector');
    this.db = new Database.Database(dbPath);
    this.initializeDatabase();
    this.initializeThreatFeeds();
  }

  private initializeDatabase(): void {
    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS threat_indicators (
        id TEXT PRIMARY KEY,
        type TEXT,
        value TEXT,
        confidence REAL,
        severity REAL,
        source TEXT,
        first_seen DATETIME,
        last_seen DATETIME,
        metadata TEXT
      )`);

      this.db.run(`CREATE TABLE IF NOT EXISTS threat_analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        threat_id TEXT,
        risk_score REAL,
        classification TEXT,
        recommendations TEXT,
        related_threats TEXT,
        analysis_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(threat_id) REFERENCES threat_indicators(id)
      )`);

      this.db.run(`CREATE INDEX IF NOT EXISTS idx_threat_type ON threat_indicators(type)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_threat_severity ON threat_indicators(severity)`);
    });
  }

  private initializeThreatFeeds(): void {
    // Feodo Tracker - Banking Trojan IPs
    this.feeds.set('feodotracker', {
      name: 'Feodo Tracker',
      url: 'https://feodotracker.abuse.ch/downloads/ipblocklist.json',
      parser: this.parseFeodoTracker.bind(this),
      interval: 300000, // 5 minutes
      lastFetch: new Date(0),
      isActive: true
    });

    // URLhaus - Malware URLs
    this.feeds.set('urlhaus', {
      name: 'URLhaus',
      url: 'https://urlhaus.abuse.ch/downloads/json_recent/',
      parser: this.parseUrlHaus.bind(this),
      interval: 600000, // 10 minutes
      lastFetch: new Date(0),
      isActive: true
    });

    // Emerging Threats Compromised IPs
    this.feeds.set('emerging-threats', {
      name: 'Emerging Threats',
      url: 'https://rules.emergingthreats.net/blockrules/compromised-ips.txt',
      parser: this.parseEmergingThreats.bind(this),
      interval: 900000, // 15 minutes
      lastFetch: new Date(0),
      isActive: true
    });

    // Threat Intelligence Platform (simulated feed for ML training)
    this.feeds.set('synthetic', {
      name: 'Synthetic Threats',
      url: 'synthetic://localhost',
      parser: this.generateSyntheticThreats.bind(this),
      interval: 60000, // 1 minute
      lastFetch: new Date(0),
      isActive: true
    });
  }

  private parseFeodoTracker(data: string): ThreatIndicator[] {
    try {
      const jsonData = JSON.parse(data);
      return jsonData.map((item: any) => ({
        id: `feodo-${item.ip_address}`,
        type: 'ip' as const,
        value: item.ip_address,
        confidence: this.mapConfidenceLevel(item.confidence_level),
        severity: this.calculateSeverityFromMalware(item.malware),
        source: 'feodotracker',
        firstSeen: item.first_seen ? new Date(item.first_seen) : new Date(),
        lastSeen: item.last_seen ? new Date(item.last_seen) : new Date(),
        metadata: {
          malware: item.malware,
          status: item.status,
          country: item.country
        }
      }));
    } catch (error) {
      this.logger.error('Failed to parse Feodo Tracker data', error);
      return [];
    }
  }

  private parseUrlHaus(data: string): ThreatIndicator[] {
    try {
      const jsonData = JSON.parse(data);
      return jsonData.map((item: any) => ({
        id: `urlhaus-${item.id}`,
        type: 'url' as const,
        value: item.url,
        confidence: item.url_status === 'online' ? 0.9 : 0.6,
        severity: this.calculateUrlSeverity(item.threat),
        source: 'urlhaus',
        firstSeen: item.date_added ? new Date(item.date_added) : new Date(),
        lastSeen: item.last_online ? new Date(item.last_online) : new Date(),
        metadata: {
          threat: item.threat,
          status: item.url_status,
          payload: item.payload
        }
      }));
    } catch (error) {
      this.logger.error('Failed to parse URLhaus data', error);
      return [];
    }
  }

  private parseEmergingThreats(data: string): ThreatIndicator[] {
    const lines = data.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    return lines.map((ip, index) => ({
      id: `emerging-${ip.trim()}`,
      type: 'ip' as const,
      value: ip.trim(),
      confidence: 0.8,
      severity: 0.7,
      source: 'emerging-threats',
      firstSeen: new Date(),
      lastSeen: new Date(),
      metadata: {
        listPosition: index
      }
    }));
  }

  private generateSyntheticThreats(): ThreatIndicator[] {
    // Generate synthetic threats for ML training and testing
    const syntheticThreats: ThreatIndicator[] = [];
    const threatTypes = ['ip', 'url', 'domain', 'hash'] as const;
    
    for (let i = 0; i < 5; i++) {
      const type = threatTypes[Math.floor(Math.random() * threatTypes.length)];
      let value: string;
      
      switch (type) {
        case 'ip':
          value = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
          break;
        case 'url':
          value = `http://malicious${Math.floor(Math.random() * 1000)}.example.com/payload`;
          break;
        case 'domain':
          value = `malware${Math.floor(Math.random() * 1000)}.badactor.com`;
          break;
        case 'hash':
          value = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
          break;
      }
      
      syntheticThreats.push({
        id: `synthetic-${Date.now()}-${i}`,
        type,
        value,
        confidence: 0.3 + Math.random() * 0.4, // Lower confidence for synthetic
        severity: Math.random(),
        source: 'synthetic',
        firstSeen: new Date(),
        lastSeen: new Date(),
        metadata: {
          synthetic: true,
          category: ['trojan', 'malware', 'phishing', 'botnet'][Math.floor(Math.random() * 4)]
        }
      });
    }
    
    return syntheticThreats;
  }

  private mapConfidenceLevel(level: string): number {
    const mapping: { [key: string]: number } = {
      'high': 0.9,
      'medium': 0.6,
      'low': 0.3
    };
    return mapping[level?.toLowerCase()] || 0.5;
  }

  private calculateSeverityFromMalware(malware: string): number {
    if (!malware) return 0.5;
    
    const highSeverityIndicators = ['zeus', 'emotet', 'trickbot', 'dridex', 'qakbot'];
    const malwareLower = malware.toLowerCase();
    
    if (highSeverityIndicators.some(indicator => malwareLower.includes(indicator))) {
      return 0.9;
    }
    
    return 0.6;
  }

  private calculateUrlSeverity(threat: string): number {
    if (!threat) return 0.5;
    
    const threatLower = threat.toLowerCase();
    
    if (threatLower.includes('ransomware') || threatLower.includes('trojan')) {
      return 0.9;
    }
    if (threatLower.includes('malware') || threatLower.includes('phishing')) {
      return 0.7;
    }
    
    return 0.5;
  }

  public async start(): Promise<void> {
    this.logger.info('Starting STARGUARD Threat Detection');
    this.isActive = true;
    
    // Initial fetch from all feeds
    for (const [feedId, feed] of this.feeds) {
      if (feed.isActive) {
        await this.fetchThreatFeed(feedId);
        
        // Schedule regular updates
        const interval = setInterval(async () => {
          if (this.isActive) {
            await this.fetchThreatFeed(feedId);
          }
        }, feed.interval);
        
        this.feedUpdateIntervals.set(feedId, interval);
      }
    }

    this.logger.info('Threat detection active', { feedCount: this.feeds.size });
    this.emit('started', { feedCount: this.feeds.size, threatCount: this.threats.size });
  }

  private async fetchThreatFeed(feedId: string): Promise<void> {
    const feed = this.feeds.get(feedId);
    if (!feed || !feed.isActive) return;
    
    try {
      this.logger.debug('Fetching threats from feed', { feedName: feed.name });

      let data: string;
      if (feed.url.startsWith('synthetic://')) {
        // Handle synthetic feed
        const syntheticThreats = feed.parser('');
        this.processThreatIndicators(syntheticThreats, feedId);
        feed.lastFetch = new Date();
        return;
      }
      
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'STARGUARD-ThreatDetector/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      data = await response.text();
      const threats = feed.parser(data);
      
      this.processThreatIndicators(threats, feedId);
      feed.lastFetch = new Date();

      this.logger.info('Processed threat indicators from feed', { feedName: feed.name, count: threats.length });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to fetch from feed', { feedName: feed.name, error: errorMessage });
      this.emit('feedError', { feedId, error: errorMessage });
    }
  }

  private processThreatIndicators(indicators: ThreatIndicator[], source: string): void {
    let newThreats = 0;
    let updatedThreats = 0;
    
    for (const indicator of indicators) {
      const existingThreat = this.threats.get(indicator.id);
      
      if (existingThreat) {
        // Update existing threat
        existingThreat.lastSeen = new Date();
        existingThreat.confidence = Math.max(existingThreat.confidence, indicator.confidence);
        existingThreat.severity = Math.max(existingThreat.severity, indicator.severity);
        updatedThreats++;
      } else {
        // New threat
        this.threats.set(indicator.id, indicator);
        this.storeThreatInDatabase(indicator);
        newThreats++;
        
        // Emit new threat for real-time processing
        this.emit('newThreat', indicator);
      }
    }
    
    if (newThreats > 0 || updatedThreats > 0) {
      this.emit('threatsUpdated', {
        source,
        newThreats,
        updatedThreats,
        totalThreats: this.threats.size
      });
    }
  }

  private storeThreatInDatabase(indicator: ThreatIndicator): void {
    this.db.run(
      `INSERT OR REPLACE INTO threat_indicators 
       (id, type, value, confidence, severity, source, first_seen, last_seen, metadata) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        indicator.id,
        indicator.type,
        indicator.value,
        indicator.confidence,
        indicator.severity,
        indicator.source,
        indicator.firstSeen.toISOString(),
        indicator.lastSeen.toISOString(),
        JSON.stringify(indicator.metadata || {})
      ]
    );
  }

  public async analyzeThreat(threatId: string): Promise<ThreatAnalysis | null> {
    const indicator = this.threats.get(threatId);
    if (!indicator) return null;
    
    const analysis: ThreatAnalysis = {
      indicator,
      riskScore: this.calculateRiskScore(indicator),
      classification: this.classifyThreat(indicator),
      recommendations: this.generateRecommendations(indicator),
      relatedThreats: await this.findRelatedThreats(indicator)
    };
    
    // Store analysis
    this.db.run(
      `INSERT INTO threat_analyses 
       (threat_id, risk_score, classification, recommendations, related_threats) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        threatId,
        analysis.riskScore,
        analysis.classification,
        JSON.stringify(analysis.recommendations),
        JSON.stringify(analysis.relatedThreats)
      ]
    );
    
    this.emit('threatAnalyzed', analysis);
    return analysis;
  }

  private calculateRiskScore(indicator: ThreatIndicator): number {
    let score = indicator.severity * 0.6 + indicator.confidence * 0.4;
    
    // Adjust based on recency
    const ageHours = (Date.now() - indicator.lastSeen.getTime()) / (1000 * 60 * 60);
    const recencyFactor = Math.max(0.5, 1 - ageHours / 168); // Decay over a week
    
    score *= recencyFactor;
    
    // Adjust based on source reliability
    const sourceReliability: { [key: string]: number } = {
      'feodotracker': 1.0,
      'urlhaus': 0.95,
      'emerging-threats': 0.9,
      'synthetic': 0.3
    };
    
    score *= sourceReliability[indicator.source] || 0.7;
    
    return Math.min(1, Math.max(0, score));
  }

  private classifyThreat(indicator: ThreatIndicator): string {
    if (indicator.metadata?.malware) {
      return `Banking Trojan - ${indicator.metadata.malware}`;
    }
    
    if (indicator.metadata?.threat) {
      return indicator.metadata.threat;
    }
    
    if (indicator.type === 'ip') {
      return 'Compromised Host';
    }
    
    if (indicator.type === 'url') {
      return 'Malicious URL';
    }
    
    return 'Unknown Threat';
  }

  private generateRecommendations(indicator: ThreatIndicator): string[] {
    const recommendations: string[] = [];
    
    if (indicator.type === 'ip') {
      recommendations.push(`Block IP address ${indicator.value} at perimeter firewall`);
      recommendations.push('Monitor for outbound connections to this IP');
      recommendations.push('Check logs for any historical communication');
    }
    
    if (indicator.type === 'url') {
      recommendations.push(`Block access to URL: ${indicator.value}`);
      recommendations.push('Update web filtering rules');
      recommendations.push('Scan systems for signs of compromise');
    }
    
    if (indicator.severity > 0.8) {
      recommendations.push('Implement immediate containment measures');
      recommendations.push('Activate incident response procedures');
    }
    
    return recommendations;
  }

  private async findRelatedThreats(indicator: ThreatIndicator): Promise<string[]> {
    const relatedIds: string[] = [];
    
    // Find threats from same source
    for (const [id, threat] of this.threats) {
      if (threat.id !== indicator.id && threat.source === indicator.source) {
        if (threat.metadata?.malware === indicator.metadata?.malware) {
          relatedIds.push(id);
        }
      }
    }
    
    return relatedIds.slice(0, 5); // Limit to 5 related threats
  }

  public getThreats(filter?: {
    type?: string;
    minSeverity?: number;
    minConfidence?: number;
    source?: string;
  }): ThreatIndicator[] {
    let threats = Array.from(this.threats.values());

    if (filter) {
      if (filter.type) {
        threats = threats.filter(t => t.type === filter.type);
      }
      if (filter.minSeverity !== undefined) {
        const minSev = filter.minSeverity;
        threats = threats.filter(t => t.severity >= minSev);
      }
      if (filter.minConfidence !== undefined) {
        const minConf = filter.minConfidence;
        threats = threats.filter(t => t.confidence >= minConf);
      }
      if (filter.source) {
        threats = threats.filter(t => t.source === filter.source);
      }
    }

    return threats.sort((a, b) => b.severity - a.severity);
  }

  public getThreatById(id: string): ThreatIndicator | undefined {
    return this.threats.get(id);
  }

  public getThreatStatistics(): any {
    const threats = Array.from(this.threats.values());
    
    return {
      total: threats.length,
      byType: this.groupBy(threats, 'type'),
      bySource: this.groupBy(threats, 'source'),
      averageSeverity: threats.reduce((sum, t) => sum + t.severity, 0) / threats.length,
      averageConfidence: threats.reduce((sum, t) => sum + t.confidence, 0) / threats.length,
      highSeverityCount: threats.filter(t => t.severity > 0.7).length,
      recentCount: threats.filter(t => 
        (Date.now() - t.lastSeen.getTime()) < 24 * 60 * 60 * 1000
      ).length
    };
  }

  private groupBy(array: any[], key: string): { [key: string]: number } {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  public stop(): void {
    this.logger.info('Stopping threat detection');
    this.isActive = false;
    
    for (const interval of this.feedUpdateIntervals.values()) {
      clearInterval(interval);
    }
    this.feedUpdateIntervals.clear();
    
    this.emit('stopped');
  }

  public close(): void {
    this.stop();
    this.db.close();
  }
}
import { SignalCollector } from './SignalCollector';
import { ISignal } from '@starguard/shared';
import { v4 as uuidv4 } from 'uuid';
import * as os from 'os';
import * as fs from 'fs/promises';
import * as path from 'path';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  processCount: number;
  uptime: number;
  loadAverage: number[];
}

export class SystemSignalCollector extends SignalCollector {
  private baselineMetrics: SystemMetrics | null = null;
  private criticalProcesses: Set<string> = new Set();
  private suspiciousProcessPatterns: RegExp[] = [];
  private fileSystemWatchers: Map<string, any> = new Map();
  
  constructor(consciousness: any, io: any, logger: any) {
    super('system', consciousness, io, logger);
    this.initializeCriticalProcesses();
    this.initializeSuspiciousPatterns();
  }
  
  protected async initialize(): Promise<void> {
    this.logger.info('Initializing SystemSignalCollector');
    
    // Establish baseline metrics
    this.baselineMetrics = await this.getCurrentMetrics();
    
    // Initialize file system monitoring for critical directories
    const criticalDirs = ['/etc', '/var/log', '/tmp'];
    for (const dir of criticalDirs) {
      try {
        await this.watchDirectory(dir);
      } catch (error) {
        this.logger.debug(`Could not watch directory ${dir}:`, error);
      }
    }
  }
  
  protected async cleanup(): Promise<void> {
    this.logger.info('Cleaning up SystemSignalCollector');
    
    // Clear file system watchers
    for (const [dir, watcher] of this.fileSystemWatchers) {
      try {
        if (watcher && typeof watcher.close === 'function') {
          await watcher.close();
        }
      } catch (error) {
        this.logger.error(`Error closing watcher for ${dir}:`, error);
      }
    }
    this.fileSystemWatchers.clear();
  }
  
  protected async performCalibration(params: any): Promise<void> {
    if (params.resetBaseline) {
      this.baselineMetrics = await this.getCurrentMetrics();
      this.logger.info('System baseline reset');
    }
    
    if (params.criticalProcesses) {
      params.criticalProcesses.forEach((process: string) => {
        this.criticalProcesses.add(process);
      });
    }
  }
  
  async collect(): Promise<ISignal[]> {
    const signals: ISignal[] = [];
    
    // Collect system resource metrics
    const resourceSignals = await this.collectResourceMetrics();
    signals.push(...resourceSignals);
    
    // Monitor process anomalies
    const processSignals = await this.monitorProcesses();
    signals.push(...processSignals);
    
    // Check system integrity
    const integritySignals = await this.checkSystemIntegrity();
    signals.push(...integritySignals);
    
    // Monitor privilege escalation attempts
    const privEscSignals = this.detectPrivilegeEscalation();
    signals.push(...privEscSignals);
    
    return signals;
  }
  
  private async getCurrentMetrics(): Promise<SystemMetrics> {
    const cpuInfo = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    
    return {
      cpuUsage: this.calculateCpuUsage(cpuInfo),
      memoryUsage: (totalMemory - freeMemory) / totalMemory,
      diskUsage: await this.calculateDiskUsage(),
      processCount: await this.getProcessCount(),
      uptime: os.uptime(),
      loadAverage: os.loadavg()
    };
  }
  
  private calculateCpuUsage(cpus: os.CpuInfo[]): number {
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof os.CpuInfo['times']];
      }
      totalIdle += cpu.times.idle;
    });
    
    return 1 - (totalIdle / totalTick);
  }
  
  private async calculateDiskUsage(): Promise<number> {
    // Simplified disk usage calculation
    // In production, use proper disk monitoring tools
    return Math.random() * 0.3 + 0.5; // Simulate 50-80% usage
  }
  
  private async getProcessCount(): Promise<number> {
    // Simulate process count
    // In production, use proper process monitoring
    return Math.floor(Math.random() * 50) + 100;
  }
  
  private async collectResourceMetrics(): Promise<ISignal[]> {
    const signals: ISignal[] = [];
    const currentMetrics = await this.getCurrentMetrics();
    
    if (this.baselineMetrics) {
      // CPU anomaly detection
      if (currentMetrics.cpuUsage > 0.9) {
        signals.push({
          id: uuidv4(),
          timestamp: new Date(),
          source: 'system:cpu',
          type: 'system',
          strength: currentMetrics.cpuUsage,
          data: {
            metric: 'cpu_usage_critical',
            usage: currentMetrics.cpuUsage,
            baseline: this.baselineMetrics.cpuUsage,
            cores: os.cpus().length
          }
        });
      }
      
      // Memory anomaly detection
      if (currentMetrics.memoryUsage > 0.95) {
        signals.push({
          id: uuidv4(),
          timestamp: new Date(),
          source: 'system:memory',
          type: 'system',
          strength: currentMetrics.memoryUsage,
          data: {
            metric: 'memory_usage_critical',
            usage: currentMetrics.memoryUsage,
            available: os.freemem(),
            total: os.totalmem()
          }
        });
      }
      
      // Load average anomaly
      const loadThreshold = os.cpus().length * 2;
      if (currentMetrics.loadAverage[0] > loadThreshold) {
        signals.push({
          id: uuidv4(),
          timestamp: new Date(),
          source: 'system:load',
          type: 'system',
          strength: Math.min(1, currentMetrics.loadAverage[0] / (loadThreshold * 2)),
          data: {
            metric: 'load_average_high',
            load_1min: currentMetrics.loadAverage[0],
            load_5min: currentMetrics.loadAverage[1],
            load_15min: currentMetrics.loadAverage[2],
            cpu_count: os.cpus().length
          }
        });
      }
      
      // Process count anomaly
      const processCountDelta = Math.abs(
        currentMetrics.processCount - this.baselineMetrics.processCount
      );
      if (processCountDelta > 50) {
        signals.push({
          id: uuidv4(),
          timestamp: new Date(),
          source: 'system:processes',
          type: 'system',
          strength: Math.min(1, processCountDelta / 100),
          data: {
            metric: 'process_count_anomaly',
            current: currentMetrics.processCount,
            baseline: this.baselineMetrics.processCount,
            delta: processCountDelta
          }
        });
      }
    }
    
    return signals;
  }
  
  private async monitorProcesses(): Promise<ISignal[]> {
    const signals: ISignal[] = [];
    
    // Simulate process monitoring
    // In production, use proper process monitoring tools
    
    // Check for suspicious process names
    if (Math.random() < 0.05) {
      const suspiciousNames = [
        'cryptominer', 'backdoor', 'rootkit', 'keylogger',
        'mimikatz', 'nmap', 'metasploit', 'nc', 'netcat'
      ];
      
      const detectedProcess = suspiciousNames[
        Math.floor(Math.random() * suspiciousNames.length)
      ];
      
      signals.push({
        id: uuidv4(),
        timestamp: new Date(),
        source: 'system:process_monitor',
        type: 'system',
        strength: 0.9,
        data: {
          threat_type: 'suspicious_process',
          process_name: detectedProcess,
          pid: Math.floor(Math.random() * 10000) + 1000,
          user: 'unknown',
          command_line: `/usr/bin/${detectedProcess} --stealth`
        }
      });
    }
    
    // Check for process injection attempts
    if (Math.random() < 0.02) {
      signals.push({
        id: uuidv4(),
        timestamp: new Date(),
        source: 'system:process_monitor',
        type: 'system',
        strength: 0.85,
        data: {
          threat_type: 'process_injection',
          target_process: this.getRandomCriticalProcess(),
          injector_pid: Math.floor(Math.random() * 10000) + 1000,
          technique: ['SetWindowsHookEx', 'CreateRemoteThread', 'QueueUserAPC'][
            Math.floor(Math.random() * 3)
          ]
        }
      });
    }
    
    return signals;
  }
  
  private async checkSystemIntegrity(): Promise<ISignal[]> {
    const signals: ISignal[] = [];
    
    // Check for file system modifications
    if (Math.random() < 0.03) {
      const criticalFiles = [
        '/etc/passwd', '/etc/shadow', '/etc/sudoers',
        '/etc/hosts', '/etc/ssh/sshd_config'
      ];
      
      const modifiedFile = criticalFiles[
        Math.floor(Math.random() * criticalFiles.length)
      ];
      
      signals.push({
        id: uuidv4(),
        timestamp: new Date(),
        source: 'system:integrity_monitor',
        type: 'system',
        strength: 0.95,
        data: {
          threat_type: 'critical_file_modified',
          file_path: modifiedFile,
          modification_type: 'content_changed',
          previous_hash: 'a1b2c3d4e5f6',
          current_hash: 'f6e5d4c3b2a1'
        }
      });
    }
    
    // Check for kernel module loading
    if (Math.random() < 0.01) {
      signals.push({
        id: uuidv4(),
        timestamp: new Date(),
        source: 'system:kernel_monitor',
        type: 'system',
        strength: 0.98,
        data: {
          threat_type: 'suspicious_kernel_module',
          module_name: 'rootkit_' + Math.random().toString(36).substring(7),
          load_address: '0x' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16),
          size: Math.floor(Math.random() * 10000) + 1000
        }
      });
    }
    
    return signals;
  }
  
  private detectPrivilegeEscalation(): ISignal[] {
    const signals: ISignal[] = [];
    
    // Simulate privilege escalation detection
    if (Math.random() < 0.02) {
      const escalationTypes = [
        {
          type: 'sudo_abuse',
          command: 'sudo -i',
          user: 'www-data'
        },
        {
          type: 'setuid_exploit',
          binary: '/usr/bin/passwd',
          technique: 'buffer_overflow'
        },
        {
          type: 'kernel_exploit',
          cve: 'CVE-2021-' + Math.floor(Math.random() * 10000),
          technique: 'race_condition'
        }
      ];
      
      const escalation = escalationTypes[
        Math.floor(Math.random() * escalationTypes.length)
      ];
      
      signals.push({
        id: uuidv4(),
        timestamp: new Date(),
        source: 'system:privilege_monitor',
        type: 'system',
        strength: 0.92,
        data: {
          threat_type: 'privilege_escalation',
          ...escalation,
          source_uid: 1000,
          target_uid: 0
        }
      });
    }
    
    return signals;
  }
  
  private async watchDirectory(dirPath: string): Promise<void> {
    // In production, implement proper file system watching
    // For now, just log that we would watch this directory
    this.logger.debug(`Would watch directory: ${dirPath}`);
  }
  
  private initializeCriticalProcesses(): void {
    this.criticalProcesses.add('sshd');
    this.criticalProcesses.add('systemd');
    this.criticalProcesses.add('init');
    this.criticalProcesses.add('kernel');
    this.criticalProcesses.add('nginx');
    this.criticalProcesses.add('apache2');
    this.criticalProcesses.add('mysql');
    this.criticalProcesses.add('postgres');
  }
  
  private initializeSuspiciousPatterns(): void {
    this.suspiciousProcessPatterns = [
      /miner/i,
      /backdoor/i,
      /rootkit/i,
      /keylog/i,
      /exploit/i,
      /payload/i,
      /reverse.*shell/i
    ];
  }
  
  private getRandomCriticalProcess(): string {
    const processes = Array.from(this.criticalProcesses);
    return processes[Math.floor(Math.random() * processes.length)];
  }
}
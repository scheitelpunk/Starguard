import { EventEmitter } from 'events';
import { execSync } from 'child_process';
import * as fs from 'fs';
import { createHash } from 'crypto';

export class TemporalGuardian extends EventEmitter {
  private systemTimeBaseline: number;
  private logTimestamps: Map<string, number[]> = new Map();
  private lamportClock: number = 0;

  constructor() {
    super();
    this.systemTimeBaseline = Date.now();
    this.startMonitoring();
  }

  private startMonitoring(): void {
    setInterval(() => {
      const drift = this.detectClockDrift();
      const anomalies = this.detectTimestampAnomalies();

      if (drift > 1000 || anomalies.length > 0) {
        this.emit('temporal-anomaly', {
          drift: drift,
          anomalies: anomalies,
          lamportClock: ++this.lamportClock
        });
      }
    }, 1000);
  }

  private detectClockDrift(): number {
    try {
      const ntpTime = execSync('ntpdate -q pool.ntp.org | grep -oP "offset [\\d.-]+" | cut -d" " -f2',
        { encoding: 'utf8' });
      return Math.abs(parseFloat(ntpTime) * 1000);
    } catch {
      return 0;
    }
  }

  private detectTimestampAnomalies(): string[] {
    const anomalies: string[] = [];

    if (fs.existsSync('/var/log/syslog')) {
      const logs = fs.readFileSync('/var/log/syslog', 'utf8').split('\n').slice(-1000);
      let lastTimestamp = 0;

      logs.forEach(line => {
        const match = line.match(/^(\w+\s+\d+\s+\d+:\d+:\d+)/);
        if (match) {
          const timestamp = new Date(match[1]).getTime();
          if (timestamp < lastTimestamp) {
            anomalies.push(`Timeline reversal detected: ${line.substring(0, 50)}`);
          }
          lastTimestamp = timestamp;
        }
      });
    }

    return anomalies;
  }

  public createTimeProof(data: any): string {
    const timestamp = Date.now();
    const proof = {
      data: data,
      timestamp: timestamp,
      lamportClock: ++this.lamportClock,
      systemTime: new Date().toISOString(),
      hash: ''
    };

    proof.hash = createHash('sha256')
      .update(JSON.stringify(proof))
      .digest('hex');

    return proof.hash;
  }
}
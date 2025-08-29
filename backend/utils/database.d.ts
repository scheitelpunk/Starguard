import type { ThreatDetectionResult, ConsciousnessState, SystemMetrics } from '../types/index.js';
export declare class DatabaseManager {
    private db;
    private initialized;
    private backupInterval;
    initialize(): Promise<void>;
    private setupDatabase;
    private createTables;
    private createIndexes;
    saveThreat(threat: ThreatDetectionResult): Promise<void>;
    getThreats(limit?: number, severity?: string): Promise<ThreatDetectionResult[]>;
    saveConsciousnessState(state: ConsciousnessState): Promise<void>;
    saveMetrics(metrics: SystemMetrics): Promise<void>;
    getLatestMetrics(): Promise<SystemMetrics | null>;
    cleanup(retentionDays?: number): Promise<void>;
    private startBackupSchedule;
    private backup;
    close(): Promise<void>;
}
export declare const database: DatabaseManager;
//# sourceMappingURL=database.d.ts.map
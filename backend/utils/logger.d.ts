import type { LogRequest, LogResponse, LogThreat, LogConsciousnessState, LogMetrics, SecurityEventDetails, PerformanceData, WebSocketData, StructuredLogData } from '../src/types/logger.types';
export declare class Logger {
    private logger;
    constructor(context?: string);
    fatal(message: string, data?: StructuredLogData): void;
    error(message: string, error?: Error | StructuredLogData): void;
    warn(message: string, data?: StructuredLogData): void;
    info(message: string, data?: StructuredLogData): void;
    debug(message: string, data?: StructuredLogData): void;
    trace(message: string, data?: StructuredLogData): void;
    request(req: LogRequest, res: LogResponse): void;
    websocket(action: string, clientId: string, data?: WebSocketData): void;
    threat(threat: LogThreat): void;
    consciousness(state: LogConsciousnessState): void;
    metrics(metrics: LogMetrics): void;
    security(event: string, details?: SecurityEventDetails): void;
    performance(operation: string, duration: number, data?: PerformanceData): void;
    database(operation: string, table?: string, duration?: number): void;
    memory(): void;
    withContext(context: Record<string, any>): Logger;
    flush(): Promise<void>;
}
export declare const logger: Logger;
export declare const requestLogger: Logger;
export declare const wsLogger: Logger;
export declare const dbLogger: Logger;
export declare const securityLogger: Logger;
export declare const metricsLogger: Logger;
export declare class PerformanceTimer {
    private start;
    private operation;
    constructor(operation: string);
    end(data?: PerformanceData): number;
}
export declare function timer(operation: string): PerformanceTimer;
export declare function generateRequestId(): string;
export declare function setLogLevel(level: string): void;
export declare function gracefulShutdown(): Promise<void>;
//# sourceMappingURL=logger.d.ts.map
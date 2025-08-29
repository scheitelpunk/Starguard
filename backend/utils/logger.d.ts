export declare class Logger {
    private logger;
    constructor(context?: string);
    fatal(message: string, data?: any): void;
    error(message: string, error?: Error | any): void;
    warn(message: string, data?: any): void;
    info(message: string, data?: any): void;
    debug(message: string, data?: any): void;
    trace(message: string, data?: any): void;
    request(req: any, res: any): void;
    websocket(action: string, clientId: string, data?: any): void;
    threat(threat: any): void;
    consciousness(state: any): void;
    metrics(metrics: any): void;
    security(event: string, details?: any): void;
    performance(operation: string, duration: number, data?: any): void;
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
    end(data?: any): number;
}
export declare function timer(operation: string): PerformanceTimer;
export declare function generateRequestId(): string;
export declare function setLogLevel(level: string): void;
export declare function gracefulShutdown(): Promise<void>;
//# sourceMappingURL=logger.d.ts.map
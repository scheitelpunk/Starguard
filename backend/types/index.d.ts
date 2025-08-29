export interface ThreatDetectionResult {
    id: string;
    timestamp: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: 'malware' | 'intrusion' | 'anomaly' | 'quantum' | 'ai_threat';
    confidence: number;
    source: string;
    details: {
        description: string;
        affected_systems: string[];
        recommended_actions: string[];
        quantum_signature?: string;
        ai_pattern?: string;
    };
    status: 'new' | 'investigating' | 'contained' | 'resolved';
    location: {
        ip?: string;
        region?: string;
        coordinates?: [number, number];
    };
}
export interface ConsciousnessState {
    id: string;
    timestamp: number;
    awareness_level: number;
    quantum_coherence: number;
    emotional_state: 'calm' | 'alert' | 'concerned' | 'defensive' | 'aggressive';
    decision_confidence: number;
    active_processes: {
        threat_analysis: boolean;
        pattern_recognition: boolean;
        predictive_modeling: boolean;
        quantum_computing: boolean;
    };
    memory_usage: {
        short_term: number;
        long_term: number;
        quantum_storage: number;
    };
    learning_metrics: {
        patterns_learned: number;
        adaptations_made: number;
        accuracy_improvement: number;
    };
}
export interface SystemMetrics {
    timestamp: number;
    cpu_usage: number;
    memory_usage: number;
    network_activity: {
        incoming: number;
        outgoing: number;
        connections: number;
    };
    quantum_processor: {
        coherence_time: number;
        gate_fidelity: number;
        error_rate: number;
    };
    ai_performance: {
        inference_speed: number;
        model_accuracy: number;
        training_progress: number;
    };
    security_status: {
        active_threats: number;
        blocked_attempts: number;
        firewall_status: 'active' | 'inactive' | 'learning';
        encryption_strength: number;
    };
}
export interface WebSocketMessage {
    type: 'threat' | 'consciousness' | 'metrics' | 'command' | 'status' | 'alert' | 'pong';
    payload: any;
    timestamp: number;
    id: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
}
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: number;
    request_id: string;
}
export interface DatabaseConfig {
    type: 'sqlite';
    database: string;
    memory_limit: number;
    backup_interval: number;
    encryption: boolean;
}
export interface ServerConfig {
    host: string;
    port: number;
    cors: {
        origin: string | string[];
        credentials: boolean;
    };
    websocket: {
        max_connections: number;
        heartbeat_interval: number;
        timeout: number;
    };
    logging: {
        level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
        pretty: boolean;
    };
    memory: {
        max_heap: number;
        gc_interval: number;
    };
    quantum: {
        enabled: boolean;
        coherence_threshold: number;
        max_qubits: number;
    };
    ai: {
        model_path: string;
        batch_size: number;
        inference_timeout: number;
    };
}
export interface QuantumState {
    qubits: number;
    coherence: number;
    entanglement: boolean;
    superposition: boolean;
    measurement_results: number[];
    gate_operations: string[];
    error_correction: {
        active: boolean;
        syndrome: string;
        correction_applied: boolean;
    };
}
export interface MLPrediction {
    id: string;
    timestamp: number;
    model: string;
    input_features: Record<string, number>;
    prediction: {
        value: number | string;
        confidence: number;
        probabilities?: Record<string, number>;
    };
    anomaly_score: number;
    explanation: {
        feature_importance: Record<string, number>;
        decision_path: string[];
    };
}
export interface AlertConfig {
    id: string;
    name: string;
    condition: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    cooldown: number;
    actions: {
        notify: boolean;
        block: boolean;
        quarantine: boolean;
        escalate: boolean;
    };
}
export interface ClientConnection {
    id: string;
    socket: any;
    connected_at: number;
    last_ping: number;
    subscriptions: string[];
    permissions: string[];
    metadata: {
        ip: string;
        user_agent?: string;
        api_key?: string;
    };
}
export interface DataStream {
    id: string;
    name: string;
    type: 'threat' | 'metrics' | 'consciousness' | 'quantum' | 'ml' | 'alert';
    active: boolean;
    subscribers: string[];
    rate_limit: number;
    last_message: number;
    total_messages: number;
}
//# sourceMappingURL=index.d.ts.map
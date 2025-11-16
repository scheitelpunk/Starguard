/**
 * Omega Protocol Type Definitions
 * Comprehensive types for mathematical security analysis
 */

/**
 * TLS Certificate data structure
 */
export interface TLSCertificate {
  publicKey: Buffer | string;
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  serialNumber: string;
  fingerprint: string;
}

/**
 * Cipher suite information
 */
export interface CipherSuite {
  name: string;
  protocol: string;
  keyExchange: string;
  encryption: string;
  mac: string;
  bits: number;
}

/**
 * Key exchange information
 */
export interface KeyExchange {
  algorithm: string;
  parameters: Record<string, unknown>;
  strength: number;
}

/**
 * TLS connection data
 */
export interface TLSData {
  certificates: TLSCertificate[];
  cipherSuites: CipherSuite[];
  keyExchanges: KeyExchange[];
}

/**
 * Network packet information
 */
export interface NetworkPacket {
  payload: Buffer | string;
  port: number;
  sourceIP: string;
  destinationIP: string;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  timestamp: number;
  size: number;
}

/**
 * RSA key weakness analysis
 */
export interface RSAWeakness {
  isWeak: boolean;
  score: number;
  reason?: string;
  keySize: number;
  primeFactors?: number[];
}

/**
 * Quantum threat detection result
 */
export interface QuantumThreat {
  detected: boolean;
  type: 'shor' | 'grover' | 'quantum_annealing' | 'none';
  confidence: number;
  description?: string;
}

/**
 * Spectral analysis results
 */
export interface SpectralAnalysis {
  eigenvalues: number[];
  riemannCorrelation: number;
  quantumCoherence: number;
  anomalies: SpectralAnomaly[];
}

/**
 * Spectral anomaly
 */
export interface SpectralAnomaly {
  type: string;
  severity: number;
  position: number;
  description: string;
}

/**
 * Prime pattern detection results
 */
export interface PrimePatterns {
  detected: boolean;
  patterns: number[];
  correlation: number;
  significance: number;
}

/**
 * Riemann zeta findings
 */
export interface RiemannFindings {
  weakKeys: RSAWeakness[];
  primePatterns: PrimePatterns;
  zetaCorrelation: number;
}

/**
 * Quantum resistance status
 */
export interface QuantumStatus {
  threatDetected: boolean;
  threatType: string;
  confidence: number;
  quantumResistantKeyGenerated: boolean;
}

/**
 * Complete Omega analysis result
 */
export interface OmegaAnalysis {
  timestamp: number;
  riemannFindings: RiemannFindings;
  quantumStatus: QuantumStatus;
  spectralFindings: SpectralAnalysis;
  overallThreatLevel: number;
  recommendations: string[];
}

/**
 * Omega alert event
 */
export interface OmegaAlert {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  analysis: OmegaAnalysis;
}

/**
 * Raw data input for Omega analysis
 */
export interface OmegaInputData {
  certificates?: TLSCertificate[];
  cipherSuites?: CipherSuite[];
  keyExchanges?: KeyExchange[];
  packets?: NetworkPacket[];
  timestamp?: number;
}

/**
 * Type guard for TLS certificate
 */
export function isTLSCertificate(obj: unknown): obj is TLSCertificate {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'publicKey' in obj &&
    'subject' in obj &&
    'issuer' in obj
  );
}

/**
 * Type guard for network packet
 */
export function isNetworkPacket(obj: unknown): obj is NetworkPacket {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'payload' in obj &&
    'port' in obj &&
    typeof (obj as NetworkPacket).port === 'number'
  );
}

/**
 * Type guard for Omega input data
 */
export function isOmegaInputData(obj: unknown): obj is OmegaInputData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('certificates' in obj || 'packets' in obj)
  );
}

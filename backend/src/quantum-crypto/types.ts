/**
 * Quantum-Resistant Cryptography Types
 *
 * Post-quantum cryptographic algorithms resistant to quantum computer attacks
 * Implements lattice-based, hash-based, and code-based cryptography
 */

/**
 * Post-Quantum Algorithm Type
 */
export type PQAlgorithmType = 'lattice' | 'hash' | 'code' | 'multivariate' | 'isogeny';

/**
 * Cryptographic Operation
 */
export type CryptoOperation = 'key_generation' | 'encryption' | 'decryption' | 'signing' | 'verification' | 'key_exchange';

/**
 * Security Level (NIST)
 */
export type SecurityLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Key Exchange Algorithm
 */
export type KeyExchangeAlgorithm = 'newhope' | 'kyber' | 'frodo' | 'ntru' | 'saber';

/**
 * Signature Algorithm
 */
export type SignatureAlgorithm = 'dilithium' | 'falcon' | 'sphincs' | 'picnic' | 'rainbow';

/**
 * Encryption Algorithm
 */
export type EncryptionAlgorithm = 'kyber' | 'ntru' | 'saber' | 'classic_mceliece';

/**
 * Lattice Parameters
 */
export interface LatticeParameters {
  dimension: number; // Lattice dimension (e.g., 512, 768, 1024)
  modulus: number; // Modulus q
  error_distribution: 'gaussian' | 'binomial' | 'uniform';
  standard_deviation?: number;
}

/**
 * Public Key
 */
export interface PublicKey {
  id: string;
  algorithm: KeyExchangeAlgorithm | SignatureAlgorithm | EncryptionAlgorithm;
  key_data: Uint8Array;
  parameters: LatticeParameters | Record<string, any>;
  security_level: SecurityLevel;
  created_at: number;
  expires_at?: number;
}

/**
 * Private Key
 */
export interface PrivateKey {
  id: string;
  algorithm: KeyExchangeAlgorithm | SignatureAlgorithm | EncryptionAlgorithm;
  key_data: Uint8Array;
  parameters: LatticeParameters | Record<string, any>;
  security_level: SecurityLevel;
  created_at: number;
  expires_at?: number;
}

/**
 * Key Pair
 */
export interface KeyPair {
  public_key: PublicKey;
  private_key: PrivateKey;
  metadata?: Record<string, any>;
}

/**
 * Encrypted Data
 */
export interface EncryptedData {
  ciphertext: Uint8Array;
  algorithm: EncryptionAlgorithm;
  nonce?: Uint8Array;
  tag?: Uint8Array;
  parameters: Record<string, any>;
  timestamp: number;
}

/**
 * Digital Signature
 */
export interface DigitalSignature {
  signature: Uint8Array;
  algorithm: SignatureAlgorithm;
  public_key_id: string;
  message_hash: Uint8Array;
  timestamp: number;
  parameters: Record<string, any>;
}

/**
 * Key Exchange Result
 */
export interface KeyExchangeResult {
  shared_secret: Uint8Array;
  algorithm: KeyExchangeAlgorithm;
  session_id: string;
  initiator_public_key: PublicKey;
  responder_public_key: PublicKey;
  parameters: Record<string, any>;
  timestamp: number;
}

/**
 * Quantum Random Number Generator Result
 */
export interface QuantumRandomBytes {
  bytes: Uint8Array;
  entropy_bits: number;
  generation_method: 'quantum_simulation' | 'pseudo_quantum' | 'hybrid';
  timestamp: number;
}

/**
 * Hybrid Encryption Scheme
 */
export interface HybridEncryptionScheme {
  post_quantum: EncryptionAlgorithm;
  classical: 'aes-256-gcm' | 'chacha20-poly1305';
  mode: 'parallel' | 'sequential';
}

/**
 * Hybrid Signature Scheme
 */
export interface HybridSignatureScheme {
  post_quantum: SignatureAlgorithm;
  classical: 'ecdsa' | 'rsa' | 'ed25519';
  mode: 'parallel' | 'sequential';
}

/**
 * Quantum Key Distribution (QKD) Session
 */
export interface QKDSession {
  id: string;
  alice_id: string;
  bob_id: string;
  protocol: 'bb84' | 'e91' | 'b92' | 'decoy_state';
  shared_key: Uint8Array;
  key_length: number;
  error_rate: number; // Quantum Bit Error Rate (QBER)
  security_parameter: number;
  started_at: number;
  completed_at?: number;
  status: 'initializing' | 'transmitting' | 'reconciliation' | 'privacy_amplification' | 'completed' | 'failed';
}

/**
 * Quantum Channel Properties
 */
export interface QuantumChannel {
  channel_id: string;
  attenuation: number; // dB/km
  noise_level: number;
  eavesdropping_detected: boolean;
  fidelity: number; // 0-1
  distance: number; // km
}

/**
 * Post-Quantum Migration Status
 */
export interface PQMigrationStatus {
  total_keys: number;
  migrated_keys: number;
  pending_keys: number;
  algorithm_distribution: Record<string, number>;
  security_level_distribution: Record<SecurityLevel, number>;
  migration_started: number;
  estimated_completion?: number;
  errors: Array<{
    key_id: string;
    error: string;
    timestamp: number;
  }>;
}

/**
 * Crypto Performance Metrics
 */
export interface CryptoMetrics {
  operation: CryptoOperation;
  algorithm: string;
  security_level: SecurityLevel;
  execution_time: number; // milliseconds
  key_size: number; // bytes
  signature_size?: number; // bytes
  ciphertext_expansion?: number; // ratio
  throughput?: number; // operations per second
  timestamp: number;
}

/**
 * NIST PQC Status
 */
export interface NISTPQCStatus {
  standardized: string[];
  finalists: string[];
  alternate_candidates: string[];
  round_4_candidates: string[];
  deprecated: string[];
  recommended: string[];
}

/**
 * Quantum Threat Assessment
 */
export interface QuantumThreatAssessment {
  current_year: number;
  quantum_advantage_estimated: number; // Year
  algorithms_at_risk: Array<{
    algorithm: string;
    risk_level: 'critical' | 'high' | 'medium' | 'low';
    time_to_break: number; // years
    recommended_replacement: string;
  }>;
  migration_urgency: 'immediate' | 'high' | 'medium' | 'low';
  recommendations: string[];
  last_updated: number;
}

/**
 * Lattice Problem
 */
export interface LatticeProblem {
  type: 'lwe' | 'rlwe' | 'mlwe' | 'sis' | 'ntru';
  dimension: number;
  modulus: number;
  error_distribution: string;
  hardness_assumption: string;
}

/**
 * Code-Based Parameters
 */
export interface CodeBasedParameters {
  code_type: 'goppa' | 'ldpc' | 'mdpc';
  code_length: number;
  code_dimension: number;
  error_correction_capacity: number;
}

/**
 * Hash-Based Parameters
 */
export interface HashBasedParameters {
  hash_function: 'sha256' | 'sha512' | 'shake256';
  tree_height: number;
  winternitz_parameter?: number;
  signature_scheme: 'xmss' | 'lms' | 'sphincs';
}

/**
 * Quantum-Safe Certificate
 */
export interface QuantumSafeCertificate {
  id: string;
  subject: string;
  issuer: string;
  public_key: PublicKey;
  signature: DigitalSignature;
  validity: {
    not_before: number;
    not_after: number;
  };
  extensions: Record<string, any>;
  algorithm: SignatureAlgorithm;
  hybrid_mode: boolean;
  classical_signature?: DigitalSignature;
}

/**
 * Quantum Crypto Configuration
 */
export interface QuantumCryptoConfig {
  default_key_exchange: KeyExchangeAlgorithm;
  default_signature: SignatureAlgorithm;
  default_encryption: EncryptionAlgorithm;
  security_level: SecurityLevel;
  enable_hybrid_mode: boolean;
  quantum_rng_enabled: boolean;
  key_rotation_interval: number; // milliseconds
  qkd_enabled: boolean;
  performance_monitoring: boolean;
}

/**
 * Key Rotation Policy
 */
export interface KeyRotationPolicy {
  rotation_interval: number; // milliseconds
  grace_period: number; // milliseconds
  max_key_age: number; // milliseconds
  auto_rotate: boolean;
  notify_before_expiry: number; // milliseconds
  backup_keys: number; // number of old keys to keep
}

/**
 * Crypto Event
 */
export interface CryptoEvent {
  id: string;
  type: 'key_generated' | 'key_exchanged' | 'data_encrypted' | 'data_decrypted' | 'signature_created' | 'signature_verified' | 'key_rotated' | 'migration_completed' | 'quantum_threat_detected';
  timestamp: number;
  user_id?: string;
  key_id?: string;
  algorithm: string;
  security_level: SecurityLevel;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Security Audit Entry
 */
export interface SecurityAuditEntry {
  id: string;
  timestamp: number;
  operation: CryptoOperation;
  algorithm: string;
  key_id: string;
  user_id?: string;
  ip_address?: string;
  success: boolean;
  error_message?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
}

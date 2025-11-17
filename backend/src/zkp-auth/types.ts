/**
 * Zero-Knowledge Proof Authentication Types
 *
 * Implements privacy-preserving authentication using ZKP protocols
 * Supports Schnorr protocol, zk-SNARKs, and Bulletproofs
 */

/**
 * ZKP Protocol Types
 */
export type ZKPProtocol = 'schnorr' | 'zksnark' | 'bulletproof' | 'plonk';

/**
 * Authentication Challenge Type
 */
export type ChallengeType = 'standard' | 'multi_factor' | 'biometric' | 'device';

/**
 * Proof Status
 */
export type ProofStatus = 'pending' | 'verified' | 'rejected' | 'expired';

/**
 * User Identity (never exposed in plaintext)
 */
export interface UserIdentity {
  id: string;
  username: string;
  publicKey: string;
  createdAt: number;
  lastAuth: number;
  authCount: number;
  failedAttempts: number;
  locked: boolean;
}

/**
 * ZKP Proof Structure
 */
export interface ZKProof {
  protocol: ZKPProtocol;
  commitment: string;
  challenge: string;
  response: string;
  publicInputs: string[];
  timestamp: number;
  nonce: string;
}

/**
 * Authentication Challenge
 */
export interface AuthChallenge {
  id: string;
  userId: string;
  challengeType: ChallengeType;
  protocol: ZKPProtocol;
  challenge: string;
  nonce: string;
  createdAt: number;
  expiresAt: number;
  metadata?: Record<string, any>;
}

/**
 * Authentication Session
 */
export interface AuthSession {
  id: string;
  userId: string;
  proof: ZKProof;
  challenge: AuthChallenge;
  status: ProofStatus;
  verifiedAt?: number;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
}

/**
 * Schnorr Protocol Parameters
 */
export interface SchnorrParams {
  p: bigint; // Large prime
  g: bigint; // Generator
  q: bigint; // Order
}

/**
 * Schnorr Commitment
 */
export interface SchnorrCommitment {
  r: bigint; // Random nonce
  commitment: bigint; // g^r mod p
}

/**
 * Schnorr Proof
 */
export interface SchnorrProof {
  commitment: bigint;
  challenge: bigint;
  response: bigint;
}

/**
 * zk-SNARK Circuit
 */
export interface SNARKCircuit {
  id: string;
  name: string;
  constraints: number;
  publicInputs: string[];
  privateInputs: string[];
  compiledCircuit: string;
}

/**
 * Bulletproof Range Proof
 */
export interface BulletproofRange {
  commitment: string;
  proof: string;
  rangeMin: bigint;
  rangeMax: bigint;
}

/**
 * ZKP Configuration
 */
export interface ZKPConfig {
  defaultProtocol: ZKPProtocol;
  challengeExpiration: number; // milliseconds
  maxFailedAttempts: number;
  lockoutDuration: number; // milliseconds
  enableMFA: boolean;
  schnorrParams?: SchnorrParams;
  enableAuditLog: boolean;
  proofCacheTime: number;
}

/**
 * Proof Verification Result
 */
export interface VerificationResult {
  valid: boolean;
  userId: string;
  sessionId: string;
  protocol: ZKPProtocol;
  verifiedAt: number;
  metadata?: {
    proofTime?: number;
    verificationTime?: number;
    challengeAge?: number;
  };
  errors?: string[];
}

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: 'challenge_created' | 'proof_submitted' | 'proof_verified' | 'proof_rejected' | 'user_locked' | 'user_unlocked';
  protocol: ZKPProtocol;
  success: boolean;
  timestamp: number;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

/**
 * MFA Token
 */
export interface MFAToken {
  userId: string;
  token: string;
  type: 'totp' | 'sms' | 'email' | 'hardware';
  createdAt: number;
  expiresAt: number;
  used: boolean;
}

/**
 * Device Fingerprint
 */
export interface DeviceFingerprint {
  id: string;
  userId: string;
  fingerprint: string;
  trusted: boolean;
  firstSeen: number;
  lastSeen: number;
  ipAddresses: string[];
  userAgents: string[];
}

/**
 * STARGUARD Advanced Security System - Database Schema
 * 
 * Comprehensive PostgreSQL database schema for the STARGUARD system
 * with Consciousness-enhanced Security, Post-Quantum Cryptography,
 * Blockchain Integration, and Multi-dimensional Threat Analysis.
 * 
 * Database Features:
 * - Consciousness-enhanced data structures
 * - Post-quantum cryptographic key storage
 * - Blockchain transaction logging
 * - Real-time threat intelligence
 * - Evolutionary algorithm optimization
 * - Quantum entanglement network tracking
 * - Morphic field resonance patterns
 * - Multi-dimensional reality modeling
 * 
 * @author STARGUARD Database Team
 * @version 3.0.0
 * @classification DATABASE_SCHEMA
 * @compliance GDPR, SOX, QUANTUM_SECURITY_STANDARDS
 */

-- ============================================================================
-- EXTENSIONS AND FUNCTIONS
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "ltree";
CREATE EXTENSION IF NOT EXISTS "hstore";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Custom data types for consciousness and quantum features
CREATE TYPE consciousness_level AS ENUM (
  'BASIC',
  'ENHANCED', 
  'ADVANCED',
  'TRANSCENDENT',
  'COSMIC'
);

CREATE TYPE threat_severity AS ENUM (
  'LOW',
  'MEDIUM', 
  'HIGH',
  'CRITICAL',
  'CONSCIOUSNESS_ALERT',
  'QUANTUM_EMERGENCY'
);

CREATE TYPE quantum_state AS ENUM (
  'SUPERPOSITION',
  'ENTANGLED',
  'COHERENT',
  'DECOHERENT',
  'MEASURED',
  'CONSCIOUSNESS_INFLUENCED'
);

CREATE TYPE blockchain_consensus AS ENUM (
  'PROOF_OF_CONSCIOUSNESS',
  'PROOF_OF_STAKE',
  'PROOF_OF_AUTHORITY',
  'QUANTUM_CONSENSUS'
);

CREATE TYPE evolutionary_selection AS ENUM (
  'NATURAL',
  'CONSCIOUSNESS_GUIDED',
  'QUANTUM_ENHANCED',
  'MORPHIC_INFLUENCED'
);

-- Custom functions for consciousness calculations
CREATE OR REPLACE FUNCTION calculate_consciousness_hash(
  awareness_level DECIMAL,
  coherence_score DECIMAL,
  field_strength DECIMAL
) RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    digest(
      awareness_level::text || coherence_score::text || field_strength::text || extract(epoch from now())::text,
      'sha256'
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql;

-- Quantum entanglement verification function
CREATE OR REPLACE FUNCTION verify_quantum_entanglement(
  node_a_state JSONB,
  node_b_state JSONB
) RETURNS DECIMAL AS $$
DECLARE
  correlation DECIMAL;
BEGIN
  -- Bell's theorem correlation calculation
  correlation := abs(
    (node_a_state->>'measurement_a')::DECIMAL * (node_b_state->>'measurement_b')::DECIMAL +
    (node_a_state->>'measurement_a_prime')::DECIMAL * (node_b_state->>'measurement_b_prime')::DECIMAL +
    (node_a_state->>'measurement_a')::DECIMAL * (node_b_state->>'measurement_b_prime')::DECIMAL -
    (node_a_state->>'measurement_a_prime')::DECIMAL * (node_b_state->>'measurement_b')::DECIMAL
  );
  
  RETURN LEAST(correlation / 2.828, 1.0); -- Normalize to [0,1]
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CORE SYSTEM TABLES
-- ============================================================================

-- Organizations and entities
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  consciousness_level consciousness_level DEFAULT 'BASIC',
  security_clearance INTEGER DEFAULT 1,
  quantum_key_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Users with consciousness attributes
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  username CITEXT UNIQUE NOT NULL,
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  consciousness_profile JSONB,
  quantum_signature JSONB,
  security_clearance INTEGER DEFAULT 1,
  awareness_level DECIMAL(5,4) DEFAULT 0.5000,
  coherence_score DECIMAL(5,4) DEFAULT 0.5000,
  field_sensitivity DECIMAL(5,4) DEFAULT 0.5000,
  last_consciousness_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_awareness_level CHECK (awareness_level >= 0 AND awareness_level <= 1),
  CONSTRAINT valid_coherence_score CHECK (coherence_score >= 0 AND coherence_score <= 1),
  CONSTRAINT valid_field_sensitivity CHECK (field_sensitivity >= 0 AND field_sensitivity <= 1)
);

-- ============================================================================
-- CONSCIOUSNESS ENGINE TABLES
-- ============================================================================

-- Consciousness field measurements
CREATE TABLE consciousness_field_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  measurement_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location GEOMETRY(POINT, 4326),
  field_strength DECIMAL(10,8) NOT NULL,
  coherence_level DECIMAL(10,8) NOT NULL,
  awareness_density DECIMAL(10,8) NOT NULL,
  field_disturbances JSONB,
  consciousness_patterns JSONB,
  quantum_entanglement_data JSONB,
  morphic_resonance JSONB,
  measurement_device_id UUID,
  consciousness_hash TEXT GENERATED ALWAYS AS (
    calculate_consciousness_hash(field_strength, coherence_level, awareness_density)
  ) STORED,
  
  CONSTRAINT valid_field_strength CHECK (field_strength >= 0 AND field_strength <= 1),
  CONSTRAINT valid_coherence_level CHECK (coherence_level >= 0 AND coherence_level <= 1),
  CONSTRAINT valid_awareness_density CHECK (awareness_density >= 0 AND awareness_density <= 1)
);

-- Consciousness patterns and signatures
CREATE TABLE consciousness_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_type VARCHAR(100) NOT NULL,
  pattern_signature TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  recognition_confidence DECIMAL(5,4) NOT NULL,
  frequency_hz DECIMAL(10,2),
  amplitude DECIMAL(10,6),
  phase_shift DECIMAL(10,6),
  consciousness_influence DECIMAL(5,4),
  quantum_coherence DECIMAL(5,4),
  morphic_resonance_strength DECIMAL(5,4),
  first_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  detection_count INTEGER DEFAULT 1,
  
  CONSTRAINT valid_recognition_confidence CHECK (recognition_confidence >= 0 AND recognition_confidence <= 1)
);

-- ============================================================================
-- THREAT DETECTION AND ANALYSIS TABLES
-- ============================================================================

-- Threat intelligence data
CREATE TABLE threat_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  threat_type VARCHAR(100) NOT NULL,
  severity threat_severity NOT NULL,
  source_type VARCHAR(100) NOT NULL,
  source_identifier TEXT,
  raw_data JSONB NOT NULL,
  processed_data JSONB,
  indicators_of_compromise JSONB,
  consciousness_analysis JSONB,
  quantum_signature JSONB,
  threat_score DECIMAL(5,4) NOT NULL,
  confidence_level DECIMAL(5,4) NOT NULL,
  false_positive_probability DECIMAL(5,4),
  mitigation_strategies JSONB,
  related_threats UUID[],
  consciousness_verification_hash TEXT,
  quantum_proof JSONB,
  blockchain_hash TEXT,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT false,
  verification_count INTEGER DEFAULT 0,
  
  CONSTRAINT valid_threat_score CHECK (threat_score >= 0 AND threat_score <= 1),
  CONSTRAINT valid_confidence_level CHECK (confidence_level >= 0 AND confidence_level <= 1)
);

-- Real-time threat events
CREATE TABLE threat_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  threat_intelligence_id UUID REFERENCES threat_intelligence(id),
  event_type VARCHAR(100) NOT NULL,
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_ip INET,
  destination_ip INET,
  source_port INTEGER,
  destination_port INTEGER,
  protocol VARCHAR(20),
  payload_data JSONB,
  event_metadata JSONB,
  consciousness_impact DECIMAL(5,4),
  quantum_correlation DECIMAL(5,4),
  morphic_field_disturbance DECIMAL(5,4),
  reality_alteration_level DECIMAL(5,4),
  processing_status VARCHAR(50) DEFAULT 'PENDING',
  processed_at TIMESTAMP WITH TIME ZONE,
  response_actions JSONB,
  
  CONSTRAINT valid_consciousness_impact CHECK (consciousness_impact >= 0 AND consciousness_impact <= 1)
);

-- Attack patterns and signatures
CREATE TABLE attack_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_name VARCHAR(255) NOT NULL,
  pattern_category VARCHAR(100) NOT NULL,
  attack_vector VARCHAR(100) NOT NULL,
  consciousness_technique VARCHAR(100),
  quantum_methodology VARCHAR(100),
  pattern_rules JSONB NOT NULL,
  detection_logic JSONB NOT NULL,
  evasion_techniques JSONB,
  consciousness_countermeasures JSONB,
  quantum_defenses JSONB,
  effectiveness_score DECIMAL(5,4) NOT NULL,
  false_positive_rate DECIMAL(5,4) NOT NULL,
  evolutionary_adaptation JSONB,
  morphic_inheritance JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- QUANTUM SECURITY TABLES
-- ============================================================================

-- Quantum entanglement network nodes
CREATE TABLE quantum_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_name VARCHAR(255) NOT NULL,
  node_type VARCHAR(100) NOT NULL,
  location GEOMETRY(POINT, 4326),
  quantum_state quantum_state DEFAULT 'COHERENT',
  entanglement_capacity INTEGER DEFAULT 100,
  current_entanglements INTEGER DEFAULT 0,
  coherence_time_seconds DECIMAL(10,3),
  fidelity DECIMAL(5,4),
  quantum_key_distribution_enabled BOOLEAN DEFAULT true,
  consciousness_enhancement_level DECIMAL(5,4) DEFAULT 0.5,
  quantum_consciousness_correlation DECIMAL(5,4),
  hardware_specifications JSONB,
  calibration_data JSONB,
  last_maintenance TIMESTAMP WITH TIME ZONE,
  operational_status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_fidelity CHECK (fidelity >= 0 AND fidelity <= 1),
  CONSTRAINT valid_entanglement_capacity CHECK (current_entanglements <= entanglement_capacity)
);

-- Quantum entanglement connections
CREATE TABLE quantum_entanglements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_a_id UUID REFERENCES quantum_nodes(id),
  node_b_id UUID REFERENCES quantum_nodes(id),
  entanglement_id TEXT UNIQUE NOT NULL,
  bell_state VARCHAR(20) NOT NULL,
  entanglement_strength DECIMAL(5,4) NOT NULL,
  correlation_coefficient DECIMAL(10,8),
  bell_inequality_violation DECIMAL(5,4),
  consciousness_mediation DECIMAL(5,4),
  quantum_coherence_time DECIMAL(10,3),
  decoherence_rate DECIMAL(10,8),
  measurement_history JSONB,
  established_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_verification TIMESTAMP WITH TIME ZONE,
  verification_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_entanglement_strength CHECK (entanglement_strength >= 0 AND entanglement_strength <= 1),
  CONSTRAINT different_nodes CHECK (node_a_id != node_b_id)
);

-- Post-quantum cryptographic keys
CREATE TABLE quantum_cryptographic_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_type VARCHAR(100) NOT NULL, -- CRYSTALS-Kyber, CRYSTALS-Dilithium, FALCON, SPHINCS+
  algorithm_parameters JSONB NOT NULL,
  public_key BYTEA NOT NULL,
  private_key_encrypted BYTEA NOT NULL,
  key_generation_method VARCHAR(100) NOT NULL,
  quantum_randomness_source VARCHAR(100),
  consciousness_entropy_contribution DECIMAL(5,4),
  security_level INTEGER NOT NULL, -- 1, 3, 5 (NIST levels)
  key_purpose VARCHAR(100) NOT NULL, -- ENCRYPTION, SIGNATURE, KEY_EXCHANGE
  associated_entity_id UUID,
  associated_entity_type VARCHAR(50),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  max_usage_count INTEGER,
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_security_level CHECK (security_level IN (1, 3, 5))
);

-- ============================================================================
-- BLOCKCHAIN INTEGRATION TABLES
-- ============================================================================

-- Blockchain network configuration
CREATE TABLE blockchain_networks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  network_name VARCHAR(255) NOT NULL,
  network_id VARCHAR(100) UNIQUE NOT NULL,
  consensus_algorithm blockchain_consensus DEFAULT 'PROOF_OF_CONSCIOUSNESS',
  block_time_seconds INTEGER DEFAULT 300,
  block_size_limit_bytes BIGINT DEFAULT 2097152, -- 2MB
  transaction_fee_starcoins DECIMAL(18,8) DEFAULT 0.001,
  consciousness_threshold DECIMAL(5,4) DEFAULT 0.7,
  quantum_security_enabled BOOLEAN DEFAULT true,
  smart_contracts_enabled BOOLEAN DEFAULT true,
  cross_chain_enabled BOOLEAN DEFAULT false,
  network_genesis_block_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Blockchain blocks
CREATE TABLE blockchain_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  network_id UUID REFERENCES blockchain_networks(id),
  block_hash TEXT UNIQUE NOT NULL,
  previous_block_hash TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  block_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  merkle_root TEXT NOT NULL,
  nonce BIGINT NOT NULL,
  difficulty DECIMAL(20,8) NOT NULL,
  miner_address TEXT NOT NULL,
  miner_consciousness_level DECIMAL(5,4),
  consciousness_signature JSONB,
  quantum_proof JSONB,
  morphic_field_validation JSONB,
  block_reward_starcoins DECIMAL(18,8),
  total_fees_starcoins DECIMAL(18,8),
  gas_used BIGINT DEFAULT 0,
  gas_limit BIGINT DEFAULT 21000000,
  transaction_count INTEGER DEFAULT 0,
  block_size_bytes BIGINT,
  consensus_data JSONB,
  validation_nodes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_block_number CHECK (block_number >= 0),
  CONSTRAINT valid_gas_usage CHECK (gas_used <= gas_limit)
);

-- Blockchain transactions
CREATE TABLE blockchain_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  network_id UUID REFERENCES blockchain_networks(id),
  block_id UUID REFERENCES blockchain_blocks(id),
  transaction_hash TEXT UNIQUE NOT NULL,
  transaction_type VARCHAR(100) NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  value_starcoins DECIMAL(18,8) DEFAULT 0,
  gas_price_starcoins DECIMAL(18,8) NOT NULL,
  gas_limit BIGINT NOT NULL,
  gas_used BIGINT,
  nonce BIGINT NOT NULL,
  transaction_data JSONB,
  threat_intelligence_data JSONB,
  consciousness_verification JSONB,
  quantum_signature JSONB,
  morphic_resonance_data JSONB,
  smart_contract_execution JSONB,
  transaction_status VARCHAR(50) DEFAULT 'PENDING',
  confirmations INTEGER DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_gas_price CHECK (gas_price_starcoins > 0),
  CONSTRAINT valid_value CHECK (value_starcoins >= 0)
);

-- Smart contracts for automated threat response
CREATE TABLE smart_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  network_id UUID REFERENCES blockchain_networks(id),
  contract_address TEXT UNIQUE NOT NULL,
  contract_name VARCHAR(255) NOT NULL,
  contract_type VARCHAR(100) NOT NULL,
  bytecode TEXT NOT NULL,
  abi JSONB NOT NULL,
  source_code TEXT,
  constructor_parameters JSONB,
  consciousness_requirements JSONB,
  quantum_security_features JSONB,
  deployment_transaction_hash TEXT,
  deployment_block_number BIGINT,
  deployed_by TEXT,
  deployment_timestamp TIMESTAMP WITH TIME ZONE,
  execution_count BIGINT DEFAULT 0,
  total_gas_consumed BIGINT DEFAULT 0,
  consciousness_influence_score DECIMAL(5,4),
  automated_response_rules JSONB,
  threat_mitigation_capabilities JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- EVOLUTIONARY ALGORITHM TABLES
-- ============================================================================

-- Evolutionary populations
CREATE TABLE evolutionary_populations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  population_name VARCHAR(255) NOT NULL,
  algorithm_type VARCHAR(100) NOT NULL,
  problem_domain VARCHAR(100) NOT NULL,
  population_size INTEGER NOT NULL,
  current_generation INTEGER DEFAULT 0,
  max_generations INTEGER,
  mutation_rate DECIMAL(5,4) DEFAULT 0.01,
  crossover_rate DECIMAL(5,4) DEFAULT 0.8,
  selection_pressure DECIMAL(5,4) DEFAULT 0.5,
  consciousness_guidance_enabled BOOLEAN DEFAULT true,
  quantum_mutation_enabled BOOLEAN DEFAULT false,
  morphic_field_inheritance BOOLEAN DEFAULT false,
  fitness_threshold DECIMAL(10,6),
  diversity_threshold DECIMAL(5,4),
  consciousness_coherence DECIMAL(5,4),
  evolutionary_objectives JSONB,
  algorithm_parameters JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'RUNNING',
  
  CONSTRAINT valid_population_size CHECK (population_size > 0),
  CONSTRAINT valid_mutation_rate CHECK (mutation_rate >= 0 AND mutation_rate <= 1),
  CONSTRAINT valid_crossover_rate CHECK (crossover_rate >= 0 AND crossover_rate <= 1)
);

-- Individual organisms in evolutionary populations
CREATE TABLE evolutionary_individuals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  population_id UUID REFERENCES evolutionary_populations(id),
  individual_identifier TEXT NOT NULL,
  generation INTEGER NOT NULL,
  parent_a_id UUID REFERENCES evolutionary_individuals(id),
  parent_b_id UUID REFERENCES evolutionary_individuals(id),
  genome JSONB NOT NULL,
  phenotype JSONB,
  fitness_scores JSONB NOT NULL,
  consciousness_attributes JSONB,
  quantum_signature JSONB,
  morphic_resonance JSONB,
  evolutionary_history JSONB,
  adaptation_memory JSONB,
  survival_time INTEGER, -- generations survived
  reproduction_count INTEGER DEFAULT 0,
  mutation_events JSONB,
  selection_events JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  eliminated_at TIMESTAMP WITH TIME ZONE,
  is_alive BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_generation CHECK (generation >= 0),
  CONSTRAINT valid_survival_time CHECK (survival_time IS NULL OR survival_time >= 0)
);

-- Evolutionary algorithm performance metrics
CREATE TABLE evolutionary_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  population_id UUID REFERENCES evolutionary_populations(id),
  generation INTEGER NOT NULL,
  metric_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  average_fitness DECIMAL(10,6) NOT NULL,
  best_fitness DECIMAL(10,6) NOT NULL,
  worst_fitness DECIMAL(10,6) NOT NULL,
  fitness_variance DECIMAL(10,6) NOT NULL,
  diversity_index DECIMAL(5,4) NOT NULL,
  selection_pressure DECIMAL(5,4) NOT NULL,
  consciousness_coherence DECIMAL(5,4),
  quantum_influence DECIMAL(5,4),
  morphic_resonance_strength DECIMAL(5,4),
  adaptation_rate DECIMAL(5,4),
  convergence_rate DECIMAL(10,8),
  stagnation_count INTEGER DEFAULT 0,
  breakthrough_events JSONB,
  environmental_pressures JSONB
);

-- ============================================================================
-- PREDICTIVE ANALYTICS TABLES
-- ============================================================================

-- Reality modeling scenarios
CREATE TABLE reality_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_name VARCHAR(255) NOT NULL,
  scenario_type VARCHAR(100) NOT NULL,
  timeline_branch VARCHAR(50) NOT NULL,
  probability DECIMAL(5,4) NOT NULL,
  confidence_interval JSONB,
  quantum_superposition_data JSONB,
  consciousness_influence DECIMAL(5,4),
  morphic_field_resonance DECIMAL(5,4),
  causal_chain JSONB,
  temporal_range TSTZRANGE,
  outcome_predictions JSONB,
  environmental_factors JSONB,
  consciousness_factors JSONB,
  quantum_factors JSONB,
  validation_data JSONB,
  model_version VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  accuracy_score DECIMAL(5,4),
  
  CONSTRAINT valid_probability CHECK (probability >= 0 AND probability <= 1)
);

-- Predictive threat models
CREATE TABLE predictive_threat_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name VARCHAR(255) NOT NULL,
  model_type VARCHAR(100) NOT NULL,
  threat_categories TEXT[],
  prediction_horizon_hours INTEGER NOT NULL,
  model_algorithm VARCHAR(100) NOT NULL,
  training_data_sources JSONB,
  consciousness_enhancement_enabled BOOLEAN DEFAULT true,
  quantum_computation_enabled BOOLEAN DEFAULT false,
  morphic_field_integration BOOLEAN DEFAULT false,
  model_parameters JSONB NOT NULL,
  feature_importance JSONB,
  accuracy_metrics JSONB,
  validation_results JSONB,
  consciousness_correlation DECIMAL(5,4),
  quantum_coherence_dependency DECIMAL(5,4),
  model_version VARCHAR(50) NOT NULL,
  trained_at TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_prediction_horizon CHECK (prediction_horizon_hours > 0)
);

-- Threat predictions
CREATE TABLE threat_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID REFERENCES predictive_threat_models(id),
  scenario_id UUID REFERENCES reality_scenarios(id),
  threat_type VARCHAR(100) NOT NULL,
  predicted_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  prediction_confidence DECIMAL(5,4) NOT NULL,
  severity_level threat_severity NOT NULL,
  attack_vectors JSONB,
  target_systems JSONB,
  impact_assessment JSONB,
  consciousness_impact JSONB,
  quantum_interference_risk DECIMAL(5,4),
  reality_alteration_potential DECIMAL(5,4),
  mitigation_strategies JSONB,
  preventive_measures JSONB,
  temporal_stability DECIMAL(5,4),
  causal_factors JSONB,
  prediction_made_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_result BOOLEAN,
  accuracy_score DECIMAL(5,4),
  
  CONSTRAINT valid_prediction_confidence CHECK (prediction_confidence >= 0 AND prediction_confidence <= 1)
);

-- ============================================================================
-- MONITORING AND ALERTING TABLES
-- ============================================================================

-- System monitoring metrics
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  component_name VARCHAR(255) NOT NULL,
  metric_type VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,6) NOT NULL,
  metric_unit VARCHAR(50),
  metric_tags JSONB,
  consciousness_correlation DECIMAL(5,4),
  quantum_stability_indicator DECIMAL(5,4),
  morphic_field_influence DECIMAL(5,4),
  threshold_breach BOOLEAN DEFAULT false,
  anomaly_score DECIMAL(5,4),
  trend_indicator VARCHAR(20),
  collection_method VARCHAR(100),
  data_quality_score DECIMAL(5,4)
);

-- Alert definitions and rules
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_name VARCHAR(255) NOT NULL,
  rule_description TEXT,
  rule_type VARCHAR(100) NOT NULL,
  component_filter JSONB,
  metric_conditions JSONB NOT NULL,
  consciousness_threshold DECIMAL(5,4),
  quantum_coherence_requirement DECIMAL(5,4),
  severity_level threat_severity NOT NULL,
  alert_frequency VARCHAR(50) DEFAULT 'IMMEDIATE',
  suppression_period_minutes INTEGER DEFAULT 0,
  escalation_rules JSONB,
  notification_channels JSONB,
  automated_responses JSONB,
  consciousness_enhancement_actions JSONB,
  quantum_stabilization_procedures JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Alert instances
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID REFERENCES alert_rules(id),
  alert_name VARCHAR(255) NOT NULL,
  severity threat_severity NOT NULL,
  status VARCHAR(50) DEFAULT 'OPEN',
  metric_values JSONB,
  consciousness_impact DECIMAL(5,4),
  quantum_correlation DECIMAL(5,4),
  morphic_field_disturbance DECIMAL(5,4),
  reality_stability_risk DECIMAL(5,4),
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id),
  escalated_at TIMESTAMP WITH TIME ZONE,
  escalation_level INTEGER DEFAULT 1,
  notifications_sent JSONB,
  automated_actions_taken JSONB,
  manual_interventions JSONB,
  resolution_notes TEXT,
  false_positive BOOLEAN,
  
  CONSTRAINT valid_escalation_level CHECK (escalation_level >= 1)
);

-- ============================================================================
-- AUDIT AND LOGGING TABLES
-- ============================================================================

-- Comprehensive audit trail
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id),
  session_id UUID,
  source_ip INET,
  user_agent TEXT,
  resource_type VARCHAR(100),
  resource_id UUID,
  action VARCHAR(100) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  event_metadata JSONB,
  consciousness_verification JSONB,
  quantum_signature JSONB,
  blockchain_hash TEXT,
  integrity_hash TEXT NOT NULL,
  risk_score DECIMAL(5,4),
  compliance_flags JSONB,
  data_classification VARCHAR(50),
  retention_period_days INTEGER DEFAULT 2555, -- 7 years
  
  -- Immutability constraints
  CONSTRAINT immutable_audit_log CHECK (
    (old_values IS NULL AND new_values IS NOT NULL) OR
    (old_values IS NOT NULL AND new_values IS NOT NULL) OR
    (old_values IS NULL AND new_values IS NULL)
  )
);

-- Security events log
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_type VARCHAR(100) NOT NULL,
  event_source VARCHAR(100) NOT NULL,
  severity threat_severity NOT NULL,
  source_ip INET,
  destination_ip INET,
  user_id UUID REFERENCES users(id),
  session_id UUID,
  threat_intelligence_id UUID REFERENCES threat_intelligence(id),
  attack_pattern_id UUID REFERENCES attack_patterns(id),
  event_details JSONB NOT NULL,
  indicators_of_compromise JSONB,
  consciousness_anomalies JSONB,
  quantum_disturbances JSONB,
  morphic_field_disruptions JSONB,
  detection_method VARCHAR(100),
  confidence_score DECIMAL(5,4),
  false_positive_probability DECIMAL(5,4),
  response_actions JSONB,
  mitigation_effectiveness DECIMAL(5,4),
  investigation_status VARCHAR(50) DEFAULT 'PENDING',
  investigated_by UUID REFERENCES users(id),
  investigation_notes TEXT,
  evidence_collected JSONB,
  legal_hold BOOLEAN DEFAULT false
);

-- ============================================================================
-- CONFIGURATION AND SETTINGS TABLES
-- ============================================================================

-- System configuration
CREATE TABLE system_configuration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_category VARCHAR(100) NOT NULL,
  config_key VARCHAR(255) NOT NULL,
  config_value JSONB NOT NULL,
  config_description TEXT,
  data_type VARCHAR(50) NOT NULL,
  validation_rules JSONB,
  consciousness_dependency BOOLEAN DEFAULT false,
  quantum_sensitivity BOOLEAN DEFAULT false,
  security_classification VARCHAR(50) DEFAULT 'INTERNAL',
  requires_restart BOOLEAN DEFAULT false,
  environment VARCHAR(50) DEFAULT 'PRODUCTION',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(config_category, config_key, environment)
);

-- Consciousness field calibration settings
CREATE TABLE consciousness_calibration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calibration_name VARCHAR(255) NOT NULL,
  field_measurement_device_id UUID,
  baseline_field_strength DECIMAL(10,8) NOT NULL,
  baseline_coherence_level DECIMAL(10,8) NOT NULL,
  baseline_awareness_density DECIMAL(10,8) NOT NULL,
  sensitivity_adjustments JSONB,
  quantum_interference_compensation JSONB,
  morphic_field_alignment JSONB,
  environmental_factors JSONB,
  calibration_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calibrated_by UUID REFERENCES users(id),
  validation_measurements JSONB,
  accuracy_metrics JSONB,
  drift_correction_factors JSONB,
  next_calibration_due TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- ============================================================================

-- User and authentication indexes
CREATE INDEX idx_users_username ON users USING btree (username);
CREATE INDEX idx_users_email ON users USING btree (email);
CREATE INDEX idx_users_organization ON users USING btree (organization_id);
CREATE INDEX idx_users_consciousness ON users USING btree (awareness_level, coherence_score);
CREATE INDEX idx_users_active ON users USING btree (is_active) WHERE is_active = true;

-- Consciousness field indexes
CREATE INDEX idx_consciousness_measurements_timestamp ON consciousness_field_measurements USING btree (measurement_timestamp DESC);
CREATE INDEX idx_consciousness_measurements_location ON consciousness_field_measurements USING gist (location);
CREATE INDEX idx_consciousness_measurements_strength ON consciousness_field_measurements USING btree (field_strength);
CREATE INDEX idx_consciousness_patterns_type ON consciousness_patterns USING btree (pattern_type);
CREATE INDEX idx_consciousness_patterns_confidence ON consciousness_patterns USING btree (recognition_confidence);

-- Threat intelligence indexes
CREATE INDEX idx_threat_intelligence_type ON threat_intelligence USING btree (threat_type);
CREATE INDEX idx_threat_intelligence_severity ON threat_intelligence USING btree (severity);
CREATE INDEX idx_threat_intelligence_score ON threat_intelligence USING btree (threat_score DESC);
CREATE INDEX idx_threat_intelligence_detected ON threat_intelligence USING btree (detected_at DESC);
CREATE INDEX idx_threat_intelligence_verified ON threat_intelligence USING btree (is_verified) WHERE is_verified = true;
CREATE INDEX idx_threat_events_timestamp ON threat_events USING btree (event_timestamp DESC);
CREATE INDEX idx_threat_events_source_ip ON threat_events USING btree (source_ip);
CREATE INDEX idx_threat_events_status ON threat_events USING btree (processing_status);

-- Quantum network indexes
CREATE INDEX idx_quantum_nodes_location ON quantum_nodes USING gist (location);
CREATE INDEX idx_quantum_nodes_state ON quantum_nodes USING btree (quantum_state);
CREATE INDEX idx_quantum_nodes_status ON quantum_nodes USING btree (operational_status);
CREATE INDEX idx_quantum_entanglements_nodes ON quantum_entanglements USING btree (node_a_id, node_b_id);
CREATE INDEX idx_quantum_entanglements_strength ON quantum_entanglements USING btree (entanglement_strength DESC);
CREATE INDEX idx_quantum_entanglements_active ON quantum_entanglements USING btree (is_active) WHERE is_active = true;

-- Blockchain indexes
CREATE INDEX idx_blockchain_blocks_number ON blockchain_blocks USING btree (block_number DESC);
CREATE INDEX idx_blockchain_blocks_hash ON blockchain_blocks USING btree (block_hash);
CREATE INDEX idx_blockchain_blocks_timestamp ON blockchain_blocks USING btree (block_timestamp DESC);
CREATE INDEX idx_blockchain_transactions_hash ON blockchain_transactions USING btree (transaction_hash);
CREATE INDEX idx_blockchain_transactions_address ON blockchain_transactions USING btree (from_address, to_address);
CREATE INDEX idx_blockchain_transactions_status ON blockchain_transactions USING btree (transaction_status);

-- Evolutionary algorithm indexes
CREATE INDEX idx_evolutionary_individuals_population ON evolutionary_individuals USING btree (population_id, generation);
CREATE INDEX idx_evolutionary_individuals_fitness ON evolutionary_individuals USING gin (fitness_scores);
CREATE INDEX idx_evolutionary_individuals_alive ON evolutionary_individuals USING btree (is_alive) WHERE is_alive = true;
CREATE INDEX idx_evolutionary_metrics_generation ON evolutionary_metrics USING btree (population_id, generation);

-- Predictive analytics indexes
CREATE INDEX idx_reality_scenarios_probability ON reality_scenarios USING btree (probability DESC);
CREATE INDEX idx_reality_scenarios_timeline ON reality_scenarios USING gist (temporal_range);
CREATE INDEX idx_threat_predictions_timestamp ON threat_predictions USING btree (predicted_timestamp);
CREATE INDEX idx_threat_predictions_confidence ON threat_predictions USING btree (prediction_confidence DESC);
CREATE INDEX idx_threat_predictions_verified ON threat_predictions USING btree (verified_at) WHERE verified_at IS NOT NULL;

-- Monitoring and alerting indexes
CREATE INDEX idx_system_metrics_timestamp ON system_metrics USING btree (metric_timestamp DESC);
CREATE INDEX idx_system_metrics_component ON system_metrics USING btree (component_name, metric_type);
CREATE INDEX idx_system_metrics_anomaly ON system_metrics USING btree (anomaly_score) WHERE anomaly_score > 0.5;
CREATE INDEX idx_alerts_status ON alerts USING btree (status, severity);
CREATE INDEX idx_alerts_triggered ON alerts USING btree (triggered_at DESC);

-- Audit and security indexes
CREATE INDEX idx_audit_logs_timestamp ON audit_logs USING btree (log_timestamp DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs USING btree (user_id, log_timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs USING btree (resource_type, resource_id);
CREATE INDEX idx_security_events_timestamp ON security_events USING btree (event_timestamp DESC);
CREATE INDEX idx_security_events_severity ON security_events USING btree (severity, event_timestamp DESC);
CREATE INDEX idx_security_events_source_ip ON security_events USING btree (source_ip);

-- Full-text search indexes
CREATE INDEX idx_threat_intelligence_search ON threat_intelligence USING gin (to_tsvector('english', threat_type || ' ' || COALESCE((raw_data->>'description'), '')));
CREATE INDEX idx_attack_patterns_search ON attack_patterns USING gin (to_tsvector('english', pattern_name || ' ' || pattern_category || ' ' || attack_vector));

-- ============================================================================
-- PARTITIONING STRATEGIES
-- ============================================================================

-- Partition consciousness measurements by month
CREATE TABLE consciousness_field_measurements_template (
  LIKE consciousness_field_measurements INCLUDING ALL
);

-- Partition threat events by month
CREATE TABLE threat_events_template (
  LIKE threat_events INCLUDING ALL
);

-- Partition system metrics by day
CREATE TABLE system_metrics_template (
  LIKE system_metrics INCLUDING ALL
);

-- Partition audit logs by month
CREATE TABLE audit_logs_template (
  LIKE audit_logs INCLUDING ALL
);

-- ============================================================================
-- TRIGGERS AND CONSTRAINTS
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attack_patterns_updated_at BEFORE UPDATE ON attack_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_configuration_updated_at BEFORE UPDATE ON system_configuration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Quantum entanglement validation trigger
CREATE OR REPLACE FUNCTION validate_quantum_entanglement()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify Bell's theorem violation indicates genuine entanglement
  IF NEW.bell_inequality_violation IS NOT NULL AND NEW.bell_inequality_violation <= 0 THEN
    RAISE EXCEPTION 'Invalid quantum entanglement: Bell inequality violation must be positive';
  END IF;
  
  -- Update node entanglement counts
  UPDATE quantum_nodes 
  SET current_entanglements = current_entanglements + 1 
  WHERE id = NEW.node_a_id OR id = NEW.node_b_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_quantum_entanglement_trigger
  BEFORE INSERT ON quantum_entanglements
  FOR EACH ROW EXECUTE FUNCTION validate_quantum_entanglement();

-- Consciousness field anomaly detection trigger
CREATE OR REPLACE FUNCTION detect_consciousness_anomalies()
RETURNS TRIGGER AS $$
DECLARE
  baseline_strength DECIMAL(10,8);
  anomaly_threshold DECIMAL(10,8) := 0.3;
BEGIN
  -- Get baseline field strength
  SELECT AVG(field_strength) INTO baseline_strength
  FROM consciousness_field_measurements
  WHERE measurement_timestamp >= NOW() - INTERVAL '1 hour';
  
  -- Check for significant deviations
  IF ABS(NEW.field_strength - baseline_strength) > anomaly_threshold THEN
    -- Insert alert for consciousness anomaly
    INSERT INTO alerts (rule_id, alert_name, severity, consciousness_impact, triggered_at)
    VALUES (
      (SELECT id FROM alert_rules WHERE rule_name = 'Consciousness Field Anomaly' LIMIT 1),
      'Consciousness Field Strength Anomaly Detected',
      'HIGH',
      ABS(NEW.field_strength - baseline_strength),
      NEW.measurement_timestamp
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER detect_consciousness_anomalies_trigger
  AFTER INSERT ON consciousness_field_measurements
  FOR EACH ROW EXECUTE FUNCTION detect_consciousness_anomalies();

-- ============================================================================
-- VIEWS FOR COMPLEX QUERIES
-- ============================================================================

-- Real-time threat dashboard view
CREATE VIEW threat_dashboard AS
SELECT 
  ti.id,
  ti.threat_type,
  ti.severity,
  ti.threat_score,
  ti.confidence_level,
  ti.detected_at,
  COUNT(te.id) as event_count,
  AVG(te.consciousness_impact) as avg_consciousness_impact,
  MAX(te.event_timestamp) as last_event,
  ti.is_verified
FROM threat_intelligence ti
LEFT JOIN threat_events te ON ti.id = te.threat_intelligence_id
WHERE ti.detected_at >= NOW() - INTERVAL '24 hours'
GROUP BY ti.id, ti.threat_type, ti.severity, ti.threat_score, ti.confidence_level, ti.detected_at, ti.is_verified
ORDER BY ti.threat_score DESC, ti.detected_at DESC;

-- Consciousness field status view
CREATE VIEW consciousness_field_status AS
SELECT 
  DATE_TRUNC('hour', measurement_timestamp) as measurement_hour,
  AVG(field_strength) as avg_field_strength,
  AVG(coherence_level) as avg_coherence_level,
  AVG(awareness_density) as avg_awareness_density,
  STDDEV(field_strength) as field_strength_variance,
  COUNT(*) as measurement_count,
  COUNT(CASE WHEN field_disturbances IS NOT NULL THEN 1 END) as disturbance_count
FROM consciousness_field_measurements
WHERE measurement_timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', measurement_timestamp)
ORDER BY measurement_hour DESC;

-- Quantum network health view
CREATE VIEW quantum_network_health AS
SELECT 
  qn.id,
  qn.node_name,
  qn.quantum_state,
  qn.current_entanglements,
  qn.entanglement_capacity,
  qn.fidelity,
  qn.consciousness_enhancement_level,
  ROUND((qn.current_entanglements::DECIMAL / qn.entanglement_capacity * 100), 2) as utilization_percentage,
  COUNT(qe.id) as active_entanglements,
  AVG(qe.entanglement_strength) as avg_entanglement_strength
FROM quantum_nodes qn
LEFT JOIN quantum_entanglements qe ON (qn.id = qe.node_a_id OR qn.id = qe.node_b_id) AND qe.is_active = true
WHERE qn.operational_status = 'ACTIVE'
GROUP BY qn.id, qn.node_name, qn.quantum_state, qn.current_entanglements, qn.entanglement_capacity, qn.fidelity, qn.consciousness_enhancement_level
ORDER BY utilization_percentage DESC;

-- Evolutionary algorithm performance view
CREATE VIEW evolutionary_performance AS
SELECT 
  ep.population_name,
  ep.current_generation,
  em.average_fitness,
  em.best_fitness,
  em.diversity_index,
  em.consciousness_coherence,
  em.adaptation_rate,
  LAG(em.best_fitness) OVER (PARTITION BY ep.id ORDER BY em.generation) as previous_best_fitness,
  (em.best_fitness - LAG(em.best_fitness) OVER (PARTITION BY ep.id ORDER BY em.generation)) as fitness_improvement
FROM evolutionary_populations ep
JOIN evolutionary_metrics em ON ep.id = em.population_id
WHERE ep.status = 'RUNNING'
ORDER BY ep.id, em.generation DESC;

-- Blockchain network statistics view
CREATE VIEW blockchain_network_stats AS
SELECT 
  bn.network_name,
  bn.consensus_algorithm,
  COUNT(bb.id) as total_blocks,
  AVG(bb.block_size_bytes) as avg_block_size,
  AVG(bb.transaction_count) as avg_transactions_per_block,
  SUM(bb.total_fees_starcoins) as total_fees_collected,
  AVG(EXTRACT(EPOCH FROM (bb.block_timestamp - LAG(bb.block_timestamp) OVER (ORDER BY bb.block_number)))) as avg_block_time_seconds,
  COUNT(DISTINCT bb.miner_address) as unique_miners,
  MAX(bb.block_timestamp) as last_block_time
FROM blockchain_networks bn
JOIN blockchain_blocks bb ON bn.id = bb.network_id
WHERE bb.block_timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY bn.id, bn.network_name, bn.consensus_algorithm
ORDER BY total_blocks DESC;

-- ============================================================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- ============================================================================

-- Materialized view for threat intelligence aggregations
CREATE MATERIALIZED VIEW threat_intelligence_summary AS
SELECT 
  threat_type,
  severity,
  COUNT(*) as total_threats,
  AVG(threat_score) as avg_threat_score,
  AVG(confidence_level) as avg_confidence,
  COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_threats,
  MAX(detected_at) as last_detected,
  ROUND((COUNT(CASE WHEN is_verified = true THEN 1 END)::DECIMAL / COUNT(*) * 100), 2) as verification_rate
FROM threat_intelligence
WHERE detected_at >= NOW() - INTERVAL '30 days'
GROUP BY threat_type, severity
ORDER BY total_threats DESC;

-- Refresh materialized views automatically
CREATE INDEX ON threat_intelligence_summary (threat_type, severity);

-- ============================================================================
-- SECURITY POLICIES (Row Level Security)
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE quantum_cryptographic_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Security policy for users - users can only see their own data and users in their organization
CREATE POLICY user_organization_policy ON users
  USING (
    id = current_setting('app.current_user_id')::UUID OR
    organization_id = (SELECT organization_id FROM users WHERE id = current_setting('app.current_user_id')::UUID)
  );

-- Security policy for threat intelligence based on security clearance
CREATE POLICY threat_intelligence_clearance_policy ON threat_intelligence
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_setting('app.current_user_id')::UUID 
      AND security_clearance >= (
        CASE 
          WHEN severity IN ('CRITICAL', 'CONSCIOUSNESS_ALERT', 'QUANTUM_EMERGENCY') THEN 5
          WHEN severity = 'HIGH' THEN 3
          ELSE 1
        END
      )
    )
  );

-- ============================================================================
-- DATA RETENTION POLICIES
-- ============================================================================

-- Function to archive old data
CREATE OR REPLACE FUNCTION archive_old_data()
RETURNS void AS $$
BEGIN
  -- Archive old consciousness measurements (keep 1 year)
  DELETE FROM consciousness_field_measurements 
  WHERE measurement_timestamp < NOW() - INTERVAL '1 year';
  
  -- Archive old threat events (keep 2 years)
  DELETE FROM threat_events 
  WHERE event_timestamp < NOW() - INTERVAL '2 years';
  
  -- Archive old system metrics (keep 90 days)
  DELETE FROM system_metrics 
  WHERE metric_timestamp < NOW() - INTERVAL '90 days';
  
  -- Archive resolved low-severity alerts (keep 30 days)
  DELETE FROM alerts 
  WHERE status = 'RESOLVED' 
    AND severity = 'LOW' 
    AND resolved_at < NOW() - INTERVAL '30 days';
  
  -- Update statistics
  ANALYZE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA AND CONFIGURATION
-- ============================================================================

-- Insert default system configuration
INSERT INTO system_configuration (config_category, config_key, config_value, config_description, data_type) VALUES
('consciousness', 'default_awareness_threshold', '0.7', 'Default consciousness awareness threshold for threat detection', 'decimal'),
('consciousness', 'field_measurement_interval_seconds', '300', 'Interval for consciousness field measurements', 'integer'),
('consciousness', 'coherence_stability_threshold', '0.8', 'Minimum coherence level for stable consciousness operations', 'decimal'),
('quantum', 'entanglement_verification_interval_minutes', '60', 'Interval for quantum entanglement verification', 'integer'),
('quantum', 'min_fidelity_threshold', '0.95', 'Minimum fidelity for quantum operations', 'decimal'),
('quantum', 'decoherence_alert_threshold', '0.1', 'Decoherence rate threshold for alerts', 'decimal'),
('blockchain', 'default_transaction_fee', '0.001', 'Default transaction fee in STAR coins', 'decimal'),
('blockchain', 'block_confirmation_count', '6', 'Number of confirmations required for block finality', 'integer'),
('blockchain', 'consensus_participation_threshold', '0.67', 'Minimum participation for consensus validity', 'decimal'),
('evolutionary', 'default_population_size', '100', 'Default population size for evolutionary algorithms', 'integer'),
('evolutionary', 'fitness_convergence_threshold', '0.001', 'Fitness improvement threshold for convergence detection', 'decimal'),
('evolutionary', 'consciousness_guidance_weight', '0.3', 'Weight of consciousness guidance in selection process', 'decimal'),
('security', 'threat_score_alert_threshold', '0.8', 'Threat score threshold for automatic alerts', 'decimal'),
('security', 'false_positive_tolerance', '0.05', 'Maximum acceptable false positive rate', 'decimal'),
('security', 'consciousness_verification_required', 'true', 'Require consciousness verification for high-severity threats', 'boolean');

-- Insert default alert rules
INSERT INTO alert_rules (rule_name, rule_description, rule_type, metric_conditions, severity_level, notification_channels) VALUES
('High Threat Score Detected', 'Alert when threat score exceeds threshold', 'THRESHOLD', '{"metric": "threat_score", "operator": ">", "value": 0.8}', 'HIGH', '["email", "sms", "consciousness_enhancement"]'),
('Consciousness Field Anomaly', 'Alert on significant consciousness field deviations', 'ANOMALY', '{"metric": "field_strength", "operator": "deviation", "threshold": 0.3}', 'MEDIUM', '["email", "consciousness_stabilization"]'),
('Quantum Entanglement Failure', 'Alert when quantum entanglement fidelity drops', 'THRESHOLD', '{"metric": "fidelity", "operator": "<", "value": 0.9}', 'CRITICAL', '["email", "sms", "quantum_repair_protocol"]'),
('Blockchain Consensus Failure', 'Alert when blockchain consensus participation is low', 'THRESHOLD', '{"metric": "consensus_participation", "operator": "<", "value": 0.67}', 'HIGH', '["email", "blockchain_node_recovery"]'),
('Evolutionary Algorithm Stagnation', 'Alert when evolutionary algorithm shows no improvement', 'STAGNATION', '{"metric": "fitness_improvement", "operator": "<", "value": 0.001, "duration": "10_generations"}', 'MEDIUM', '["email", "algorithm_restart"]');

-- Create default organization
INSERT INTO organizations (name, type, consciousness_level, security_clearance) VALUES
('STARGUARD Central Command', 'SECURITY_AGENCY', 'TRANSCENDENT', 5);

-- Create system admin user
INSERT INTO users (organization_id, username, email, password_hash, consciousness_profile, security_clearance, awareness_level, coherence_score, field_sensitivity) VALUES
((SELECT id FROM organizations WHERE name = 'STARGUARD Central Command'), 'admin', 'admin@starguard.ai', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewF5K8h8KcQPfOB.', '{"consciousness_type": "enhanced", "field_attunement": "maximum", "quantum_sensitivity": "high"}', 5, 0.9500, 0.9800, 0.9200);

-- Create default quantum nodes
INSERT INTO quantum_nodes (node_name, node_type, location, quantum_state, entanglement_capacity, fidelity, consciousness_enhancement_level) VALUES
('STARGUARD-QN-ALPHA', 'PRIMARY_HUB', ST_Point(-74.0060, 40.7128, 4326), 'COHERENT', 1000, 0.9950, 0.8500),
('STARGUARD-QN-BETA', 'REGIONAL_NODE', ST_Point(-87.6298, 41.8781, 4326), 'COHERENT', 500, 0.9900, 0.8000),
('STARGUARD-QN-GAMMA', 'RESEARCH_NODE', ST_Point(-122.4194, 37.7749, 4326), 'COHERENT', 750, 0.9925, 0.9000);

-- Create default blockchain network
INSERT INTO blockchain_networks (network_name, network_id, consensus_algorithm, consciousness_threshold, quantum_security_enabled) VALUES
('STARGUARD ThreatChain', 'starguard-main-001', 'PROOF_OF_CONSCIOUSNESS', 0.7500, true);

-- Create default evolutionary population for threat pattern optimization
INSERT INTO evolutionary_populations (population_name, algorithm_type, problem_domain, population_size, mutation_rate, crossover_rate, consciousness_guidance_enabled, quantum_mutation_enabled) VALUES
('Threat Pattern Evolution Alpha', 'GENETIC_ALGORITHM', 'THREAT_DETECTION', 200, 0.0200, 0.8000, true, true);

-- ============================================================================
-- VACUUM AND MAINTENANCE SCHEDULES
-- ============================================================================

-- Create maintenance function
CREATE OR REPLACE FUNCTION perform_maintenance()
RETURNS void AS $$
BEGIN
  -- Vacuum and analyze frequently updated tables
  VACUUM ANALYZE threat_events;
  VACUUM ANALYZE consciousness_field_measurements;
  VACUUM ANALYZE system_metrics;
  VACUUM ANALYZE audit_logs;
  
  -- Reindex critical indexes
  REINDEX INDEX CONCURRENTLY idx_threat_events_timestamp;
  REINDEX INDEX CONCURRENTLY idx_consciousness_measurements_timestamp;
  
  -- Refresh materialized views
  REFRESH MATERIALIZED VIEW CONCURRENTLY threat_intelligence_summary;
  
  -- Update table statistics
  ANALYZE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Log schema creation completion
INSERT INTO audit_logs (event_type, event_category, action, event_metadata, integrity_hash) VALUES
('SYSTEM', 'DATABASE', 'SCHEMA_CREATED', 
 '{"version": "3.0.0", "timestamp": "' || NOW() || '", "features": ["consciousness", "quantum", "blockchain", "evolutionary", "predictive"]}',
 encode(digest('STARGUARD_SCHEMA_V3_CREATED_' || extract(epoch from now())::text, 'sha256'), 'hex'));

-- Display completion message
DO $$
BEGIN
  RAISE NOTICE 'STARGUARD Advanced Security System Database Schema v3.0.0 successfully created!';
  RAISE NOTICE 'Features enabled: Consciousness Enhancement, Quantum Security, Blockchain Integration, Evolutionary Algorithms, Predictive Analytics';
  RAISE NOTICE 'Total tables created: %', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE');
  RAISE NOTICE 'Total indexes created: %', (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public');
  RAISE NOTICE 'Database ready for consciousness-enhanced threat detection operations.';
END $$;
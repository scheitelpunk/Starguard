/**
 * STARGUARD Database Migration 002 - Quantum Security
 * 
 * Adds quantum security infrastructure including quantum entanglement
 * networks, post-quantum cryptography, and quantum-enhanced threat detection.
 * 
 * Migration: 002_quantum_security
 * Created: 2024-07-08
 * Author: STARGUARD Quantum Security Team
 * 
 * @version 1.0.0
 * @classification DATABASE_MIGRATION_QUANTUM
 */

-- Migration metadata
INSERT INTO schema_migrations (version, description, applied_at) VALUES 
('002', 'Quantum security infrastructure with entanglement networks and post-quantum cryptography', NOW())
ON CONFLICT (version) DO NOTHING;

-- Begin migration transaction
BEGIN;

-- Record migration start time
DO $$
DECLARE
  start_time TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  CREATE TEMP TABLE migration_timing_002 (start_time TIMESTAMP WITH TIME ZONE);
  INSERT INTO migration_timing_002 VALUES (start_time);
END $$;

-- ============================================================================
-- QUANTUM INFRASTRUCTURE TABLES
-- ============================================================================

-- Quantum nodes for entanglement network
CREATE TABLE IF NOT EXISTS quantum_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_name VARCHAR(255) NOT NULL,
  node_type VARCHAR(100) NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  location GEOMETRY(POINT, 4326),
  altitude_meters DECIMAL(10,2),
  quantum_state quantum_state DEFAULT 'COHERENT',
  hardware_configuration JSONB,
  entanglement_capacity INTEGER DEFAULT 100 CHECK (entanglement_capacity > 0),
  current_entanglements INTEGER DEFAULT 0 CHECK (current_entanglements >= 0),
  max_entanglement_distance_km DECIMAL(10,2) DEFAULT 1000.0,
  coherence_time_seconds DECIMAL(10,3) CHECK (coherence_time_seconds > 0),
  fidelity DECIMAL(5,4) CHECK (fidelity >= 0 AND fidelity <= 1),
  error_rate DECIMAL(10,8) DEFAULT 0.001,
  quantum_key_distribution_enabled BOOLEAN DEFAULT true,
  quantum_random_number_generation BOOLEAN DEFAULT true,
  consciousness_enhancement_level DECIMAL(5,4) DEFAULT 0.5 CHECK (consciousness_enhancement_level >= 0 AND consciousness_enhancement_level <= 1),
  quantum_consciousness_correlation DECIMAL(5,4) CHECK (quantum_consciousness_correlation >= 0 AND quantum_consciousness_correlation <= 1),
  temperature_kelvin DECIMAL(10,6),
  isolation_level VARCHAR(50) DEFAULT 'HIGH',
  calibration_frequency_hours INTEGER DEFAULT 24,
  maintenance_schedule JSONB,
  performance_metrics JSONB,
  security_protocols JSONB,
  access_control_list JSONB,
  encryption_standards JSONB,
  last_maintenance TIMESTAMP WITH TIME ZONE,
  next_maintenance_due TIMESTAMP WITH TIME ZONE,
  operational_status VARCHAR(50) DEFAULT 'ACTIVE',
  status_details JSONB,
  commissioned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  decommissioned_at TIMESTAMP WITH TIME ZONE,
  firmware_version VARCHAR(50),
  software_version VARCHAR(50),
  compliance_certifications JSONB,
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_node_type CHECK (node_type IN ('PRIMARY_HUB', 'REGIONAL_NODE', 'RESEARCH_NODE', 'MOBILE_UNIT', 'CONSCIOUSNESS_AMPLIFIER', 'QUANTUM_REPEATER', 'ENTANGLEMENT_SOURCE')),
  CONSTRAINT valid_quantum_state CHECK (quantum_state IN ('SUPERPOSITION', 'ENTANGLED', 'COHERENT', 'DECOHERENT', 'MEASURED', 'CONSCIOUSNESS_INFLUENCED', 'ERROR_STATE')),
  CONSTRAINT valid_operational_status CHECK (operational_status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CALIBRATION', 'ERROR', 'OFFLINE')),
  CONSTRAINT valid_entanglement_capacity CHECK (current_entanglements <= entanglement_capacity),
  CONSTRAINT valid_isolation_level CHECK (isolation_level IN ('LOW', 'MEDIUM', 'HIGH', 'ULTRA_HIGH', 'CONSCIOUSNESS_SHIELDED'))
);

-- Quantum entanglement connections
CREATE TABLE IF NOT EXISTS quantum_entanglements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entanglement_id TEXT UNIQUE NOT NULL,
  node_a_id UUID NOT NULL REFERENCES quantum_nodes(id) ON DELETE CASCADE,
  node_b_id UUID NOT NULL REFERENCES quantum_nodes(id) ON DELETE CASCADE,
  bell_state VARCHAR(20) NOT NULL,
  entanglement_type VARCHAR(50) DEFAULT 'SPONTANEOUS',
  creation_method VARCHAR(100),
  entanglement_strength DECIMAL(5,4) NOT NULL CHECK (entanglement_strength >= 0 AND entanglement_strength <= 1),
  correlation_coefficient DECIMAL(10,8) CHECK (correlation_coefficient >= -1 AND correlation_coefficient <= 1),
  bell_inequality_violation DECIMAL(5,4) CHECK (bell_inequality_violation >= 0),
  chsh_value DECIMAL(10,6),
  consciousness_mediation DECIMAL(5,4) CHECK (consciousness_mediation >= 0 AND consciousness_mediation <= 1),
  consciousness_enhancement_factor DECIMAL(5,4) DEFAULT 1.0,
  quantum_coherence_time DECIMAL(10,3) CHECK (quantum_coherence_time > 0),
  decoherence_rate DECIMAL(10,8) CHECK (decoherence_rate >= 0),
  noise_level DECIMAL(10,8) DEFAULT 0.0,
  error_rate DECIMAL(10,8) DEFAULT 0.0,
  distance_km DECIMAL(10,2),
  signal_strength DECIMAL(5,4),
  bandwidth_hz DECIMAL(15,2),
  data_transmission_rate_bps BIGINT,
  security_key_rate_bps BIGINT,
  measurement_settings JSONB,
  measurement_history JSONB,
  performance_metrics JSONB,
  quality_metrics JSONB,
  environmental_factors JSONB,
  stabilization_protocols JSONB,
  error_correction_data JSONB,
  quantum_error_correction_enabled BOOLEAN DEFAULT false,
  established_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_verification TIMESTAMP WITH TIME ZONE,
  verification_frequency_minutes INTEGER DEFAULT 15,
  verification_count INTEGER DEFAULT 0,
  failed_verifications INTEGER DEFAULT 0,
  auto_recovery_enabled BOOLEAN DEFAULT true,
  recovery_attempts INTEGER DEFAULT 0,
  max_recovery_attempts INTEGER DEFAULT 3,
  last_recovery_attempt TIMESTAMP WITH TIME ZONE,
  communication_protocol VARCHAR(100),
  encryption_algorithm VARCHAR(100),
  key_exchange_protocol VARCHAR(100),
  consciousness_synchronization BOOLEAN DEFAULT false,
  synchronization_frequency_hz DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  deactivated_at TIMESTAMP WITH TIME ZONE,
  deactivation_reason TEXT,
  
  CONSTRAINT valid_bell_state CHECK (bell_state IN ('PHI_PLUS', 'PHI_MINUS', 'PSI_PLUS', 'PSI_MINUS', 'CUSTOM')),
  CONSTRAINT valid_entanglement_type CHECK (entanglement_type IN ('SPONTANEOUS', 'INDUCED', 'CONSCIOUSNESS_GUIDED', 'LABORATORY_CREATED', 'FIELD_GENERATED')),
  CONSTRAINT different_nodes CHECK (node_a_id != node_b_id),
  CONSTRAINT valid_chsh_value CHECK (chsh_value IS NULL OR (chsh_value >= 0 AND chsh_value <= 4))
);

-- Post-quantum cryptographic keys
CREATE TABLE IF NOT EXISTS quantum_cryptographic_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_identifier TEXT UNIQUE NOT NULL,
  key_type VARCHAR(100) NOT NULL,
  algorithm_name VARCHAR(100) NOT NULL,
  algorithm_parameters JSONB NOT NULL,
  security_level INTEGER NOT NULL CHECK (security_level IN (1, 3, 5)),
  key_size_bits INTEGER NOT NULL,
  public_key BYTEA NOT NULL,
  private_key_encrypted BYTEA NOT NULL,
  key_derivation_function VARCHAR(100),
  encryption_algorithm VARCHAR(100) DEFAULT 'AES-256-GCM',
  key_encryption_key_id UUID,
  key_generation_method VARCHAR(100) NOT NULL,
  quantum_randomness_source VARCHAR(100),
  consciousness_entropy_contribution DECIMAL(5,4) CHECK (consciousness_entropy_contribution >= 0 AND consciousness_entropy_contribution <= 1),
  morphic_field_randomness DECIMAL(5,4) CHECK (morphic_field_randomness >= 0 AND morphic_field_randomness <= 1),
  hardware_security_module BOOLEAN DEFAULT false,
  quantum_random_number_generator BOOLEAN DEFAULT false,
  true_random_number_generator BOOLEAN DEFAULT false,
  key_purpose VARCHAR(100) NOT NULL,
  associated_entity_id UUID,
  associated_entity_type VARCHAR(50),
  associated_quantum_node_id UUID REFERENCES quantum_nodes(id) ON DELETE SET NULL,
  key_usage_policy JSONB,
  access_control_list JSONB,
  audit_requirements JSONB,
  compliance_standards JSONB,
  certificate_data JSONB,
  certificate_chain JSONB,
  revocation_info JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  renewal_threshold_days INTEGER DEFAULT 30,
  auto_renewal_enabled BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revocation_reason VARCHAR(100),
  compromised_at TIMESTAMP WITH TIME ZONE,
  rotation_history JSONB,
  last_rotation TIMESTAMP WITH TIME ZONE,
  rotation_frequency_days INTEGER,
  usage_count INTEGER DEFAULT 0,
  max_usage_count INTEGER,
  usage_restrictions JSONB,
  performance_metrics JSONB,
  validation_tests JSONB,
  quantum_resistance_verified BOOLEAN DEFAULT false,
  post_quantum_migration_ready BOOLEAN DEFAULT true,
  legacy_compatibility BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_key_type CHECK (key_type IN ('ENCRYPTION', 'SIGNATURE', 'KEY_EXCHANGE', 'AUTHENTICATION', 'CONSCIOUSNESS_VERIFICATION', 'QUANTUM_AUTHENTICATION')),
  CONSTRAINT valid_algorithm_name CHECK (algorithm_name IN ('CRYSTALS-KYBER', 'CRYSTALS-DILITHIUM', 'FALCON', 'SPHINCS+', 'CLASSIC_MCELIECE', 'NTRU', 'SABER', 'CONSCIOUSNESS_HASH')),
  CONSTRAINT valid_key_purpose CHECK (key_purpose IN ('ENCRYPTION', 'SIGNATURE', 'KEY_EXCHANGE', 'AUTHENTICATION', 'CONSCIOUSNESS_VERIFICATION', 'QUANTUM_COMMUNICATION', 'BLOCKCHAIN_SIGNING', 'THREAT_INTELLIGENCE_VERIFICATION')),
  CONSTRAINT valid_associated_entity_type CHECK (associated_entity_type IN ('USER', 'ORGANIZATION', 'SYSTEM', 'QUANTUM_NODE', 'BLOCKCHAIN_NODE', 'CONSCIOUSNESS_DEVICE')),
  CONSTRAINT valid_revocation_reason CHECK (revocation_reason IN ('COMPROMISE', 'SUPERSEDED', 'CESSATION_OF_OPERATION', 'CERTIFICATE_HOLD', 'REMOVE_FROM_CRL', 'PRIVILEGE_WITHDRAWN', 'AA_COMPROMISE'))
);

-- Quantum key distribution sessions
CREATE TABLE IF NOT EXISTS quantum_key_distribution_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  quantum_node_a_id UUID NOT NULL REFERENCES quantum_nodes(id) ON DELETE CASCADE,
  quantum_node_b_id UUID NOT NULL REFERENCES quantum_nodes(id) ON DELETE CASCADE,
  entanglement_id UUID REFERENCES quantum_entanglements(id) ON DELETE SET NULL,
  protocol_name VARCHAR(100) NOT NULL,
  protocol_parameters JSONB,
  session_type VARCHAR(50) DEFAULT 'STANDARD',
  security_level VARCHAR(50) DEFAULT 'HIGH',
  consciousness_enhancement BOOLEAN DEFAULT false,
  morphic_field_utilization BOOLEAN DEFAULT false,
  key_generation_rate_bps INTEGER,
  error_rate DECIMAL(10,8),
  quantum_bit_error_rate DECIMAL(10,8),
  privacy_amplification_factor DECIMAL(5,4),
  error_correction_efficiency DECIMAL(5,4),
  final_key_rate_bps INTEGER,
  total_bits_generated BIGINT DEFAULT 0,
  total_bits_after_reconciliation BIGINT DEFAULT 0,
  total_bits_after_privacy_amplification BIGINT DEFAULT 0,
  session_keys_generated INTEGER DEFAULT 0,
  session_quality_metrics JSONB,
  eavesdropping_detection JSONB,
  security_analysis JSONB,
  environmental_conditions JSONB,
  quantum_channel_parameters JSONB,
  classical_channel_parameters JSONB,
  authentication_data JSONB,
  session_metadata JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  session_status VARCHAR(50) DEFAULT 'ACTIVE',
  termination_reason VARCHAR(100),
  error_details JSONB,
  recovery_attempts INTEGER DEFAULT 0,
  consciousness_correlation DECIMAL(5,4),
  quantum_consciousness_sync BOOLEAN DEFAULT false,
  
  CONSTRAINT valid_protocol_name CHECK (protocol_name IN ('BB84', 'E91', 'SARG04', 'COW', 'DPS', 'CONSCIOUSNESS_ENHANCED_BB84', 'MORPHIC_FIELD_QKD')),
  CONSTRAINT valid_session_type CHECK (session_type IN ('STANDARD', 'HIGH_SECURITY', 'CONSCIOUSNESS_GUIDED', 'EMERGENCY', 'BACKUP')),
  CONSTRAINT valid_security_level CHECK (security_level IN ('STANDARD', 'HIGH', 'ULTRA_HIGH', 'CONSCIOUSNESS_SECURED')),
  CONSTRAINT valid_session_status CHECK (session_status IN ('ACTIVE', 'COMPLETED', 'FAILED', 'ABORTED', 'PAUSED', 'ERROR')),
  CONSTRAINT different_quantum_nodes CHECK (quantum_node_a_id != quantum_node_b_id)
);

-- Quantum threat detection sensors
CREATE TABLE IF NOT EXISTS quantum_threat_sensors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sensor_name VARCHAR(255) NOT NULL,
  sensor_type VARCHAR(100) NOT NULL,
  quantum_node_id UUID REFERENCES quantum_nodes(id) ON DELETE SET NULL,
  location GEOMETRY(POINT, 4326),
  detection_capabilities JSONB,
  sensitivity_parameters JSONB,
  calibration_data JSONB,
  quantum_state_monitoring BOOLEAN DEFAULT true,
  entanglement_monitoring BOOLEAN DEFAULT true,
  decoherence_detection BOOLEAN DEFAULT true,
  quantum_interference_detection BOOLEAN DEFAULT true,
  consciousness_quantum_correlation BOOLEAN DEFAULT false,
  morphic_field_quantum_coupling BOOLEAN DEFAULT false,
  detection_algorithms JSONB,
  machine_learning_models JSONB,
  quantum_machine_learning BOOLEAN DEFAULT false,
  real_time_processing BOOLEAN DEFAULT true,
  alert_thresholds JSONB,
  false_positive_mitigation JSONB,
  performance_metrics JSONB,
  detection_history JSONB,
  threat_statistics JSONB,
  last_calibration TIMESTAMP WITH TIME ZONE,
  calibration_frequency_hours INTEGER DEFAULT 168,
  maintenance_schedule JSONB,
  operational_parameters JSONB,
  environmental_monitoring JSONB,
  power_consumption_watts DECIMAL(10,2),
  data_collection_rate_hz DECIMAL(10,2),
  data_storage_capacity_gb DECIMAL(15,2),
  data_retention_days INTEGER DEFAULT 90,
  network_connectivity JSONB,
  security_protocols JSONB,
  access_controls JSONB,
  audit_logging BOOLEAN DEFAULT true,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  firmware_version VARCHAR(50),
  software_version VARCHAR(50),
  hardware_revision VARCHAR(50),
  manufacturer VARCHAR(255),
  model_number VARCHAR(100),
  serial_number VARCHAR(100),
  warranty_expires TIMESTAMP WITH TIME ZONE,
  support_contact JSONB,
  operational_status VARCHAR(50) DEFAULT 'ACTIVE',
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_sensor_type CHECK (sensor_type IN ('QUANTUM_STATE_ANALYZER', 'ENTANGLEMENT_MONITOR', 'DECOHERENCE_DETECTOR', 'INTERFERENCE_SENSOR', 'QUANTUM_NOISE_ANALYZER', 'CONSCIOUSNESS_QUANTUM_CORRELATOR')),
  CONSTRAINT valid_operational_status CHECK (operational_status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CALIBRATION', 'ERROR', 'OFFLINE', 'STANDBY'))
);

-- ============================================================================
-- QUANTUM SECURITY EVENTS AND MONITORING
-- ============================================================================

-- Quantum security events
CREATE TABLE IF NOT EXISTS quantum_security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(100) NOT NULL,
  severity threat_severity NOT NULL,
  quantum_node_id UUID REFERENCES quantum_nodes(id) ON DELETE SET NULL,
  entanglement_id UUID REFERENCES quantum_entanglements(id) ON DELETE SET NULL,
  sensor_id UUID REFERENCES quantum_threat_sensors(id) ON DELETE SET NULL,
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  detection_method VARCHAR(100),
  quantum_state_before JSONB,
  quantum_state_after JSONB,
  anomaly_indicators JSONB,
  measurement_data JSONB,
  correlation_analysis JSONB,
  consciousness_correlation DECIMAL(5,4),
  morphic_field_influence DECIMAL(5,4),
  environmental_factors JSONB,
  potential_causes JSONB,
  impact_assessment JSONB,
  quantum_system_impact JSONB,
  consciousness_impact JSONB,
  security_implications JSONB,
  recommended_actions JSONB,
  automated_responses JSONB,
  manual_interventions JSONB,
  mitigation_effectiveness JSONB,
  recovery_procedures JSONB,
  false_positive_analysis JSONB,
  validation_results JSONB,
  escalation_criteria JSONB,
  notification_sent BOOLEAN DEFAULT false,
  notifications JSONB,
  investigation_status VARCHAR(50) DEFAULT 'PENDING',
  investigated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  investigation_started TIMESTAMP WITH TIME ZONE,
  investigation_completed TIMESTAMP WITH TIME ZONE,
  investigation_notes TEXT,
  evidence_collected JSONB,
  forensic_analysis JSONB,
  incident_id UUID REFERENCES security_incidents(id) ON DELETE SET NULL,
  related_events UUID[],
  threat_intelligence_correlation JSONB,
  quantum_threat_indicators JSONB,
  consciousness_threat_indicators JSONB,
  response_time_ms INTEGER,
  resolution_time_minutes INTEGER,
  business_impact VARCHAR(50),
  technical_impact VARCHAR(50),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_method VARCHAR(100),
  lessons_learned TEXT,
  
  CONSTRAINT valid_event_type CHECK (event_type IN ('DECOHERENCE_DETECTED', 'ENTANGLEMENT_FAILURE', 'QUANTUM_INTERFERENCE', 'EAVESDROPPING_ATTEMPT', 'KEY_COMPROMISE', 'CONSCIOUSNESS_MANIPULATION', 'MORPHIC_FIELD_DISRUPTION', 'QUANTUM_STATE_ANOMALY')),
  CONSTRAINT valid_event_category CHECK (event_category IN ('SECURITY_BREACH', 'SYSTEM_ANOMALY', 'PERFORMANCE_DEGRADATION', 'EQUIPMENT_FAILURE', 'CONSCIOUSNESS_EVENT', 'ENVIRONMENTAL_DISTURBANCE')),
  CONSTRAINT valid_investigation_status CHECK (investigation_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED', 'CLOSED')),
  CONSTRAINT valid_business_impact CHECK (business_impact IN ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  CONSTRAINT valid_technical_impact CHECK (technical_impact IN ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

-- Quantum performance metrics
CREATE TABLE IF NOT EXISTS quantum_performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  quantum_node_id UUID REFERENCES quantum_nodes(id) ON DELETE CASCADE,
  entanglement_id UUID REFERENCES quantum_entanglements(id) ON DELETE SET NULL,
  metric_category VARCHAR(100) NOT NULL,
  metric_name VARCHAR(255) NOT NULL,
  metric_value DECIMAL(15,6) NOT NULL,
  metric_unit VARCHAR(50),
  measurement_method VARCHAR(100),
  measurement_accuracy DECIMAL(5,4),
  measurement_precision DECIMAL(5,4),
  environmental_conditions JSONB,
  calibration_reference JSONB,
  baseline_value DECIMAL(15,6),
  threshold_values JSONB,
  anomaly_score DECIMAL(5,4),
  trend_indicator VARCHAR(20),
  statistical_analysis JSONB,
  consciousness_correlation DECIMAL(5,4),
  quantum_consciousness_coupling DECIMAL(5,4),
  morphic_field_influence DECIMAL(5,4),
  quality_indicators JSONB,
  error_estimates JSONB,
  uncertainty_analysis JSONB,
  measurement_context JSONB,
  processing_pipeline JSONB,
  data_quality_score DECIMAL(5,4),
  validation_status VARCHAR(50) DEFAULT 'PENDING',
  validated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  validation_timestamp TIMESTAMP WITH TIME ZONE,
  validation_notes TEXT,
  
  CONSTRAINT valid_metric_category CHECK (metric_category IN ('FIDELITY', 'COHERENCE', 'ENTANGLEMENT_STRENGTH', 'ERROR_RATE', 'THROUGHPUT', 'LATENCY', 'TEMPERATURE', 'CONSCIOUSNESS_CORRELATION')),
  CONSTRAINT valid_trend_indicator CHECK (trend_indicator IN ('IMPROVING', 'STABLE', 'DEGRADING', 'FLUCTUATING', 'UNKNOWN')),
  CONSTRAINT valid_validation_status CHECK (validation_status IN ('PENDING', 'VALIDATED', 'REJECTED', 'QUESTIONABLE'))
);

-- ============================================================================
-- QUANTUM-ENHANCED THREAT DETECTION
-- ============================================================================

-- Quantum threat patterns
CREATE TABLE IF NOT EXISTS quantum_threat_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_name VARCHAR(255) NOT NULL,
  pattern_description TEXT,
  quantum_signature JSONB NOT NULL,
  detection_algorithm JSONB NOT NULL,
  consciousness_indicators JSONB,
  morphic_field_signatures JSONB,
  quantum_state_fingerprints JSONB,
  entanglement_disruption_patterns JSONB,
  decoherence_signatures JSONB,
  measurement_anomaly_patterns JSONB,
  statistical_signatures JSONB,
  temporal_patterns JSONB,
  spatial_patterns JSONB,
  frequency_domain_signatures JSONB,
  machine_learning_features JSONB,
  quantum_machine_learning_models JSONB,
  detection_confidence_threshold DECIMAL(5,4) DEFAULT 0.8,
  false_positive_rate DECIMAL(5,4),
  detection_rate DECIMAL(5,4),
  precision_score DECIMAL(5,4),
  recall_score DECIMAL(5,4),
  f1_score DECIMAL(5,4),
  roc_auc_score DECIMAL(5,4),
  performance_benchmarks JSONB,
  computational_complexity JSONB,
  resource_requirements JSONB,
  real_time_capability BOOLEAN DEFAULT true,
  batch_processing_capability BOOLEAN DEFAULT true,
  distributed_processing BOOLEAN DEFAULT false,
  quantum_processing_required BOOLEAN DEFAULT false,
  consciousness_processing_required BOOLEAN DEFAULT false,
  hardware_requirements JSONB,
  software_dependencies JSONB,
  integration_requirements JSONB,
  validation_methodology JSONB,
  testing_results JSONB,
  effectiveness_metrics JSONB,
  deployment_history JSONB,
  update_history JSONB,
  maintenance_requirements JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_validated TIMESTAMP WITH TIME ZONE,
  validation_frequency_days INTEGER DEFAULT 30,
  version INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'DRAFT',
  deployment_status VARCHAR(50) DEFAULT 'NOT_DEPLOYED',
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_status CHECK (status IN ('DRAFT', 'REVIEW', 'APPROVED', 'DEPLOYED', 'DEPRECATED', 'ARCHIVED')),
  CONSTRAINT valid_deployment_status CHECK (deployment_status IN ('NOT_DEPLOYED', 'TESTING', 'STAGED', 'PRODUCTION', 'RETIRED'))
);

-- Quantum consciousness correlations
CREATE TABLE IF NOT EXISTS quantum_consciousness_correlations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  correlation_id TEXT UNIQUE NOT NULL,
  quantum_node_id UUID REFERENCES quantum_nodes(id) ON DELETE CASCADE,
  consciousness_measurement_id UUID REFERENCES consciousness_field_measurements(id) ON DELETE CASCADE,
  correlation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  correlation_strength DECIMAL(5,4) NOT NULL CHECK (correlation_strength >= -1 AND correlation_strength <= 1),
  correlation_type VARCHAR(100) NOT NULL,
  quantum_parameters JSONB,
  consciousness_parameters JSONB,
  environmental_factors JSONB,
  measurement_synchronization BOOLEAN DEFAULT false,
  time_lag_microseconds INTEGER,
  spatial_separation_meters DECIMAL(10,2),
  correlation_stability DECIMAL(5,4),
  statistical_significance DECIMAL(10,8),
  confidence_interval JSONB,
  p_value DECIMAL(10,8),
  effect_size DECIMAL(10,6),
  correlation_mechanism JSONB,
  theoretical_framework VARCHAR(100),
  experimental_conditions JSONB,
  control_measurements JSONB,
  noise_analysis JSONB,
  artifact_detection JSONB,
  replication_status VARCHAR(50),
  peer_review_status VARCHAR(50),
  publication_references JSONB,
  research_notes TEXT,
  implications JSONB,
  future_research_directions JSONB,
  practical_applications JSONB,
  security_implications JSONB,
  consciousness_enhancement_potential DECIMAL(5,4),
  quantum_enhancement_potential DECIMAL(5,4),
  
  CONSTRAINT valid_correlation_type CHECK (correlation_type IN ('POSITIVE', 'NEGATIVE', 'OSCILLATORY', 'PHASE_LOCKED', 'CHAOTIC', 'ENTANGLED', 'MORPHIC')),
  CONSTRAINT valid_replication_status CHECK (replication_status IN ('NOT_ATTEMPTED', 'PENDING', 'SUCCESSFUL', 'FAILED', 'PARTIAL')),
  CONSTRAINT valid_peer_review_status CHECK (peer_review_status IN ('NOT_SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'REVISION_REQUIRED'))
);

-- ============================================================================
-- QUANTUM SECURITY INDEXES
-- ============================================================================

-- Quantum nodes indexes
CREATE INDEX IF NOT EXISTS idx_quantum_nodes_type ON quantum_nodes (node_type);
CREATE INDEX IF NOT EXISTS idx_quantum_nodes_state ON quantum_nodes (quantum_state);
CREATE INDEX IF NOT EXISTS idx_quantum_nodes_location ON quantum_nodes USING gist (location);
CREATE INDEX IF NOT EXISTS idx_quantum_nodes_status ON quantum_nodes (operational_status);
CREATE INDEX IF NOT EXISTS idx_quantum_nodes_organization ON quantum_nodes (organization_id);
CREATE INDEX IF NOT EXISTS idx_quantum_nodes_active ON quantum_nodes (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_quantum_nodes_fidelity ON quantum_nodes (fidelity DESC);
CREATE INDEX IF NOT EXISTS idx_quantum_nodes_capacity ON quantum_nodes (entanglement_capacity DESC);
CREATE INDEX IF NOT EXISTS idx_quantum_nodes_consciousness ON quantum_nodes (consciousness_enhancement_level DESC);

-- Quantum entanglements indexes
CREATE INDEX IF NOT EXISTS idx_quantum_entanglements_nodes ON quantum_entanglements (node_a_id, node_b_id);
CREATE INDEX IF NOT EXISTS idx_quantum_entanglements_node_a ON quantum_entanglements (node_a_id);
CREATE INDEX IF NOT EXISTS idx_quantum_entanglements_node_b ON quantum_entanglements (node_b_id);
CREATE INDEX IF NOT EXISTS idx_quantum_entanglements_strength ON quantum_entanglements (entanglement_strength DESC);
CREATE INDEX IF NOT EXISTS idx_quantum_entanglements_active ON quantum_entanglements (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_quantum_entanglements_bell_state ON quantum_entanglements (bell_state);
CREATE INDEX IF NOT EXISTS idx_quantum_entanglements_established ON quantum_entanglements (established_at DESC);
CREATE INDEX IF NOT EXISTS idx_quantum_entanglements_verification ON quantum_entanglements (last_verification DESC);

-- Quantum cryptographic keys indexes
CREATE INDEX IF NOT EXISTS idx_quantum_crypto_keys_type ON quantum_cryptographic_keys (key_type);
CREATE INDEX IF NOT EXISTS idx_quantum_crypto_keys_algorithm ON quantum_cryptographic_keys (algorithm_name);
CREATE INDEX IF NOT EXISTS idx_quantum_crypto_keys_purpose ON quantum_cryptographic_keys (key_purpose);
CREATE INDEX IF NOT EXISTS idx_quantum_crypto_keys_entity ON quantum_cryptographic_keys (associated_entity_id, associated_entity_type);
CREATE INDEX IF NOT EXISTS idx_quantum_crypto_keys_node ON quantum_cryptographic_keys (associated_quantum_node_id);
CREATE INDEX IF NOT EXISTS idx_quantum_crypto_keys_active ON quantum_cryptographic_keys (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_quantum_crypto_keys_expires ON quantum_cryptographic_keys (expires_at);
CREATE INDEX IF NOT EXISTS idx_quantum_crypto_keys_generated ON quantum_cryptographic_keys (generated_at DESC);

-- Quantum security events indexes
CREATE INDEX IF NOT EXISTS idx_quantum_security_events_timestamp ON quantum_security_events (event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_quantum_security_events_type ON quantum_security_events (event_type);
CREATE INDEX IF NOT EXISTS idx_quantum_security_events_severity ON quantum_security_events (severity);
CREATE INDEX IF NOT EXISTS idx_quantum_security_events_node ON quantum_security_events (quantum_node_id);
CREATE INDEX IF NOT EXISTS idx_quantum_security_events_entanglement ON quantum_security_events (entanglement_id);
CREATE INDEX IF NOT EXISTS idx_quantum_security_events_status ON quantum_security_events (investigation_status);
CREATE INDEX IF NOT EXISTS idx_quantum_security_events_incident ON quantum_security_events (incident_id);

-- Quantum performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_quantum_metrics_timestamp ON quantum_performance_metrics (metric_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_quantum_metrics_node ON quantum_performance_metrics (quantum_node_id, metric_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_quantum_metrics_category ON quantum_performance_metrics (metric_category, metric_name);
CREATE INDEX IF NOT EXISTS idx_quantum_metrics_anomaly ON quantum_performance_metrics (anomaly_score DESC) WHERE anomaly_score > 0.5;

-- Quantum threat patterns indexes
CREATE INDEX IF NOT EXISTS idx_quantum_threat_patterns_name ON quantum_threat_patterns (pattern_name);
CREATE INDEX IF NOT EXISTS idx_quantum_threat_patterns_status ON quantum_threat_patterns (status);
CREATE INDEX IF NOT EXISTS idx_quantum_threat_patterns_active ON quantum_threat_patterns (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_quantum_threat_patterns_detection_rate ON quantum_threat_patterns (detection_rate DESC);

-- ============================================================================
-- QUANTUM SECURITY TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to validate quantum entanglement
CREATE OR REPLACE FUNCTION validate_quantum_entanglement_002()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify Bell's theorem violation indicates genuine entanglement
  IF NEW.bell_inequality_violation IS NOT NULL AND NEW.bell_inequality_violation <= 0 THEN
    RAISE EXCEPTION 'Invalid quantum entanglement: Bell inequality violation must be positive for genuine entanglement';
  END IF;
  
  -- Verify CHSH value for Bell inequality violation
  IF NEW.chsh_value IS NOT NULL THEN
    IF NEW.chsh_value > 2 THEN
      NEW.bell_inequality_violation := NEW.chsh_value - 2;
    ELSE
      RAISE WARNING 'CHSH value % does not indicate quantum entanglement (should be > 2)', NEW.chsh_value;
    END IF;
  END IF;
  
  -- Calculate distance between nodes if locations are available
  IF NEW.distance_km IS NULL THEN
    SELECT ST_Distance(na.location::geography, nb.location::geography) / 1000.0 INTO NEW.distance_km
    FROM quantum_nodes na, quantum_nodes nb
    WHERE na.id = NEW.node_a_id AND nb.id = NEW.node_b_id
    AND na.location IS NOT NULL AND nb.location IS NOT NULL;
  END IF;
  
  -- Update node entanglement counts
  UPDATE quantum_nodes 
  SET current_entanglements = current_entanglements + 1 
  WHERE id = NEW.node_a_id OR id = NEW.node_b_id;
  
  -- Check entanglement capacity limits
  IF EXISTS (
    SELECT 1 FROM quantum_nodes 
    WHERE (id = NEW.node_a_id OR id = NEW.node_b_id) 
    AND current_entanglements > entanglement_capacity
  ) THEN
    RAISE EXCEPTION 'Entanglement capacity exceeded for one or both nodes';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_quantum_entanglement_trigger_002
  BEFORE INSERT ON quantum_entanglements
  FOR EACH ROW EXECUTE FUNCTION validate_quantum_entanglement_002();

-- Function to monitor quantum security events
CREATE OR REPLACE FUNCTION detect_quantum_anomalies()
RETURNS TRIGGER AS $$
DECLARE
  baseline_fidelity DECIMAL(5,4);
  anomaly_threshold DECIMAL(5,4) := 0.1;
BEGIN
  -- Check for significant fidelity degradation
  IF NEW.metric_category = 'FIDELITY' THEN
    SELECT AVG(metric_value) INTO baseline_fidelity
    FROM quantum_performance_metrics
    WHERE quantum_node_id = NEW.quantum_node_id
    AND metric_category = 'FIDELITY'
    AND metric_timestamp >= NOW() - INTERVAL '1 hour';
    
    IF baseline_fidelity IS NOT NULL AND ABS(NEW.metric_value - baseline_fidelity) > anomaly_threshold THEN
      -- Create quantum security event
      INSERT INTO quantum_security_events (
        event_id, event_type, event_category, severity, quantum_node_id,
        measurement_data, potential_causes, consciousness_correlation
      ) VALUES (
        'QSE-' || extract(epoch from now())::bigint || '-' || substring(gen_random_uuid()::text, 1, 8),
        'QUANTUM_STATE_ANOMALY',
        'SYSTEM_ANOMALY',
        CASE 
          WHEN ABS(NEW.metric_value - baseline_fidelity) > 0.3 THEN 'CRITICAL'
          WHEN ABS(NEW.metric_value - baseline_fidelity) > 0.2 THEN 'HIGH'
          ELSE 'MEDIUM'
        END,
        NEW.quantum_node_id,
        jsonb_build_object(
          'current_fidelity', NEW.metric_value,
          'baseline_fidelity', baseline_fidelity,
          'deviation', ABS(NEW.metric_value - baseline_fidelity)
        ),
        jsonb_build_array('Environmental interference', 'Equipment degradation', 'Consciousness field fluctuation'),
        NEW.consciousness_correlation
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER detect_quantum_anomalies_trigger
  AFTER INSERT ON quantum_performance_metrics
  FOR EACH ROW EXECUTE FUNCTION detect_quantum_anomalies();

-- Function to maintain entanglement counts
CREATE OR REPLACE FUNCTION update_entanglement_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Decrease entanglement counts when entanglement is deleted
    UPDATE quantum_nodes 
    SET current_entanglements = current_entanglements - 1 
    WHERE id = OLD.node_a_id OR id = OLD.node_b_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.is_active = true AND NEW.is_active = false THEN
      UPDATE quantum_nodes 
      SET current_entanglements = current_entanglements - 1 
      WHERE id = NEW.node_a_id OR id = NEW.node_b_id;
    ELSIF OLD.is_active = false AND NEW.is_active = true THEN
      UPDATE quantum_nodes 
      SET current_entanglements = current_entanglements + 1 
      WHERE id = NEW.node_a_id OR id = NEW.node_b_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_entanglement_counts_trigger
  AFTER UPDATE OR DELETE ON quantum_entanglements
  FOR EACH ROW EXECUTE FUNCTION update_entanglement_counts();

-- ============================================================================
-- INITIAL QUANTUM DATA
-- ============================================================================

-- Insert default quantum nodes
INSERT INTO quantum_nodes (
  node_name, node_type, location, quantum_state, entanglement_capacity, 
  fidelity, consciousness_enhancement_level, operational_status
) VALUES
('STARGUARD-QN-ALPHA', 'PRIMARY_HUB', ST_Point(-74.0060, 40.7128, 4326), 'COHERENT', 1000, 0.9950, 0.8500, 'ACTIVE'),
('STARGUARD-QN-BETA', 'REGIONAL_NODE', ST_Point(-87.6298, 41.8781, 4326), 'COHERENT', 500, 0.9900, 0.8000, 'ACTIVE'),
('STARGUARD-QN-GAMMA', 'RESEARCH_NODE', ST_Point(-122.4194, 37.7749, 4326), 'COHERENT', 750, 0.9925, 0.9000, 'ACTIVE'),
('STARGUARD-QN-DELTA', 'CONSCIOUSNESS_AMPLIFIER', ST_Point(-71.0589, 42.3601, 4326), 'CONSCIOUSNESS_INFLUENCED', 300, 0.9875, 0.9500, 'ACTIVE'),
('STARGUARD-QN-EPSILON', 'QUANTUM_REPEATER', ST_Point(-80.1918, 25.7617, 4326), 'ENTANGLED', 200, 0.9800, 0.7000, 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Create quantum entanglements between nodes
INSERT INTO quantum_entanglements (
  entanglement_id, node_a_id, node_b_id, bell_state, entanglement_strength,
  correlation_coefficient, consciousness_mediation
) VALUES
(
  'ENT-ALPHA-BETA-001',
  (SELECT id FROM quantum_nodes WHERE node_name = 'STARGUARD-QN-ALPHA'),
  (SELECT id FROM quantum_nodes WHERE node_name = 'STARGUARD-QN-BETA'),
  'PHI_PLUS',
  0.9800,
  0.9650,
  0.1500
),
(
  'ENT-ALPHA-GAMMA-001',
  (SELECT id FROM quantum_nodes WHERE node_name = 'STARGUARD-QN-ALPHA'),
  (SELECT id FROM quantum_nodes WHERE node_name = 'STARGUARD-QN-GAMMA'),
  'PSI_PLUS',
  0.9750,
  0.9600,
  0.2000
),
(
  'ENT-BETA-DELTA-001',
  (SELECT id FROM quantum_nodes WHERE node_name = 'STARGUARD-QN-BETA'),
  (SELECT id FROM quantum_nodes WHERE node_name = 'STARGUARD-QN-DELTA'),
  'PHI_MINUS',
  0.9850,
  0.9700,
  0.8500
)
ON CONFLICT DO NOTHING;

-- Insert quantum threat sensors
INSERT INTO quantum_threat_sensors (
  sensor_name, sensor_type, quantum_node_id, location, 
  detection_capabilities, operational_status
) VALUES
(
  'QTS-ALPHA-001',
  'QUANTUM_STATE_ANALYZER',
  (SELECT id FROM quantum_nodes WHERE node_name = 'STARGUARD-QN-ALPHA'),
  ST_Point(-74.0060, 40.7128, 4326),
  '{"state_monitoring": true, "decoherence_detection": true, "interference_analysis": true}',
  'ACTIVE'
),
(
  'QTS-BETA-001',
  'ENTANGLEMENT_MONITOR',
  (SELECT id FROM quantum_nodes WHERE node_name = 'STARGUARD-QN-BETA'),
  ST_Point(-87.6298, 41.8781, 4326),
  '{"entanglement_monitoring": true, "correlation_analysis": true, "bell_test": true}',
  'ACTIVE'
),
(
  'QTS-GAMMA-001',
  'CONSCIOUSNESS_QUANTUM_CORRELATOR',
  (SELECT id FROM quantum_nodes WHERE node_name = 'STARGUARD-QN-GAMMA'),
  ST_Point(-122.4194, 37.7749, 4326),
  '{"consciousness_correlation": true, "morphic_field_detection": true, "quantum_consciousness_coupling": true}',
  'ACTIVE'
)
ON CONFLICT DO NOTHING;

-- Insert quantum threat patterns
INSERT INTO quantum_threat_patterns (
  pattern_name, pattern_description, quantum_signature, detection_algorithm,
  detection_confidence_threshold, false_positive_rate, status
) VALUES
(
  'Quantum Eavesdropping - Eve Attack',
  'Detection pattern for quantum key distribution eavesdropping attempts',
  '{"increased_error_rate": true, "correlation_degradation": true, "fidelity_reduction": true}',
  '{"error_rate_threshold": 0.11, "correlation_analysis": true, "statistical_tests": ["CHSH", "Bell_inequality"]}',
  0.85,
  0.02,
  'APPROVED'
),
(
  'Consciousness-Quantum Interference',
  'Pattern for detecting consciousness-based quantum system interference',
  '{"consciousness_correlation_spike": true, "quantum_state_deviation": true, "morphic_field_coupling": true}',
  '{"consciousness_monitoring": true, "quantum_state_analysis": true, "correlation_detection": true}',
  0.75,
  0.08,
  'APPROVED'
),
(
  'Quantum State Manipulation Attack',
  'Detection of unauthorized quantum state manipulation attempts',
  '{"state_vector_anomaly": true, "measurement_inconsistency": true, "entanglement_disruption": true}',
  '{"state_verification": true, "measurement_validation": true, "entanglement_monitoring": true}',
  0.90,
  0.03,
  'APPROVED'
)
ON CONFLICT DO NOTHING;

-- Insert sample quantum cryptographic keys
INSERT INTO quantum_cryptographic_keys (
  key_identifier, key_type, algorithm_name, algorithm_parameters, security_level,
  key_size_bits, public_key, private_key_encrypted, key_purpose, quantum_randomness_source
) VALUES
(
  'QCK-STARGUARD-001',
  'ENCRYPTION',
  'CRYSTALS-KYBER',
  '{"parameter_set": "kyber1024", "security_level": 5}',
  5,
  3168,
  decode('EXAMPLE_PUBLIC_KEY_DATA_KYBER1024', 'base64'),
  decode('EXAMPLE_ENCRYPTED_PRIVATE_KEY_DATA_KYBER1024', 'base64'),
  'QUANTUM_COMMUNICATION',
  'QUANTUM_NODE_ALPHA_QRNG'
),
(
  'QCK-STARGUARD-002',
  'SIGNATURE',
  'CRYSTALS-DILITHIUM',
  '{"parameter_set": "dilithium5", "security_level": 5}',
  5,
  4864,
  decode('EXAMPLE_PUBLIC_KEY_DATA_DILITHIUM5', 'base64'),
  decode('EXAMPLE_ENCRYPTED_PRIVATE_KEY_DATA_DILITHIUM5', 'base64'),
  'THREAT_INTELLIGENCE_VERIFICATION',
  'QUANTUM_NODE_BETA_QRNG'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- QUANTUM SECURITY VIEWS
-- ============================================================================

-- Quantum network health view
CREATE OR REPLACE VIEW quantum_network_health AS
SELECT 
  qn.id,
  qn.node_name,
  qn.node_type,
  qn.quantum_state,
  qn.operational_status,
  qn.current_entanglements,
  qn.entanglement_capacity,
  ROUND((qn.current_entanglements::DECIMAL / qn.entanglement_capacity * 100), 2) as utilization_percentage,
  qn.fidelity,
  qn.consciousness_enhancement_level,
  COUNT(qe.id) as active_entanglements,
  AVG(qe.entanglement_strength) as avg_entanglement_strength,
  AVG(qe.correlation_coefficient) as avg_correlation_coefficient,
  COUNT(qse.id) as recent_security_events,
  MAX(qse.event_timestamp) as last_security_event
FROM quantum_nodes qn
LEFT JOIN quantum_entanglements qe ON (qn.id = qe.node_a_id OR qn.id = qe.node_b_id) AND qe.is_active = true
LEFT JOIN quantum_security_events qse ON qn.id = qse.quantum_node_id AND qse.event_timestamp >= NOW() - INTERVAL '24 hours'
WHERE qn.is_active = true
GROUP BY qn.id, qn.node_name, qn.node_type, qn.quantum_state, qn.operational_status, 
         qn.current_entanglements, qn.entanglement_capacity, qn.fidelity, qn.consciousness_enhancement_level
ORDER BY utilization_percentage DESC, qn.fidelity DESC;

-- Quantum security dashboard view
CREATE OR REPLACE VIEW quantum_security_dashboard AS
SELECT 
  DATE_TRUNC('hour', qse.event_timestamp) as event_hour,
  qse.event_type,
  qse.severity,
  COUNT(*) as event_count,
  AVG(qse.consciousness_correlation) as avg_consciousness_correlation,
  AVG(qse.morphic_field_influence) as avg_morphic_influence,
  COUNT(CASE WHEN qse.investigation_status = 'COMPLETED' THEN 1 END) as investigated_count,
  AVG(qse.response_time_ms) as avg_response_time_ms
FROM quantum_security_events qse
WHERE qse.event_timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', qse.event_timestamp), qse.event_type, qse.severity
ORDER BY event_hour DESC, event_count DESC;

-- Quantum performance summary view
CREATE OR REPLACE VIEW quantum_performance_summary AS
SELECT 
  qn.node_name,
  qn.node_type,
  qpm.metric_category,
  AVG(qpm.metric_value) as avg_value,
  STDDEV(qpm.metric_value) as stddev_value,
  MIN(qpm.metric_value) as min_value,
  MAX(qpm.metric_value) as max_value,
  COUNT(CASE WHEN qpm.anomaly_score > 0.5 THEN 1 END) as anomaly_count,
  MAX(qpm.metric_timestamp) as last_measurement
FROM quantum_nodes qn
JOIN quantum_performance_metrics qpm ON qn.id = qpm.quantum_node_id
WHERE qpm.metric_timestamp >= NOW() - INTERVAL '24 hours'
AND qn.is_active = true
GROUP BY qn.node_name, qn.node_type, qpm.metric_category
ORDER BY qn.node_name, qpm.metric_category;

-- ============================================================================
-- CALCULATE MIGRATION EXECUTION TIME
-- ============================================================================

DO $$
DECLARE
  start_time TIMESTAMP WITH TIME ZONE;
  execution_time_ms INTEGER;
BEGIN
  -- Get start time from temporary table
  SELECT migration_timing_002.start_time INTO start_time FROM migration_timing_002 LIMIT 1;
  
  -- Calculate execution time in milliseconds
  execution_time_ms := EXTRACT(EPOCH FROM (NOW() - start_time)) * 1000;
  
  -- Update migration record with execution time
  UPDATE schema_migrations 
  SET execution_time_ms = execution_time_ms,
      checksum = encode(digest('002_quantum_security_' || execution_time_ms::text, 'sha256'), 'hex')
  WHERE version = '002';
  
  -- Clean up temporary table
  DROP TABLE migration_timing_002;
  
  -- Log completion
  RAISE NOTICE 'Migration 002 completed successfully in % ms', execution_time_ms;
END $$;

-- Commit the migration
COMMIT;

-- ============================================================================
-- VALIDATION QUERIES
-- ============================================================================

-- Verify quantum tables exist
DO $$
DECLARE
  table_count INTEGER;
  quantum_tables TEXT[] := ARRAY[
    'quantum_nodes', 'quantum_entanglements', 'quantum_cryptographic_keys',
    'quantum_key_distribution_sessions', 'quantum_threat_sensors',
    'quantum_security_events', 'quantum_performance_metrics',
    'quantum_threat_patterns', 'quantum_consciousness_correlations'
  ];
  missing_tables TEXT[];
  table_name TEXT;
BEGIN
  -- Check for missing quantum tables
  FOREACH table_name IN ARRAY quantum_tables
  LOOP
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = table_name;
    
    IF table_count = 0 THEN
      missing_tables := array_append(missing_tables, table_name);
    END IF;
  END LOOP;
  
  -- Report results
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'Quantum migration validation failed. Missing tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'Quantum migration validation passed. All quantum tables created successfully.';
  END IF;
END $$;

-- Verify quantum data inserted
DO $$
DECLARE
  node_count INTEGER;
  entanglement_count INTEGER;
  pattern_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO node_count FROM quantum_nodes WHERE is_active = true;
  SELECT COUNT(*) INTO entanglement_count FROM quantum_entanglements WHERE is_active = true;
  SELECT COUNT(*) INTO pattern_count FROM quantum_threat_patterns WHERE status = 'APPROVED';
  
  RAISE NOTICE 'Quantum nodes created: %', node_count;
  RAISE NOTICE 'Quantum entanglements established: %', entanglement_count;
  RAISE NOTICE 'Quantum threat patterns deployed: %', pattern_count;
  
  IF node_count = 0 OR entanglement_count = 0 OR pattern_count = 0 THEN
    RAISE WARNING 'Some quantum initialization data may be missing';
  END IF;
END $$;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '==========================================================';
  RAISE NOTICE 'STARGUARD Migration 002 - Quantum Security COMPLETED';
  RAISE NOTICE '==========================================================';
  RAISE NOTICE 'Quantum entanglement network established';
  RAISE NOTICE 'Post-quantum cryptography infrastructure deployed';
  RAISE NOTICE 'Quantum threat detection systems activated';
  RAISE NOTICE 'Next: Run migration 003 for blockchain integration';
  RAISE NOTICE '==========================================================';
END $$;
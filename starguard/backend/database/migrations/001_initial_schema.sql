/**
 * STARGUARD Database Migration 001 - Initial Schema
 * 
 * Creates the foundational database structure for STARGUARD
 * Advanced Security System with consciousness-enhanced features.
 * 
 * Migration: 001_initial_schema
 * Created: 2024-07-08
 * Author: STARGUARD Database Team
 * 
 * @version 1.0.0
 * @classification DATABASE_MIGRATION
 */

-- Migration metadata
INSERT INTO schema_migrations (version, description, applied_at) VALUES 
('001', 'Initial STARGUARD schema with consciousness and quantum features', NOW())
ON CONFLICT (version) DO NOTHING;

-- Set migration context
SET search_path TO public;
SET timezone TO 'UTC';

-- ============================================================================
-- MIGRATION UP - Apply Changes
-- ============================================================================

-- Create schema_migrations table if not exists (for tracking migrations)
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(20) PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checksum TEXT,
  execution_time_ms INTEGER
);

-- Begin migration transaction
BEGIN;

-- Record migration start time
DO $$
DECLARE
  start_time TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Store start time in a temporary table for later calculation
  CREATE TEMP TABLE migration_timing (start_time TIMESTAMP WITH TIME ZONE);
  INSERT INTO migration_timing VALUES (start_time);
END $$;

-- ============================================================================
-- CORE FOUNDATION TABLES
-- ============================================================================

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  consciousness_level consciousness_level DEFAULT 'BASIC',
  security_clearance INTEGER DEFAULT 1 CHECK (security_clearance >= 1 AND security_clearance <= 10),
  quantum_key_id UUID,
  contact_info JSONB,
  compliance_certifications JSONB,
  threat_sharing_agreements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_organization_type CHECK (type IN ('GOVERNMENT', 'CORPORATION', 'RESEARCH', 'SECURITY_AGENCY', 'NGO', 'CONSCIOUSNESS_COLLECTIVE'))
);

-- Users table with consciousness profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  username CITEXT UNIQUE NOT NULL,
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(100) DEFAULT 'ANALYST',
  permissions JSONB DEFAULT '[]',
  consciousness_profile JSONB,
  quantum_signature JSONB,
  security_clearance INTEGER DEFAULT 1 CHECK (security_clearance >= 1 AND security_clearance <= 10),
  awareness_level DECIMAL(5,4) DEFAULT 0.5000 CHECK (awareness_level >= 0 AND awareness_level <= 1),
  coherence_score DECIMAL(5,4) DEFAULT 0.5000 CHECK (coherence_score >= 0 AND coherence_score <= 1),
  field_sensitivity DECIMAL(5,4) DEFAULT 0.5000 CHECK (field_sensitivity >= 0 AND field_sensitivity <= 1),
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret TEXT,
  api_key_hash TEXT,
  last_consciousness_sync TIMESTAMP WITH TIME ZONE,
  password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_role CHECK (role IN ('ADMIN', 'ANALYST', 'INVESTIGATOR', 'CONSCIOUSNESS_RESEARCHER', 'QUANTUM_SPECIALIST', 'BLOCKCHAIN_VALIDATOR', 'EVOLUTIONARY_SCIENTIST'))
);

-- ============================================================================
-- CONSCIOUSNESS ENGINE TABLES
-- ============================================================================

-- Consciousness measurement devices
CREATE TABLE IF NOT EXISTS consciousness_measurement_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_name VARCHAR(255) NOT NULL,
  device_type VARCHAR(100) NOT NULL,
  location GEOMETRY(POINT, 4326),
  calibration_data JSONB,
  sensitivity_range JSONB,
  quantum_coupling_enabled BOOLEAN DEFAULT false,
  morphic_field_detection BOOLEAN DEFAULT false,
  last_calibration TIMESTAMP WITH TIME ZONE,
  calibration_interval_hours INTEGER DEFAULT 168, -- Weekly
  operational_status VARCHAR(50) DEFAULT 'ACTIVE',
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  firmware_version VARCHAR(50),
  is_active BOOLEAN DEFAULT true
);

-- Consciousness field measurements
CREATE TABLE IF NOT EXISTS consciousness_field_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES consciousness_measurement_devices(id) ON DELETE SET NULL,
  measurement_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location GEOMETRY(POINT, 4326),
  field_strength DECIMAL(10,8) NOT NULL CHECK (field_strength >= 0 AND field_strength <= 1),
  coherence_level DECIMAL(10,8) NOT NULL CHECK (coherence_level >= 0 AND coherence_level <= 1),
  awareness_density DECIMAL(10,8) NOT NULL CHECK (awareness_density >= 0 AND awareness_density <= 1),
  frequency_spectrum JSONB,
  harmonic_patterns JSONB,
  field_disturbances JSONB,
  consciousness_patterns JSONB,
  quantum_entanglement_data JSONB,
  morphic_resonance JSONB,
  environmental_factors JSONB,
  measurement_quality_score DECIMAL(5,4) DEFAULT 1.0,
  anomaly_detected BOOLEAN DEFAULT false,
  anomaly_details JSONB,
  consciousness_hash TEXT GENERATED ALWAYS AS (
    calculate_consciousness_hash(field_strength, coherence_level, awareness_density)
  ) STORED
);

-- Consciousness patterns library
CREATE TABLE IF NOT EXISTS consciousness_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_name VARCHAR(255),
  pattern_type VARCHAR(100) NOT NULL,
  pattern_signature TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  recognition_confidence DECIMAL(5,4) NOT NULL CHECK (recognition_confidence >= 0 AND recognition_confidence <= 1),
  frequency_hz DECIMAL(10,2),
  amplitude DECIMAL(10,6),
  phase_shift DECIMAL(10,6),
  bandwidth_hz DECIMAL(10,2),
  consciousness_influence DECIMAL(5,4) CHECK (consciousness_influence >= 0 AND consciousness_influence <= 1),
  quantum_coherence DECIMAL(5,4) CHECK (quantum_coherence >= 0 AND quantum_coherence <= 1),
  morphic_resonance_strength DECIMAL(5,4) CHECK (morphic_resonance_strength >= 0 AND morphic_resonance_strength <= 1),
  threat_correlation DECIMAL(5,4) DEFAULT 0.0,
  security_impact_assessment JSONB,
  first_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  detection_count INTEGER DEFAULT 1,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verification_timestamp TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT false,
  is_threat_indicator BOOLEAN DEFAULT false,
  
  CONSTRAINT valid_pattern_type CHECK (pattern_type IN ('AWARENESS', 'COHERENCE', 'INTUITION', 'FIELD_RESONANCE', 'CONSCIOUSNESS_ATTACK', 'MEDITATION_STATE', 'COLLECTIVE_CONSCIOUSNESS'))
);

-- ============================================================================
-- THREAT INTELLIGENCE TABLES
-- ============================================================================

-- Threat data sources
CREATE TABLE IF NOT EXISTS threat_data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_name VARCHAR(255) NOT NULL,
  source_type VARCHAR(100) NOT NULL,
  source_url TEXT,
  api_endpoint TEXT,
  authentication_config JSONB,
  data_format VARCHAR(50) DEFAULT 'JSON',
  consciousness_enhanced BOOLEAN DEFAULT false,
  quantum_verified BOOLEAN DEFAULT false,
  reliability_score DECIMAL(5,4) DEFAULT 0.5,
  update_frequency_minutes INTEGER DEFAULT 60,
  last_successful_update TIMESTAMP WITH TIME ZONE,
  total_indicators_received BIGINT DEFAULT 0,
  false_positive_rate DECIMAL(5,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_source_type CHECK (source_type IN ('FEED', 'API', 'MANUAL', 'CONSCIOUSNESS_SENSOR', 'QUANTUM_DETECTOR', 'BLOCKCHAIN_ORACLE', 'EVOLUTIONARY_PREDICTOR'))
);

-- Core threat intelligence
CREATE TABLE IF NOT EXISTS threat_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES threat_data_sources(id) ON DELETE SET NULL,
  threat_type VARCHAR(100) NOT NULL,
  severity threat_severity NOT NULL,
  title VARCHAR(500),
  description TEXT,
  source_identifier TEXT,
  external_references JSONB,
  raw_data JSONB NOT NULL,
  processed_data JSONB,
  indicators_of_compromise JSONB,
  attack_patterns JSONB,
  tactics_techniques_procedures JSONB,
  consciousness_analysis JSONB,
  quantum_signature JSONB,
  morphic_field_correlation JSONB,
  threat_score DECIMAL(5,4) NOT NULL CHECK (threat_score >= 0 AND threat_score <= 1),
  confidence_level DECIMAL(5,4) NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),
  false_positive_probability DECIMAL(5,4) CHECK (false_positive_probability >= 0 AND false_positive_probability <= 1),
  impact_assessment JSONB,
  mitigation_strategies JSONB,
  related_threats UUID[],
  kill_chain_phases JSONB,
  geographical_scope JSONB,
  industry_targets JSONB,
  consciousness_verification_hash TEXT,
  quantum_proof JSONB,
  blockchain_hash TEXT,
  reputation_score DECIMAL(5,4) DEFAULT 0.5,
  community_votes JSONB DEFAULT '{"upvotes": 0, "downvotes": 0}',
  sharing_restrictions JSONB,
  data_classification VARCHAR(50) DEFAULT 'TLP_WHITE',
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_count INTEGER DEFAULT 0,
  sharing_count INTEGER DEFAULT 0,
  
  CONSTRAINT valid_threat_type CHECK (threat_type IN ('MALWARE', 'PHISHING', 'BOTNET', 'APT', 'INSIDER_THREAT', 'CONSCIOUSNESS_MANIPULATION', 'QUANTUM_INTERFERENCE', 'REALITY_DISTORTION', 'TEMPORAL_ANOMALY', 'MORPHIC_ATTACK')),
  CONSTRAINT valid_data_classification CHECK (data_classification IN ('TLP_WHITE', 'TLP_GREEN', 'TLP_AMBER', 'TLP_RED'))
);

-- Real-time threat events
CREATE TABLE IF NOT EXISTS threat_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  threat_intelligence_id UUID REFERENCES threat_intelligence(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  detection_source VARCHAR(100) NOT NULL,
  source_ip INET,
  destination_ip INET,
  source_port INTEGER CHECK (source_port >= 0 AND source_port <= 65535),
  destination_port INTEGER CHECK (destination_port >= 0 AND destination_port <= 65535),
  protocol VARCHAR(20),
  payload_size_bytes BIGINT,
  payload_data JSONB,
  event_metadata JSONB,
  network_flow_data JSONB,
  consciousness_impact DECIMAL(5,4) CHECK (consciousness_impact >= 0 AND consciousness_impact <= 1),
  quantum_correlation DECIMAL(5,4) CHECK (quantum_correlation >= 0 AND quantum_correlation <= 1),
  morphic_field_disturbance DECIMAL(5,4) CHECK (morphic_field_disturbance >= 0 AND morphic_field_disturbance <= 1),
  reality_alteration_level DECIMAL(5,4) CHECK (reality_alteration_level >= 0 AND reality_alteration_level <= 1),
  temporal_stability_impact DECIMAL(5,4) CHECK (temporal_stability_impact >= 0 AND temporal_stability_impact <= 1),
  processing_status VARCHAR(50) DEFAULT 'PENDING',
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  response_actions JSONB,
  containment_measures JSONB,
  evidence_collected JSONB,
  investigation_notes TEXT,
  false_positive BOOLEAN,
  escalated BOOLEAN DEFAULT false,
  escalated_at TIMESTAMP WITH TIME ZONE,
  escalated_to UUID REFERENCES users(id) ON DELETE SET NULL,
  
  CONSTRAINT valid_processing_status CHECK (processing_status IN ('PENDING', 'PROCESSING', 'ANALYZED', 'RESPONDED', 'CLOSED', 'ESCALATED')),
  CONSTRAINT valid_event_type CHECK (event_type IN ('DETECTION', 'ALERT', 'INCIDENT', 'INVESTIGATION', 'RESPONSE', 'CONTAINMENT', 'RECOVERY'))
);

-- Attack patterns and signatures
CREATE TABLE IF NOT EXISTS attack_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_name VARCHAR(255) NOT NULL,
  pattern_description TEXT,
  pattern_category VARCHAR(100) NOT NULL,
  attack_vector VARCHAR(100) NOT NULL,
  mitre_technique_id VARCHAR(20),
  consciousness_technique VARCHAR(100),
  quantum_methodology VARCHAR(100),
  morphic_resonance_exploitation VARCHAR(100),
  pattern_rules JSONB NOT NULL,
  detection_logic JSONB NOT NULL,
  signature_data JSONB,
  behavioral_indicators JSONB,
  network_signatures JSONB,
  host_signatures JSONB,
  evasion_techniques JSONB,
  consciousness_countermeasures JSONB,
  quantum_defenses JSONB,
  effectiveness_score DECIMAL(5,4) NOT NULL CHECK (effectiveness_score >= 0 AND effectiveness_score <= 1),
  false_positive_rate DECIMAL(5,4) NOT NULL CHECK (false_positive_rate >= 0 AND false_positive_rate <= 1),
  detection_rate DECIMAL(5,4) CHECK (detection_rate >= 0 AND detection_rate <= 1),
  computational_complexity JSONB,
  resource_requirements JSONB,
  evolutionary_adaptation JSONB,
  morphic_inheritance JSONB,
  threat_landscape_coverage JSONB,
  industry_specificity JSONB,
  geographic_effectiveness JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_tested TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'DRAFT',
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_pattern_status CHECK (status IN ('DRAFT', 'REVIEW', 'APPROVED', 'DEPLOYED', 'DEPRECATED')),
  CONSTRAINT valid_attack_vector CHECK (attack_vector IN ('NETWORK', 'EMAIL', 'WEB', 'ENDPOINT', 'SOCIAL_ENGINEERING', 'SUPPLY_CHAIN', 'CONSCIOUSNESS_FIELD', 'QUANTUM_ENTANGLEMENT', 'REALITY_MANIPULATION'))
);

-- ============================================================================
-- SECURITY OPERATIONS TABLES
-- ============================================================================

-- Security incidents
CREATE TABLE IF NOT EXISTS security_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  severity threat_severity NOT NULL,
  status VARCHAR(50) DEFAULT 'OPEN',
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  threat_intelligence_ids UUID[],
  attack_pattern_ids UUID[],
  affected_systems JSONB,
  impact_assessment JSONB,
  business_impact VARCHAR(100),
  consciousness_correlation DECIMAL(5,4),
  quantum_involvement BOOLEAN DEFAULT false,
  morphic_field_disruption BOOLEAN DEFAULT false,
  timeline_events JSONB,
  evidence_collected JSONB,
  investigation_notes TEXT,
  containment_actions JSONB,
  mitigation_steps JSONB,
  recovery_actions JSONB,
  lessons_learned TEXT,
  root_cause_analysis JSONB,
  external_communications JSONB,
  regulatory_notifications JSONB,
  compliance_requirements JSONB,
  discovered_at TIMESTAMP WITH TIME ZONE,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  contained_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  sla_breach BOOLEAN DEFAULT false,
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  
  CONSTRAINT valid_incident_status CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED')),
  CONSTRAINT valid_business_impact CHECK (business_impact IN ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  CONSTRAINT valid_category CHECK (category IN ('SECURITY_BREACH', 'DATA_LOSS', 'SYSTEM_COMPROMISE', 'MALWARE', 'PHISHING', 'INSIDER_THREAT', 'CONSCIOUSNESS_ANOMALY', 'QUANTUM_DISTURBANCE', 'REALITY_ALTERATION'))
);

-- Response orchestration workflows
CREATE TABLE IF NOT EXISTS response_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_name VARCHAR(255) NOT NULL,
  workflow_description TEXT,
  trigger_conditions JSONB NOT NULL,
  workflow_steps JSONB NOT NULL,
  automation_level VARCHAR(50) DEFAULT 'SEMI_AUTOMATED',
  consciousness_guidance BOOLEAN DEFAULT false,
  quantum_enhanced BOOLEAN DEFAULT false,
  soar_integration JSONB,
  approval_requirements JSONB,
  escalation_rules JSONB,
  success_criteria JSONB,
  rollback_procedures JSONB,
  execution_timeout_minutes INTEGER DEFAULT 60,
  max_execution_attempts INTEGER DEFAULT 3,
  notification_settings JSONB,
  compliance_checks JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_automation_level CHECK (automation_level IN ('MANUAL', 'SEMI_AUTOMATED', 'FULLY_AUTOMATED', 'CONSCIOUSNESS_GUIDED'))
);

-- Workflow executions
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES response_workflows(id) ON DELETE CASCADE,
  incident_id UUID REFERENCES security_incidents(id) ON DELETE CASCADE,
  execution_context JSONB,
  execution_steps JSONB,
  current_step INTEGER DEFAULT 1,
  execution_status VARCHAR(50) DEFAULT 'RUNNING',
  started_by UUID REFERENCES users(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_details JSONB,
  execution_logs JSONB,
  consciousness_enhancement_used BOOLEAN DEFAULT false,
  quantum_computation_used BOOLEAN DEFAULT false,
  performance_metrics JSONB,
  output_artifacts JSONB,
  approval_history JSONB,
  
  CONSTRAINT valid_execution_status CHECK (execution_status IN ('RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED', 'WAITING_APPROVAL'))
);

-- ============================================================================
-- BASIC INDEXES FOR INITIAL MIGRATION
-- ============================================================================

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations (type);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations (is_active) WHERE is_active = true;

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users (organization_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_consciousness ON users (awareness_level, coherence_score);

-- Consciousness measurements indexes
CREATE INDEX IF NOT EXISTS idx_consciousness_measurements_timestamp ON consciousness_field_measurements (measurement_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_consciousness_measurements_device ON consciousness_field_measurements (device_id);
CREATE INDEX IF NOT EXISTS idx_consciousness_measurements_location ON consciousness_field_measurements USING gist (location);
CREATE INDEX IF NOT EXISTS idx_consciousness_measurements_anomaly ON consciousness_field_measurements (anomaly_detected) WHERE anomaly_detected = true;

-- Threat intelligence indexes
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_type ON threat_intelligence (threat_type);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_severity ON threat_intelligence (severity);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_score ON threat_intelligence (threat_score DESC);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_detected ON threat_intelligence (detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_verified ON threat_intelligence (is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_source ON threat_intelligence (source_id);

-- Threat events indexes
CREATE INDEX IF NOT EXISTS idx_threat_events_timestamp ON threat_events (event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_threat_events_threat_id ON threat_events (threat_intelligence_id);
CREATE INDEX IF NOT EXISTS idx_threat_events_source_ip ON threat_events (source_ip);
CREATE INDEX IF NOT EXISTS idx_threat_events_status ON threat_events (processing_status);
CREATE INDEX IF NOT EXISTS idx_threat_events_escalated ON threat_events (escalated) WHERE escalated = true;

-- Attack patterns indexes
CREATE INDEX IF NOT EXISTS idx_attack_patterns_category ON attack_patterns (pattern_category);
CREATE INDEX IF NOT EXISTS idx_attack_patterns_vector ON attack_patterns (attack_vector);
CREATE INDEX IF NOT EXISTS idx_attack_patterns_active ON attack_patterns (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_attack_patterns_effectiveness ON attack_patterns (effectiveness_score DESC);

-- Security incidents indexes
CREATE INDEX IF NOT EXISTS idx_security_incidents_number ON security_incidents (incident_number);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents (status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents (severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_assigned ON security_incidents (assigned_to);
CREATE INDEX IF NOT EXISTS idx_security_incidents_reported ON security_incidents (reported_at DESC);

-- Response workflows indexes
CREATE INDEX IF NOT EXISTS idx_response_workflows_active ON response_workflows (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions (execution_status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started ON workflow_executions (started_at DESC);

-- ============================================================================
-- INITIAL DATA INSERTION
-- ============================================================================

-- Insert default threat data sources
INSERT INTO threat_data_sources (source_name, source_type, reliability_score, consciousness_enhanced) VALUES
('STARGUARD Central Intelligence', 'API', 0.95, true),
('Consciousness Field Monitoring Network', 'CONSCIOUSNESS_SENSOR', 0.90, true),
('Quantum Threat Detection Grid', 'QUANTUM_DETECTOR', 0.88, false),
('Community Threat Sharing', 'FEED', 0.75, false),
('Manual Intelligence Reports', 'MANUAL', 0.85, false)
ON CONFLICT DO NOTHING;

-- Insert default consciousness measurement device
INSERT INTO consciousness_measurement_devices (device_name, device_type, location, operational_status) VALUES
('STARGUARD-CMD-001', 'QUANTUM_FIELD_SENSOR', ST_Point(-74.0060, 40.7128, 4326), 'ACTIVE'),
('STARGUARD-CMD-002', 'MORPHIC_RESONANCE_DETECTOR', ST_Point(-87.6298, 41.8781, 4326), 'ACTIVE'),
('STARGUARD-CMD-003', 'CONSCIOUSNESS_COHERENCE_MONITOR', ST_Point(-122.4194, 37.7749, 4326), 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Insert default attack patterns
INSERT INTO attack_patterns (
  pattern_name, pattern_category, attack_vector, pattern_rules, detection_logic, 
  effectiveness_score, false_positive_rate, created_by
) VALUES
(
  'Basic Malware Detection',
  'MALWARE',
  'ENDPOINT',
  '{"file_hash_check": true, "behavioral_analysis": true, "signature_match": true}',
  '{"hash_database_lookup": true, "sandbox_execution": true, "ml_classification": true}',
  0.85,
  0.05,
  NULL
),
(
  'Consciousness Field Manipulation',
  'CONSCIOUSNESS_ATTACK',
  'CONSCIOUSNESS_FIELD',
  '{"field_disruption_threshold": 0.3, "coherence_degradation": true, "awareness_suppression": true}',
  '{"field_strength_monitoring": true, "pattern_recognition": true, "temporal_analysis": true}',
  0.78,
  0.12,
  NULL
),
(
  'Quantum Entanglement Interference',
  'QUANTUM_ATTACK',
  'QUANTUM_ENTANGLEMENT',
  '{"decoherence_injection": true, "bell_state_corruption": true, "measurement_manipulation": true}',
  '{"fidelity_monitoring": true, "correlation_analysis": true, "quantum_state_verification": true}',
  0.82,
  0.08,
  NULL
)
ON CONFLICT DO NOTHING;

-- Insert default response workflow
INSERT INTO response_workflows (
  workflow_name, workflow_description, trigger_conditions, workflow_steps, 
  automation_level, consciousness_guidance
) VALUES
(
  'High Severity Threat Response',
  'Automated response workflow for high severity threats',
  '{"severity": ["HIGH", "CRITICAL"], "consciousness_impact": {"threshold": 0.7}}',
  '[
    {"step": 1, "action": "isolate_affected_systems", "automated": true},
    {"step": 2, "action": "notify_security_team", "automated": true},
    {"step": 3, "action": "consciousness_field_stabilization", "automated": false},
    {"step": 4, "action": "collect_evidence", "automated": true},
    {"step": 5, "action": "initiate_investigation", "automated": false}
  ]',
  'SEMI_AUTOMATED',
  true
),
(
  'Consciousness Anomaly Response',
  'Specialized workflow for consciousness field anomalies',
  '{"consciousness_impact": {"threshold": 0.5}, "field_disturbance": {"detected": true}}',
  '[
    {"step": 1, "action": "field_recalibration", "automated": true},
    {"step": 2, "action": "consciousness_enhancement_protocols", "automated": false},
    {"step": 3, "action": "morphic_field_stabilization", "automated": false},
    {"step": 4, "action": "quantum_coherence_restoration", "automated": true}
  ]',
  'CONSCIOUSNESS_GUIDED',
  true
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CALCULATE MIGRATION EXECUTION TIME
-- ============================================================================

DO $$
DECLARE
  start_time TIMESTAMP WITH TIME ZONE;
  execution_time_ms INTEGER;
BEGIN
  -- Get start time from temporary table
  SELECT migration_timing.start_time INTO start_time FROM migration_timing LIMIT 1;
  
  -- Calculate execution time in milliseconds
  execution_time_ms := EXTRACT(EPOCH FROM (NOW() - start_time)) * 1000;
  
  -- Update migration record with execution time
  UPDATE schema_migrations 
  SET execution_time_ms = execution_time_ms,
      checksum = encode(digest('001_initial_schema_' || execution_time_ms::text, 'sha256'), 'hex')
  WHERE version = '001';
  
  -- Clean up temporary table
  DROP TABLE migration_timing;
  
  -- Log completion
  RAISE NOTICE 'Migration 001 completed successfully in % ms', execution_time_ms;
END $$;

-- Commit the migration
COMMIT;

-- ============================================================================
-- VALIDATION QUERIES
-- ============================================================================

-- Verify critical tables exist
DO $$
DECLARE
  table_count INTEGER;
  expected_tables TEXT[] := ARRAY[
    'organizations', 'users', 'consciousness_field_measurements', 
    'threat_intelligence', 'threat_events', 'attack_patterns',
    'security_incidents', 'response_workflows'
  ];
  missing_tables TEXT[];
  table_name TEXT;
BEGIN
  -- Check for missing tables
  FOREACH table_name IN ARRAY expected_tables
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
    RAISE EXCEPTION 'Migration validation failed. Missing tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'Migration validation passed. All expected tables created successfully.';
  END IF;
END $$;

-- Verify indexes exist
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count 
  FROM pg_indexes 
  WHERE schemaname = 'public';
  
  IF index_count < 20 THEN
    RAISE WARNING 'Only % indexes created, expected at least 20', index_count;
  ELSE
    RAISE NOTICE '% indexes created successfully', index_count;
  END IF;
END $$;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '==========================================================';
  RAISE NOTICE 'STARGUARD Migration 001 - Initial Schema COMPLETED';
  RAISE NOTICE '==========================================================';
  RAISE NOTICE 'Database is ready for consciousness-enhanced threat detection';
  RAISE NOTICE 'Next: Run migration 002 for quantum security features';
  RAISE NOTICE '==========================================================';
END $$;
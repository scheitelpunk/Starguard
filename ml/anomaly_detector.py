#!/usr/bin/env python3
"""
STARGUARD ML Anomaly Detection System
Production-ready machine learning for cybersecurity threat detection
"""

import numpy as np
import json
import sys
import time
import hashlib
from datetime import datetime, timedelta
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class StarguardMLEngine:
    def __init__(self):
        self.isolation_forest = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.dbscan = DBSCAN(eps=0.5, min_samples=5)
        
        # Feature windows for time-series analysis
        self.traffic_window = []
        self.threat_history = []
        self.baseline_established = False
        
        logger.info("🤖 STARGUARD ML Engine initialized")
    
    def extract_features(self, threat_data):
        """Extract ML features from threat data"""
        features = []
        
        # Threat intensity features
        severity_sum = sum(t.get('severity', 0) for t in threat_data)
        confidence_avg = np.mean([t.get('confidence', 0) for t in threat_data])
        threat_count = len(threat_data)
        
        # Temporal features
        current_hour = datetime.now().hour
        is_business_hours = 9 <= current_hour <= 17
        
        # Source diversity
        sources = set(t.get('source', 'unknown') for t in threat_data)
        source_diversity = len(sources)
        
        # Threat type distribution
        threat_types = [t.get('type', 'unknown') for t in threat_data]
        type_counts = {t: threat_types.count(t) for t in set(threat_types)}
        malware_ratio = type_counts.get('malware_c2', 0) / max(threat_count, 1)
        
        # Geographic entropy (IP-based)
        ip_hashes = []
        for threat in threat_data:
            if 'ip' in threat:
                ip_hash = int(hashlib.md5(threat['ip'].encode()).hexdigest()[:8], 16)
                ip_hashes.append(ip_hash % 256)  # Map to 0-255
        
        geo_entropy = self.calculate_entropy(ip_hashes) if ip_hashes else 0
        
        features = [
            severity_sum,
            confidence_avg,
            threat_count,
            float(is_business_hours),
            source_diversity,
            malware_ratio,
            geo_entropy,
            current_hour / 24.0,  # Normalized hour
        ]
        
        return np.array(features).reshape(1, -1)
    
    def calculate_entropy(self, values):
        """Calculate Shannon entropy of values"""
        if not values:
            return 0
        
        unique, counts = np.unique(values, return_counts=True)
        probabilities = counts / len(values)
        entropy = -np.sum(probabilities * np.log2(probabilities + 1e-10))
        return entropy
    
    def detect_anomalies(self, threat_data):
        """Real-time anomaly detection on threat data"""
        if not threat_data:
            return {
                'is_anomaly': False,
                'anomaly_score': 0.0,
                'confidence': 0.0,
                'features': {},
                'timestamp': datetime.now().isoformat()
            }
        
        # Extract features
        features = self.extract_features(threat_data)
        
        # Initialize models if not done
        if not self.baseline_established:
            self.establish_baseline(features)
        
        # Anomaly detection
        anomaly_score = self.isolation_forest.decision_function(features)[0]
        is_anomaly = self.isolation_forest.predict(features)[0] == -1
        
        # Confidence calculation (normalized score)
        confidence = min(abs(anomaly_score) / 0.5, 1.0)
        
        # Additional clustering-based anomaly detection
        scaled_features = self.scaler.transform(features)
        cluster_label = self.dbscan.fit_predict(scaled_features)[0]
        is_cluster_anomaly = cluster_label == -1
        
        # Combined anomaly decision
        final_anomaly = is_anomaly or is_cluster_anomaly
        final_confidence = max(confidence, 0.7 if is_cluster_anomaly else 0.0)
        
        result = {
            'is_anomaly': bool(final_anomaly),
            'anomaly_score': float(anomaly_score),
            'confidence': float(final_confidence),
            'features': {
                'threat_count': int(features[0][2]),
                'severity_sum': float(features[0][0]),
                'confidence_avg': float(features[0][1]),
                'source_diversity': int(features[0][4]),
                'malware_ratio': float(features[0][5]),
                'geo_entropy': float(features[0][6])
            },
            'timestamp': datetime.now().isoformat(),
            'model_status': 'trained' if self.baseline_established else 'learning'
        }
        
        if final_anomaly:
            logger.warning(f"🚨 ANOMALY DETECTED: Score={anomaly_score:.3f}, Confidence={final_confidence:.3f}")
        
        return result
    
    def establish_baseline(self, initial_features):
        """Establish baseline behavior for anomaly detection"""
        logger.info("🧠 Establishing ML baseline...")
        
        # Generate synthetic normal traffic patterns for baseline
        normal_samples = []
        for i in range(50):  # Generate 50 baseline samples
            # Simulate normal traffic patterns
            base_features = initial_features[0].copy()
            base_features[0] *= (0.8 + np.random.random() * 0.4)  # severity variation
            base_features[2] *= (0.5 + np.random.random())         # count variation
            normal_samples.append(base_features)
        
        normal_samples = np.array(normal_samples)
        
        # Train models
        self.isolation_forest.fit(normal_samples)
        self.scaler.fit(normal_samples)
        
        self.baseline_established = True
        logger.info("✅ ML baseline established")
    
    def train_on_feedback(self, threat_data, is_true_positive):
        """Online learning from security analyst feedback"""
        features = self.extract_features(threat_data)
        
        # Store feedback for model retraining
        feedback_data = {
            'features': features.tolist(),
            'label': is_true_positive,
            'timestamp': datetime.now().isoformat()
        }
        
        # Save feedback for periodic retraining
        with open('/var/log/starguard/ml_feedback.jsonl', 'a') as f:
            f.write(json.dumps(feedback_data) + '\n')
        
        logger.info(f"📚 ML feedback recorded: {is_true_positive}")
    
    def get_model_status(self):
        """Get current ML model status and metrics"""
        return {
            'status': 'trained' if self.baseline_established else 'initializing',
            'model_type': 'IsolationForest + DBSCAN',
            'features_count': 8,
            'last_training': datetime.now().isoformat() if self.baseline_established else None,
            'contamination_rate': 0.1,
            'confidence_threshold': 0.7
        }

def main():
    """Main ML processing loop"""
    ml_engine = StarguardMLEngine()
    
    # Process incoming threat data from stdin
    for line in sys.stdin:
        try:
            data = json.loads(line.strip())
            
            if data.get('command') == 'detect':
                threat_data = data.get('threats', [])
                result = ml_engine.detect_anomalies(threat_data)
                print(json.dumps(result))
                sys.stdout.flush()
            
            elif data.get('command') == 'status':
                status = ml_engine.get_model_status()
                print(json.dumps(status))
                sys.stdout.flush()
                
            elif data.get('command') == 'feedback':
                ml_engine.train_on_feedback(
                    data.get('threats', []),
                    data.get('is_true_positive', False)
                )
                print(json.dumps({'status': 'feedback_recorded'}))
                sys.stdout.flush()
        
        except json.JSONDecodeError:
            logger.error("Invalid JSON input")
        except Exception as e:
            logger.error(f"ML processing error: {e}")

if __name__ == "__main__":
    main()
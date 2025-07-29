#!/usr/bin/env python3
"""
Generate synthetic training data for STARGUARD ML models
Creates realistic threat scenarios with consciousness-based features
"""

import json
import random
import numpy as np
from datetime import datetime, timedelta
import uuid
import os

class SyntheticDataGenerator:
    """Generate synthetic threat data for training."""
    
    def __init__(self):
        self.threat_types = [
            "reality_manipulation",
            "consciousness_disruption", 
            "quantum_intrusion",
            "temporal_anomaly",
            "financial_fraud",
            "aml_violation",
            "cyber_attack",
            "data_exfiltration",
            "ransomware",
            "supply_chain_attack"
        ]
        
        self.network_patterns = [
            "normal_traffic",
            "port_scan",
            "ddos_pattern",
            "lateral_movement",
            "data_staging",
            "c2_communication",
            "tor_usage",
            "vpn_hopping"
        ]
        
        self.consciousness_states = [
            "coherent",
            "disturbed",
            "fragmented",
            "elevated",
            "suppressed"
        ]
    
    def generate_threat_instance(self, is_malicious: bool = None) -> dict:
        """Generate a single threat instance."""
        if is_malicious is None:
            is_malicious = random.random() > 0.5
        
        # Base threat properties
        threat_id = f"threat-{uuid.uuid4()}"
        timestamp = datetime.now() - timedelta(
            hours=random.randint(0, 720)  # Up to 30 days ago
        )
        
        # Generate features based on malicious nature
        if is_malicious:
            # Malicious patterns
            consciousness_coherence = random.uniform(0.1, 0.4)
            consciousness_entropy = random.uniform(0.6, 0.95)
            field_disturbance = random.uniform(0.5, 0.95)
            awareness_level = random.uniform(0.2, 0.5)
            quantum_entanglement = random.uniform(0.6, 0.95)
            quantum_coherence = random.uniform(0.1, 0.4)
            severity = random.uniform(0.6, 0.95)
            threat_type = random.choice(self.threat_types[:6])  # More dangerous types
        else:
            # Benign patterns
            consciousness_coherence = random.uniform(0.7, 0.95)
            consciousness_entropy = random.uniform(0.1, 0.4)
            field_disturbance = random.uniform(0.0, 0.3)
            awareness_level = random.uniform(0.6, 0.9)
            quantum_entanglement = random.uniform(0.1, 0.4)
            quantum_coherence = random.uniform(0.7, 0.95)
            severity = random.uniform(0.0, 0.3)
            threat_type = random.choice(self.threat_types[6:])  # Less dangerous types
        
        # Network features
        network_features = {
            "packet_rate": random.uniform(100, 10000) * (2 if is_malicious else 1),
            "byte_rate": random.uniform(1000, 100000) * (1.5 if is_malicious else 1),
            "connection_count": random.randint(1, 1000) * (3 if is_malicious else 1),
            "port_diversity": random.uniform(0.1, 0.9),
            "protocol_anomaly": random.uniform(0.6, 0.9) if is_malicious else random.uniform(0.0, 0.3),
            "geo_diversity": random.uniform(0.5, 1.0) if is_malicious else random.uniform(0.0, 0.4)
        }
        
        # Behavioral features
        behavioral_features = {
            "access_pattern_deviation": random.uniform(0.5, 0.95) if is_malicious else random.uniform(0.0, 0.3),
            "time_anomaly": random.uniform(0.4, 0.9) if is_malicious else random.uniform(0.0, 0.2),
            "resource_usage_spike": random.uniform(0.6, 1.0) if is_malicious else random.uniform(0.1, 0.4),
            "failed_auth_rate": random.uniform(0.3, 0.8) if is_malicious else random.uniform(0.0, 0.1),
            "privilege_escalation": random.uniform(0.5, 0.9) if is_malicious else 0.0,
            "data_access_anomaly": random.uniform(0.4, 0.85) if is_malicious else random.uniform(0.0, 0.2)
        }
        
        # Temporal features
        temporal_features = {
            "hour_of_day": timestamp.hour / 24.0,
            "day_of_week": timestamp.weekday() / 7.0,
            "is_weekend": 1.0 if timestamp.weekday() >= 5 else 0.0,
            "is_business_hours": 1.0 if 9 <= timestamp.hour <= 17 else 0.0,
            "temporal_clustering": random.uniform(0.6, 0.95) if is_malicious else random.uniform(0.1, 0.4),
            "periodicity_score": random.uniform(0.0, 0.3) if is_malicious else random.uniform(0.6, 0.9)
        }
        
        # Graph features
        graph_centrality = random.uniform(0.6, 0.95) if is_malicious else random.uniform(0.1, 0.4)
        graph_clustering = random.uniform(0.7, 0.95) if is_malicious else random.uniform(0.2, 0.5)
        graph_connectivity = random.uniform(0.5, 0.9) if is_malicious else random.uniform(0.1, 0.4)
        
        # Quantum signature
        quantum_signature = f"QS-{int(consciousness_coherence*1000)}-{int(quantum_entanglement*1000)}-{uuid.uuid4().hex[:8]}"
        
        return {
            "threat_id": threat_id,
            "timestamp": timestamp.isoformat(),
            "threat_type": threat_type,
            "severity": severity,
            "confidence": random.uniform(0.7, 0.99),
            "network_features": network_features,
            "behavioral_features": behavioral_features,
            "temporal_features": temporal_features,
            "consciousness_coherence": consciousness_coherence,
            "consciousness_entropy": consciousness_entropy,
            "field_disturbance": field_disturbance,
            "awareness_level": awareness_level,
            "quantum_signature": quantum_signature,
            "quantum_entanglement": quantum_entanglement,
            "quantum_coherence": quantum_coherence,
            "graph_centrality": graph_centrality,
            "graph_clustering": graph_clustering,
            "graph_connectivity": graph_connectivity,
            "ground_truth_label": 1 if is_malicious else 0,
            "source_system": "STARGUARD_SYNTHETIC",
            "analyst_notes": f"Synthetic {'malicious' if is_malicious else 'benign'} instance"
        }
    
    def generate_dataset(self, 
                        n_samples: int = 10000, 
                        malicious_ratio: float = 0.3) -> list:
        """Generate a complete dataset."""
        dataset = []
        n_malicious = int(n_samples * malicious_ratio)
        n_benign = n_samples - n_malicious
        
        # Generate malicious samples
        for _ in range(n_malicious):
            dataset.append(self.generate_threat_instance(is_malicious=True))
        
        # Generate benign samples
        for _ in range(n_benign):
            dataset.append(self.generate_threat_instance(is_malicious=False))
        
        # Shuffle dataset
        random.shuffle(dataset)
        
        return dataset
    
    def generate_financial_crime_instance(self, crime_type: str) -> dict:
        """Generate specific financial crime instances."""
        instance = self.generate_threat_instance(is_malicious=True)
        
        if crime_type == "money_laundering":
            instance["threat_type"] = "aml_violation"
            instance["behavioral_features"]["transaction_velocity"] = random.uniform(0.7, 0.95)
            instance["behavioral_features"]["amount_variance"] = random.uniform(0.6, 0.9)
            instance["behavioral_features"]["layering_score"] = random.uniform(0.5, 0.85)
            instance["consciousness_entropy"] = random.uniform(0.8, 0.95)  # High entropy for obfuscation
            
        elif crime_type == "fraud":
            instance["threat_type"] = "financial_fraud"
            instance["behavioral_features"]["account_age_days"] = random.randint(0, 30)
            instance["behavioral_features"]["device_fingerprint_changes"] = random.randint(3, 10)
            instance["behavioral_features"]["location_anomaly"] = random.uniform(0.6, 0.95)
            instance["field_disturbance"] = random.uniform(0.7, 0.95)  # Reality manipulation
            
        elif crime_type == "insider_trading":
            instance["threat_type"] = "insider_trading"
            instance["temporal_features"]["trade_timing_anomaly"] = random.uniform(0.7, 0.95)
            instance["behavioral_features"]["information_access_pattern"] = random.uniform(0.6, 0.9)
            instance["graph_centrality"] = random.uniform(0.8, 0.95)  # High centrality for insiders
        
        return instance
    
    def save_dataset(self, dataset: list, filename: str) -> None:
        """Save dataset to JSON file."""
        output_dir = os.path.dirname(filename)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        with open(filename, 'w') as f:
            json.dump({
                "metadata": {
                    "version": "1.0.0",
                    "generated_at": datetime.now().isoformat(),
                    "generator": "STARGUARD_SyntheticDataGenerator",
                    "total_samples": len(dataset),
                    "features": {
                        "network": 6,
                        "behavioral": 6,
                        "temporal": 6,
                        "consciousness": 4,
                        "quantum": 3,
                        "graph": 3
                    }
                },
                "data": dataset
            }, f, indent=2)
        
        print(f"✅ Dataset saved to {filename}")
        print(f"📊 Total samples: {len(dataset)}")
        malicious_count = sum(1 for d in dataset if d['ground_truth_label'] == 1)
        print(f"🔴 Malicious: {malicious_count} ({malicious_count/len(dataset)*100:.1f}%)")
        print(f"🟢 Benign: {len(dataset) - malicious_count} ({(len(dataset) - malicious_count)/len(dataset)*100:.1f}%)")

def main():
    """Generate training datasets."""
    generator = SyntheticDataGenerator()
    
    # Generate main training dataset
    print("🎯 Generating main training dataset...")
    train_data = generator.generate_dataset(n_samples=50000, malicious_ratio=0.3)
    generator.save_dataset(train_data, "training_data/train_dataset.json")
    
    # Generate validation dataset
    print("\n🎯 Generating validation dataset...")
    val_data = generator.generate_dataset(n_samples=10000, malicious_ratio=0.3)
    generator.save_dataset(val_data, "training_data/val_dataset.json")
    
    # Generate test dataset with different distribution
    print("\n🎯 Generating test dataset...")
    test_data = generator.generate_dataset(n_samples=5000, malicious_ratio=0.4)
    generator.save_dataset(test_data, "training_data/test_dataset.json")
    
    # Generate specialized financial crime dataset
    print("\n🎯 Generating financial crime dataset...")
    financial_data = []
    for _ in range(1000):
        crime_type = random.choice(["money_laundering", "fraud", "insider_trading"])
        financial_data.append(generator.generate_financial_crime_instance(crime_type))
    
    # Add some benign financial transactions
    for _ in range(2000):
        instance = generator.generate_threat_instance(is_malicious=False)
        instance["threat_type"] = "legitimate_transaction"
        financial_data.append(instance)
    
    generator.save_dataset(financial_data, "training_data/financial_crime_dataset.json")
    
    print("\n✨ All datasets generated successfully!")

if __name__ == "__main__":
    main()
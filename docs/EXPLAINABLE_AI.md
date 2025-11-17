# Explainable AI (XAI) Engine Documentation

## Making AI Decisions Transparent and Auditable

The XAI Engine provides comprehensive explanations for AI model predictions using SHAP values, LIME, attention mechanisms, counterfactual explanations, and bias detection.

## Overview

Explainable AI (XAI) makes machine learning models interpretable and trustworthy by answering:
- **Why**: Why did the model make this prediction?
- **What**: What features were most important?
- **How**: How can we change the input to get a different outcome?
- **Fair**: Is the model biased against protected groups?

## Supported Methods

| Method | Type | Complexity | Use Case |
|--------|------|------------|----------|
| SHAP | Model-agnostic | O(2^n) | Global/local explanations |
| LIME | Model-agnostic | O(n) | Local explanations |
| Attention | Model-specific | O(1) | Neural networks |
| Counterfactuals | Search-based | O(n²) | What-if analysis |
| Bias Detection | Statistical | O(n) | Fairness auditing |

## Architecture

\`\`\`
┌────────────────────────────────────────────────────┐
│          XAI Engine Architecture                   │
├────────────────────────────────────────────────────┤
│  Explanation Methods                               │
│  ├── SHAP Explainer                               │
│  │   ├── TreeSHAP (for tree models)               │
│  │   ├── KernelSHAP (model-agnostic)              │
│  │   └── DeepSHAP (for neural networks)           │
│  ├── LIME Explainer                               │
│  │   ├── Tabular Data                            │
│  │   ├── Text Data                               │
│  │   └── Image Data                              │
│  ├── Attention Analyzer                           │
│  │   ├── Self-Attention                          │
│  │   ├── Cross-Attention                         │
│  │   └── Multi-Head Attention                    │
│  └── Counterfactual Generator                     │
│      ├── Nearest Neighbor Search                  │
│      ├── Gradient-Based Optimization              │
│      └── Genetic Algorithm Search                 │
├────────────────────────────────────────────────────┤
│  Bias Detection & Fairness                        │
│  ├── Demographic Parity                           │
│  ├── Equalized Odds                               │
│  ├── Equal Opportunity                            │
│  └── Calibration Analysis                         │
├────────────────────────────────────────────────────┤
│  Visualization & Reporting                        │
│  ├── Feature Importance Plots                     │
│  ├── Decision Paths                               │
│  ├── Counterfactual Visualizations                │
│  └── Fairness Reports                             │
└────────────────────────────────────────────────────┘
\`\`\`

## API Reference

### Initialize XAI Engine

\`\`\`typescript
import { XAIEngine } from './xai/XAIEngine';

const xai = new XAIEngine({
  methods: ['shap', 'lime', 'attention', 'counterfactuals'],
  bias_detection: {
    enabled: true,
    protected_attributes: ['gender', 'race', 'age'],
    fairness_metrics: ['demographic_parity', 'equalized_odds']
  },
  caching: {
    enabled: true,
    max_cache_size: 10000
  }
});
\`\`\`

### SHAP Explanations

\`\`\`typescript
// Explain a prediction using SHAP
const explanation = await xai.explainPrediction({
  model: securityModel,
  input: {
    ip_address: '192.168.1.100',
    failed_logins: 5,
    traffic_volume: 10000,
    geo_location: 'US'
  },
  method: 'shap'
});

console.log('SHAP values:', explanation.feature_importance);
// {
//   failed_logins: 0.45,  // Most important
//   traffic_volume: 0.30,
//   geo_location: 0.15,
//   ip_address: 0.10
// }

console.log('Base value:', explanation.base_value); // Model's average prediction
console.log('Prediction:', explanation.prediction);  // Actual prediction
\`\`\`

### LIME Explanations

\`\`\`typescript
// Local Interpretable Model-agnostic Explanations
const limeExplanation = await xai.explainWithLIME({
  model: threatDetectionModel,
  instance: suspiciousEvent,
  num_samples: 5000,
  num_features: 10
});

console.log('Top 5 features:', limeExplanation.top_features);
// [
//   { feature: 'port_scan_detected', weight: 0.72 },
//   { feature: 'unusual_traffic_pattern', weight: 0.58 },
//   { feature: 'known_malicious_ip', weight: 0.51 },
//   { feature: 'failed_auth_attempts', weight: 0.43 },
//   { feature: 'encrypted_traffic', weight: 0.31 }
// ]
\`\`\`

### Attention Analysis

\`\`\`typescript
// For neural network models
const attentionWeights = await xai.analyzeAttention({
  model: neuralThreatModel,
  input: networkTrafficSequence,
  layer: 'final_attention'
});

console.log('Attention distribution:', attentionWeights.weights);
// Shows which parts of input sequence the model focused on
\`\`\`

### Counterfactual Explanations

\`\`\`typescript
// "What changes would flip the prediction?"
const counterfactual = await xai.generateCounterfactual({
  model: accessControlModel,
  instance: deniedRequest,
  desired_outcome: 'approved',
  max_changes: 3
});

console.log('Minimum changes needed:', counterfactual.changes);
// [
//   { feature: 'trust_score', original: 45, counterfactual: 75 },
//   { feature: 'device_known', original: false, counterfactual: true }
// ]

console.log('Explanation:', counterfactual.explanation);
// "If trust_score was 75 and device_known was true, request would be approved"
\`\`\`

### Bias Detection

\`\`\`typescript
// Detect bias in model predictions
const biasReport = await xai.detectBias({
  model: accessControlModel,
  test_data: employeeAccessRequests,
  protected_attribute: 'department',
  favorable_outcome: 'approved'
});

console.log('Demographic Parity:', biasReport.demographic_parity);
// {
//   engineering: 0.85,  // 85% approval rate
//   sales: 0.82,        // 82% approval rate
//   hr: 0.78,           // 78% approval rate
//   difference: 0.07    // Max difference
// }

console.log('Equalized Odds:', biasReport.equalized_odds);
// Checks if true positive rate and false positive rate are similar across groups

console.log('Fairness Assessment:', biasReport.is_fair);
// true/false based on threshold
\`\`\`

## Key Features

### 1. SHAP (SHapley Additive exPlanations)
- **Game-theoretic foundation**: Based on Shapley values from cooperative game theory
- **Additive**: Feature contributions sum to prediction
- **Consistent**: If feature contribution increases, SHAP value doesn't decrease
- **Local & Global**: Explains individual predictions and overall model

### 2. LIME (Local Interpretable Model-agnostic Explanations)
- **Model-agnostic**: Works with any black-box model
- **Local fidelity**: Accurate explanations in neighborhood of instance
- **Interpretable**: Uses simple linear models for explanations
- **Fast**: O(n) complexity, suitable for real-time

### 3. Attention Mechanisms
- **Neural network transparency**: Visualize what model focuses on
- **Multi-head analysis**: Understand different attention patterns
- **Sequence models**: Essential for RNN, LSTM, Transformer explanations

### 4. Counterfactual Explanations
- **Actionable insights**: Shows how to change outcome
- **Minimal changes**: Finds smallest changes needed
- **Feasible**: Only suggests realistic changes
- **Causal reasoning**: Helps understand model's decision boundary

### 5. Fairness Metrics

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| Demographic Parity | P(Ŷ=1\|A=0) = P(Ŷ=1\|A=1) | Equal positive rate across groups |
| Equalized Odds | TPR and FPR equal across groups | Equal error rates |
| Equal Opportunity | P(Ŷ=1\|Y=1,A=0) = P(Ŷ=1\|Y=1,A=1) | Equal true positive rate |
| Calibration | P(Y=1\|Ŷ=p,A=0) = P(Y=1\|Ŷ=p,A=1) | Predictions equally reliable |

## Performance Metrics

### Test Coverage
- **Total Tests**: 35+ (100%)
- **SHAP Tests**: ✅ Feature importance, additivity
- **LIME Tests**: ✅ Local fidelity, consistency
- **Attention Tests**: ✅ Weight extraction, visualization
- **Counterfactual Tests**: ✅ Minimal changes, feasibility
- **Bias Tests**: ✅ All fairness metrics

### Benchmark Results
- **SHAP Computation**: 10-100ms per prediction
- **LIME Computation**: 50-200ms per prediction
- **Attention Extraction**: <10ms
- **Counterfactual Generation**: 100-500ms
- **Bias Analysis**: 1-5s for 10,000 samples

## Use Cases

### 1. Regulatory Compliance
\`\`\`typescript
// Explain loan denial (required by GDPR, FCRA)
const explanation = await xai.explainDecision({
  model: loanApprovalModel,
  applicant: deniedApplicant,
  regulation: 'GDPR'
});
// Returns human-readable explanation for applicant
\`\`\`

### 2. Security Analyst Training
\`\`\`typescript
// Help analysts understand threat detection
const trainingExplanation = await xai.explainThreatDetection({
  alert: suspiciousActivity,
  include_counterfactuals: true
});
// Shows why it's malicious and what would make it benign
\`\`\`

### 3. Model Debugging
\`\`\`typescript
// Find why model makes errors
const debugInfo = await xai.debugPrediction({
  model: securityModel,
  correct_label: 'benign',
  predicted_label: 'malicious',
  instance: falsePositive
});
// Identifies features causing misclassification
\`\`\`

### 4. Bias Mitigation
\`\`\`typescript
// Detect and mitigate bias
const fairnessReport = await xai.auditModelFairness({
  model: hiringModel,
  protected_attributes: ['gender', 'race'],
  mitigation: 'reweighting'
});
// Suggests model adjustments to improve fairness
\`\`\`

## Event System

\`\`\`typescript
xai.on('explanation:generated', (explanation) => {
  console.log('New explanation:', explanation.id);
});

xai.on('bias:detected', (biasReport) => {
  console.warn('Bias detected:', biasReport.protected_attribute);
  console.warn('Demographic parity difference:', biasReport.dp_difference);
});

xai.on('counterfactual:found', (cf) => {
  console.log('Counterfactual changes:', cf.changes.length);
});
\`\`\`

## Configuration

\`\`\`typescript
interface XAIConfig {
  methods: Array<'shap' | 'lime' | 'attention' | 'counterfactuals'>;

  shap: {
    algorithm: 'kernel' | 'tree' | 'deep' | 'auto';
    num_samples: number;
    link_function: 'identity' | 'logit';
  };

  lime: {
    num_samples: number;
    num_features: number;
    kernel_width: number;
  };

  counterfactuals: {
    max_iterations: number;
    max_changes: number;
    optimization_method: 'genetic' | 'gradient' | 'nearest_neighbor';
  };

  bias_detection: {
    enabled: boolean;
    protected_attributes: string[];
    fairness_metrics: Array<'demographic_parity' | 'equalized_odds' | 'equal_opportunity'>;
    threshold: number; // Max acceptable disparity
  };
}
\`\`\`

## Best Practices

### 1. Explanation Method Selection
- **Tree models**: Use TreeSHAP (exact, fast)
- **Neural networks**: Use DeepSHAP or attention
- **Black-box models**: Use LIME or KernelSHAP
- **Real-time**: Use attention or cached SHAP

### 2. Bias Auditing
- Test on representative data
- Check multiple fairness metrics
- Consider intersectional bias
- Regularly re-audit as model updates

### 3. Counterfactual Quality
- Ensure changes are feasible
- Minimize number of changes
- Consider domain constraints
- Validate with domain experts

## Roadmap

### Current (Q1 2025) ✅
- [x] SHAP, LIME, Attention
- [x] Counterfactual generation
- [x] Bias detection
- [x] 35+ tests (100%)

### Q2 2025
- [ ] Interactive explanations UI
- [ ] Natural language explanations
- [ ] Causal inference methods
- [ ] Anchors (rule-based explanations)

### Q3 2025
- [ ] Contrastive explanations
- [ ] Example-based explanations
- [ ] Influence functions
- [ ] Adversarial robustness analysis

## Support

- **Email**: xai@starguard.io
- **Documentation**: https://docs.starguard.io/xai

---

[← Back to Advanced Features](./ADVANCED_FEATURES.md)

/**
 * Distributed Tracing Utilities
 * Custom span creation and trace context management
 */

import { trace, context, Span, SpanStatusCode, SpanKind, Tracer } from '@opentelemetry/api';
import { Logger } from '../utils/logger.js';

const logger = new Logger('tracing');

/**
 * Get the default tracer for Starguard
 */
export function getTracer(name: string = 'starguard2'): Tracer {
  return trace.getTracer(name, '1.0.0');
}

/**
 * Span attributes for different operations
 */
export interface SpanAttributes {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Create and execute a traced function
 */
export async function traced<T>(
  spanName: string,
  operation: (span: Span) => Promise<T>,
  attributes: SpanAttributes = {},
  spanKind: SpanKind = SpanKind.INTERNAL
): Promise<T> {
  const tracer = getTracer();

  return tracer.startActiveSpan(spanName, { kind: spanKind, attributes }, async (span) => {
    try {
      const result = await operation(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Biometric Authentication Tracing
 */
export class BiometricTracer {
  private tracer: Tracer;

  constructor() {
    this.tracer = getTracer('biometric-auth');
  }

  async traceAuthentication(
    userId: string,
    biometricType: string,
    operation: (span: Span) => Promise<any>
  ): Promise<any> {
    return this.tracer.startActiveSpan(
      'biometric.authenticate',
      {
        kind: SpanKind.INTERNAL,
        attributes: {
          'user.id': userId,
          'biometric.type': biometricType,
          'auth.method': 'behavioral',
        },
      },
      async (span) => {
        const startTime = Date.now();
        try {
          const result = await operation(span);

          span.setAttributes({
            'auth.success': result.success,
            'auth.confidence': result.confidence || 0,
            'auth.duration_ms': Date.now() - startTime,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : String(error),
          });
          span.recordException(error instanceof Error ? error : new Error(String(error)));
          throw error;
        } finally {
          span.end();
        }
      }
    );
  }

  async traceKeystrokeAnalysis(
    userId: string,
    keystrokeCount: number,
    operation: (span: Span) => Promise<any>
  ): Promise<any> {
    return this.tracer.startActiveSpan(
      'biometric.keystroke.analyze',
      {
        kind: SpanKind.INTERNAL,
        attributes: {
          'user.id': userId,
          'keystroke.count': keystrokeCount,
        },
      },
      operation
    );
  }

  async traceMouseAnalysis(
    userId: string,
    movementCount: number,
    operation: (span: Span) => Promise<any>
  ): Promise<any> {
    return this.tracer.startActiveSpan(
      'biometric.mouse.analyze',
      {
        kind: SpanKind.INTERNAL,
        attributes: {
          'user.id': userId,
          'mouse.movements': movementCount,
        },
      },
      operation
    );
  }
}

/**
 * Threat Detection Tracing
 */
export class ThreatTracer {
  private tracer: Tracer;

  constructor() {
    this.tracer = getTracer('threat-detection');
  }

  async traceThreatScan(
    scanType: string,
    targetCount: number,
    operation: (span: Span) => Promise<any>
  ): Promise<any> {
    return this.tracer.startActiveSpan(
      'threat.scan',
      {
        kind: SpanKind.INTERNAL,
        attributes: {
          'scan.type': scanType,
          'scan.target_count': targetCount,
        },
      },
      async (span) => {
        const startTime = Date.now();
        try {
          const result = await operation(span);

          span.setAttributes({
            'scan.threats_detected': result.threatsDetected || 0,
            'scan.duration_ms': Date.now() - startTime,
            'scan.severity': result.maxSeverity || 'none',
          });

          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : String(error),
          });
          span.recordException(error instanceof Error ? error : new Error(String(error)));
          throw error;
        } finally {
          span.end();
        }
      }
    );
  }

  async traceAnomalyDetection(operation: (span: Span) => Promise<any>): Promise<any> {
    return this.tracer.startActiveSpan('threat.anomaly_detection', operation);
  }

  async traceDGADetection(
    domain: string,
    operation: (span: Span) => Promise<any>
  ): Promise<any> {
    return this.tracer.startActiveSpan(
      'threat.dga_detection',
      {
        attributes: {
          'dga.domain': domain,
        },
      },
      operation
    );
  }
}

/**
 * Agent Mesh Tracing
 */
export class AgentMeshTracer {
  private tracer: Tracer;

  constructor() {
    this.tracer = getTracer('agent-mesh');
  }

  async traceConsensus(
    agentCount: number,
    operation: (span: Span) => Promise<any>
  ): Promise<any> {
    return this.tracer.startActiveSpan(
      'swarm.consensus',
      {
        kind: SpanKind.INTERNAL,
        attributes: {
          'swarm.agent_count': agentCount,
          'swarm.topology': 'mesh',
        },
      },
      async (span) => {
        const startTime = Date.now();
        try {
          const result = await operation(span);

          span.setAttributes({
            'consensus.achieved': result.consensusAchieved || false,
            'consensus.rounds': result.rounds || 0,
            'consensus.duration_ms': Date.now() - startTime,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : String(error),
          });
          span.recordException(error instanceof Error ? error : new Error(String(error)));
          throw error;
        } finally {
          span.end();
        }
      }
    );
  }

  async traceAgentCommunication(
    fromAgent: string,
    toAgent: string,
    operation: (span: Span) => Promise<any>
  ): Promise<any> {
    return this.tracer.startActiveSpan(
      'swarm.agent.communicate',
      {
        attributes: {
          'agent.from': fromAgent,
          'agent.to': toAgent,
        },
      },
      operation
    );
  }

  async traceCoherenceMeasurement(operation: (span: Span) => Promise<any>): Promise<any> {
    return this.tracer.startActiveSpan('swarm.coherence.measure', operation);
  }
}

/**
 * Defense DNA Evolution Tracing
 */
export class DefenseEvolutionTracer {
  private tracer: Tracer;

  constructor() {
    this.tracer = getTracer('defense-evolution');
  }

  async traceEvolution(
    generation: number,
    populationSize: number,
    operation: (span: Span) => Promise<any>
  ): Promise<any> {
    return this.tracer.startActiveSpan(
      'defense.evolve',
      {
        kind: SpanKind.INTERNAL,
        attributes: {
          'evolution.generation': generation,
          'evolution.population_size': populationSize,
        },
      },
      async (span) => {
        const startTime = Date.now();
        try {
          const result = await operation(span);

          span.setAttributes({
            'evolution.best_fitness': result.bestFitness || 0,
            'evolution.mutations': result.mutationCount || 0,
            'evolution.duration_ms': Date.now() - startTime,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : String(error),
          });
          span.recordException(error instanceof Error ? error : new Error(String(error)));
          throw error;
        } finally {
          span.end();
        }
      }
    );
  }

  async traceMutation(operation: (span: Span) => Promise<any>): Promise<any> {
    return this.tracer.startActiveSpan('defense.mutate', operation);
  }

  async traceFitnessEvaluation(operation: (span: Span) => Promise<any>): Promise<any> {
    return this.tracer.startActiveSpan('defense.fitness.evaluate', operation);
  }
}

/**
 * ML Model Inference Tracing
 */
export class MLTracer {
  private tracer: Tracer;

  constructor() {
    this.tracer = getTracer('ml-inference');
  }

  async traceInference(
    modelName: string,
    inputSize: number,
    operation: (span: Span) => Promise<any>
  ): Promise<any> {
    return this.tracer.startActiveSpan(
      'ml.inference',
      {
        kind: SpanKind.INTERNAL,
        attributes: {
          'ml.model': modelName,
          'ml.input_size': inputSize,
        },
      },
      async (span) => {
        const startTime = Date.now();
        try {
          const result = await operation(span);

          span.setAttributes({
            'ml.inference_time_ms': Date.now() - startTime,
            'ml.confidence': result.confidence || 0,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : String(error),
          });
          span.recordException(error instanceof Error ? error : new Error(String(error)));
          throw error;
        } finally {
          span.end();
        }
      }
    );
  }
}

// Export tracer instances
export const biometricTracer = new BiometricTracer();
export const threatTracer = new ThreatTracer();
export const agentMeshTracer = new AgentMeshTracer();
export const defenseEvolutionTracer = new DefenseEvolutionTracer();
export const mlTracer = new MLTracer();

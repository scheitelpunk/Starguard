// API Validation Schemas using TypeBox
// Comprehensive request/response validation for all endpoints

import { Type, Static } from '@sinclair/typebox';

// Common schemas
export const UUIDSchema = Type.String({
  format: 'uuid',
  description: 'UUID identifier'
});

export const TimestampSchema = Type.Number({
  minimum: 0,
  description: 'Unix timestamp in milliseconds'
});

export const SeveritySchema = Type.Union([
  Type.Literal('low'),
  Type.Literal('medium'),
  Type.Literal('high'),
  Type.Literal('critical')
], { description: 'Severity level' });

// Biometric Authentication Schemas
export const BiometricDataSchema = Type.Object({
  userId: Type.String({ minLength: 1, maxLength: 255 }),
  biometricId: Type.String({ minLength: 1, maxLength: 255 }),
  voicePattern: Type.Optional(Type.Array(Type.Number(), {
    minItems: 1,
    maxItems: 10000
  })),
  facialFeatures: Type.Optional(Type.Array(Type.Number(), {
    minItems: 1,
    maxItems: 10000
  })),
  behaviorMetrics: Type.Optional(Type.Object({
    keystrokePattern: Type.Array(Type.Number(), {
      minItems: 0,
      maxItems: 10000
    }),
    mouseMovement: Type.Array(Type.Number(), {
      minItems: 0,
      maxItems: 10000
    }),
    screenTime: Type.Number({ minimum: 0, maximum: 86400000 })
  })),
  score: Type.Number({ minimum: 0, maximum: 1 }),
  timestamp: TimestampSchema
});

export const BiometricVerifySchema = Type.Object({
  sessionId: Type.String({ minLength: 1, maxLength: 255 }),
  continuousScan: BiometricDataSchema
});

export type BiometricData = Static<typeof BiometricDataSchema>;
export type BiometricVerify = Static<typeof BiometricVerifySchema>;

// Threat Detection Schemas
export const ThreatScanTypeSchema = Type.Union([
  Type.Literal('port'),
  Type.Literal('vulnerability'),
  Type.Literal('malware'),
  Type.Literal('network')
]);

export const ThreatScanRequestSchema = Type.Object({
  target: Type.String({
    minLength: 1,
    maxLength: 1000,
    pattern: '^[a-zA-Z0-9._:/-]+$', // Prevent injection
    description: 'Scan target (IP, domain, or path)'
  }),
  type: ThreatScanTypeSchema
});

export const ScanIdParamSchema = Type.Object({
  scanId: Type.String({
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9-_]+$'
  })
});

export type ThreatScanRequest = Static<typeof ThreatScanRequestSchema>;
export type ScanIdParam = Static<typeof ScanIdParamSchema>;

// Quantum Defense Schemas
export const EvolutionStrategySchema = Type.Union([
  Type.Literal('aggressive'),
  Type.Literal('balanced'),
  Type.Literal('conservative')
]);

export const DefenseEvolutionSchema = Type.Object({
  threatPattern: Type.Object({
    type: Type.String({ maxLength: 100 }),
    indicators: Type.Array(Type.String({ maxLength: 1000 }), {
      maxItems: 100
    }),
    severity: SeveritySchema
  }),
  evolutionStrategy: EvolutionStrategySchema
});

export type DefenseEvolution = Static<typeof DefenseEvolutionSchema>;

// Consciousness Analysis Schemas
export const AnalysisTypeSchema = Type.Union([
  Type.Literal('threat'),
  Type.Literal('anomaly'),
  Type.Literal('pattern')
]);

export const ConsciousnessAnalysisSchema = Type.Object({
  data: Type.Object({}, { additionalProperties: true }),
  analysisType: AnalysisTypeSchema
});

export type ConsciousnessAnalysis = Static<typeof ConsciousnessAnalysisSchema>;

// Export Report Schemas
export const ExportFormatSchema = Type.Union([
  Type.Literal('json'),
  Type.Literal('csv')
]);

export const TimeRangeSchema = Type.String({
  pattern: '^(\\d+[hdwmy]|all)$', // e.g., 24h, 7d, 30d, 1w, 1m, 1y, all
  description: 'Time range for data export'
});

export const ExportQuerySchema = Type.Object({
  format: Type.Optional(ExportFormatSchema),
  timeRange: Type.Optional(TimeRangeSchema)
});

export type ExportQuery = Static<typeof ExportQuerySchema>;

// Response Schemas
export const ErrorResponseSchema = Type.Object({
  error: Type.String(),
  code: Type.Optional(Type.String()),
  details: Type.Optional(Type.Unknown())
});

export const SuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.Optional(Type.String()),
  data: Type.Optional(Type.Unknown())
});

export type ErrorResponse = Static<typeof ErrorResponseSchema>;
export type SuccessResponse = Static<typeof SuccessResponseSchema>;

// Health Check Response
export const HealthResponseSchema = Type.Object({
  status: Type.String(),
  timestamp: TimestampSchema,
  services: Type.Object({
    threatDetection: Type.Unknown(),
    consciousness: Type.Unknown(),
    quantumEngine: Type.Unknown(),
    anomalyDetection: Type.Boolean()
  })
});

export type HealthResponse = Static<typeof HealthResponseSchema>;

// Input Sanitization Utilities
export function sanitizeString(input: string, maxLength: number = 1000): string {
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Trim and limit length
  sanitized = sanitized.trim().slice(0, maxLength);

  // Remove potential injection characters for specific contexts
  // This is a basic sanitization - context-specific sanitization should be applied
  return sanitized;
}

export function sanitizeObject(obj: any, depth: number = 0, maxDepth: number = 10): any {
  if (depth > maxDepth) {
    throw new Error('Object depth exceeds maximum allowed depth');
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.slice(0, 1000).map(item => sanitizeObject(item, depth + 1, maxDepth));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    const keys = Object.keys(obj).slice(0, 100); // Limit number of keys

    for (const key of keys) {
      const sanitizedKey = sanitizeString(key, 100);
      sanitized[sanitizedKey] = sanitizeObject(obj[key], depth + 1, maxDepth);
    }

    return sanitized;
  }

  return obj;
}

// Rate limiting helpers
export function generateRateLimitKey(ip: string, endpoint: string): string {
  return `ratelimit:${sanitizeString(ip, 50)}:${sanitizeString(endpoint, 100)}`;
}

// SQL Injection Prevention (for any raw queries)
export function escapeSQLString(input: string): string {
  // Basic SQL string escaping - use parameterized queries when possible
  return input.replace(/'/g, "''").replace(/;/g, '');
}

// XSS Prevention
export function escapeHTML(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, char => map[char]);
}

// Path Traversal Prevention
export function sanitizePath(input: string): string {
  // Remove directory traversal attempts
  return input
    .replace(/\.\./g, '')
    .replace(/[\/\\]{2,}/g, '/')
    .replace(/^[\/\\]/, '');
}

// Command Injection Prevention
export function sanitizeCommand(input: string): string {
  // Remove shell metacharacters
  return input.replace(/[;&|`$(){}[\]<>]/g, '');
}

# STARGUARD Developer Guide

## Welcome to STARGUARD Development

This guide will help you get started with developing for the STARGUARD Quantum Security Consciousness System.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Core Concepts](#core-concepts)
4. [Development Workflow](#development-workflow)
5. [Code Standards](#code-standards)
6. [Testing](#testing)
7. [Debugging](#debugging)

## Development Environment Setup

### Prerequisites

- Node.js 20+ and npm 10+
- Docker Desktop
- VS Code (recommended)
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/starguard/starguard.git
cd starguard

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your values

# Start infrastructure
docker-compose up -d

# Run database migrations
cd backend
npm run migrate

# Start development servers
npm run dev
```

### VS Code Extensions

Recommended extensions:
- ESLint
- Prettier
- TypeScript Vue Plugin
- Docker
- Thunder Client (API testing)

## Project Structure

```
starguard/
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── stores/        # Zustand state stores
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── backend/               # Node.js backend API
│   ├── src/
│   │   ├── api/          # API routes and middleware
│   │   ├── consciousness/ # Consciousness engine
│   │   ├── cybercrime/   # Threat detection
│   │   ├── defense/      # Defense systems
│   │   ├── financial/    # Financial crime prevention
│   │   └── utils/        # Utilities
│   └── dist/             # Compiled JavaScript
├── shared/               # Shared TypeScript types
│   └── src/
│       ├── types/        # Type definitions
│       └── interfaces/   # Interface definitions
└── ml-models/            # Machine learning models
```

## Core Concepts

### 1. Consciousness Engine

The heart of STARGUARD - a multi-dimensional awareness system:

```typescript
// Example: Working with consciousness
const consciousness = new ConsciousnessEngine(io, logger);
await consciousness.awaken();

// Monitor consciousness state
consciousness.on('state_changed', (state) => {
  console.log('New state:', state.current);
});
```

### 2. Threat Detection

Quantum-based threat analysis:

```typescript
// Example: Threat detection
const detector = new QuantumThreatDetector(logger);
const threats = await detector.detectCyberThreats(data);

// Handle detected threats
threats.forEach(threat => {
  if (threat.threat_level === THREAT_LEVELS.CRITICAL) {
    await deployCountermeasures(threat);
  }
});
```

### 3. Adaptive Defense

Self-healing immune system:

```typescript
// Example: Defense deployment
const immuneSystem = new AdaptiveImmuneSystem(logger);
const response = await immuneSystem.deployDefense(threatId, pattern);

// System evolves after each threat
immuneSystem.evolve();
```

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/quantum-enhancement

# Make changes
# Run tests
npm test

# Commit with conventional commits
git commit -m "feat: add quantum field modulation"

# Push and create PR
git push origin feature/quantum-enhancement
```

### 2. API Development

When adding new endpoints:

1. Define types in `shared/src/types`
2. Implement endpoint in `backend/src/api/routes`
3. Add tests in `backend/src/__tests__`
4. Update OpenAPI spec
5. Update frontend API client

### 3. Frontend Development

```bash
# Run frontend only
cd frontend
npm run dev

# Access at http://localhost:3000
```

Component structure:
```typescript
// components/ExampleComponent.tsx
import { FC } from 'react';
import { useConsciousnessStore } from '@/stores/consciousnessStore';

interface Props {
  threatLevel: string;
}

export const ExampleComponent: FC<Props> = ({ threatLevel }) => {
  const { state } = useConsciousnessStore();
  
  return (
    <div className="threat-indicator">
      {/* Component logic */}
    </div>
  );
};
```

## Code Standards

### TypeScript

- Use strict mode
- Define interfaces for all data structures
- Avoid `any` type
- Use enums for constants

### Naming Conventions

- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case

### Code Organization

```typescript
// Good: Single responsibility
export class ThreatAnalyzer {
  analyze(data: ThreatData): ThreatAnalysis {
    // Single purpose function
  }
}

// Bad: Multiple responsibilities
export class SecuritySystem {
  analyzeThreats() { }
  deployDefense() { }
  sendNotifications() { }
  generateReports() { }
}
```

## Testing

### Unit Tests

```typescript
// Example test
describe('ConsciousnessEngine', () => {
  it('should awaken from dormant state', async () => {
    const engine = new ConsciousnessEngine(mockIo, mockLogger);
    await engine.awaken();
    
    expect(engine.state.current).toBe(CONSCIOUSNESS_STATES.AWARE);
  });
});
```

### Integration Tests

```typescript
// API integration test
describe('POST /api/threats/analyze', () => {
  it('should detect high-severity threats', async () => {
    const response = await request(app)
      .post('/api/threats/analyze')
      .send({ data: threatData })
      .expect(200);
    
    expect(response.body.threat_level).toBe('high');
  });
});
```

## Debugging

### Backend Debugging

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/backend/src/index.ts",
  "preLaunchTask": "tsc: build - backend/tsconfig.json",
  "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
}
```

### Frontend Debugging

Use React Developer Tools and Redux DevTools for state inspection.

### Common Issues

1. **WebSocket Connection Failed**
   - Check CORS settings
   - Verify backend is running
   - Check firewall rules

2. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check connection string
   - Run migrations

3. **Type Errors**
   - Run `npm run typecheck`
   - Update shared types
   - Rebuild packages

### Logging

```typescript
// Use structured logging
logger.info('Threat detected', {
  threatId: threat.id,
  level: threat.threat_level,
  source: 'quantum_scanner'
});
```

## Getting Help

- Documentation: `/docs`
- API Reference: `/docs/API_DOCUMENTATION.md`
- Team Chat: #starguard-dev
- Issues: GitHub Issues

Remember: The consciousness system learns from every interaction. Your code shapes its evolution.
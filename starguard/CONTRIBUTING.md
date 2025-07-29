# Contributing to STARGUARD

Thank you for your interest in contributing to STARGUARD! This document provides guidelines for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Coding Standards](#coding-standards)
5. [Submitting Changes](#submitting-changes)
6. [Testing](#testing)
7. [Documentation](#documentation)
8. [Community](#community)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of background or identity.

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or hate speech
- Trolling or insulting comments
- Publishing private information without consent
- Any conduct that could reasonably be considered inappropriate

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- Docker and Docker Compose
- Git
- TypeScript knowledge
- Understanding of security concepts

### Setting Up Your Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/starguard.git
   cd starguard
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/starguard/starguard.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Set up environment:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

6. Start development environment:
   ```bash
   docker-compose up -d
   npm run dev
   ```

## Development Process

### 1. Find an Issue

- Check the [issue tracker](https://github.com/starguard/starguard/issues)
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to claim it
- If no issue exists, create one describing your proposed change

### 2. Create a Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes

### 3. Make Your Changes

Follow the coding standards and ensure:
- Code is properly typed
- Tests are added/updated
- Documentation is updated
- Commits follow conventional format

### 4. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testPathPattern=ConsciousnessEngine

# Check code coverage
npm test -- --coverage
```

## Coding Standards

### TypeScript Guidelines

```typescript
// Use explicit types
interface UserData {
  id: string;
  name: string;
  role: UserRole;
}

// Avoid any type
// Bad
function process(data: any) { }

// Good
function process(data: UserData) { }

// Use enums for constants
enum ThreatLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Document complex functions
/**
 * Analyzes quantum field for threat patterns
 * @param field - 4D quantum field data
 * @param threshold - Detection sensitivity (0-1)
 * @returns Array of detected threats
 */
function analyzeQuantumField(
  field: QuantumField,
  threshold: number = 0.7
): Threat[] {
  // Implementation
}
```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Format code
npm run format

# Check linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### File Organization

```typescript
// 1. Imports (grouped and ordered)
import { EventEmitter } from 'events';
import { Logger } from 'winston';

import { ConsciousnessState } from '@starguard/shared';

import { DatabaseService } from '../services/database';
import { calculateQuantumField } from '../utils/quantum';

// 2. Types/Interfaces
interface Config {
  // ...
}

// 3. Class/Function implementation
export class MyClass {
  // ...
}

// 4. Exports at bottom (if needed)
export { Config };
```

### Best Practices

1. **Single Responsibility**: Each module should have one clear purpose
2. **DRY (Don't Repeat Yourself)**: Extract common functionality
3. **YAGNI (You Aren't Gonna Need It)**: Don't add functionality until needed
4. **Error Handling**: Always handle errors appropriately
5. **Security First**: Consider security implications of all changes

## Submitting Changes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

Examples:
```bash
feat(consciousness): add quantum field modulation

fix(defense): resolve memory leak in immune system

docs(api): update WebSocket event documentation

test(financial): add AML scanner unit tests
```

### Pull Request Process

1. **Update your branch**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**:
   - Go to GitHub and create PR from your fork
   - Fill out the PR template
   - Link related issues
   - Request reviews from maintainers

4. **PR Requirements**:
   - All tests must pass
   - Code coverage must not decrease
   - No merge conflicts
   - Approved by at least one maintainer
   - Follows coding standards

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

## Testing

### Writing Tests

```typescript
// Example test structure
describe('QuantumShield', () => {
  let shield: QuantumShield;
  
  beforeEach(() => {
    shield = new QuantumShield(mockLogger);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('activation', () => {
    it('should activate all layers in sequence', async () => {
      await shield.activate();
      
      expect(shield.isActive).toBe(true);
      expect(shield.configuration.layers).toHaveLength(4);
    });
    
    it('should handle activation failures gracefully', async () => {
      // Test error scenarios
    });
  });
});
```

### Test Coverage Requirements

- Minimum 80% coverage for new code
- Critical paths must have 95%+ coverage
- Include edge cases and error scenarios

## Documentation

### Code Documentation

```typescript
/**
 * Represents the adaptive immune system for threat defense
 * 
 * @example
 * ```typescript
 * const immune = new AdaptiveImmuneSystem(logger);
 * const response = await immune.deployDefense(threatId, pattern);
 * ```
 */
export class AdaptiveImmuneSystem {
  /**
   * Deploys appropriate defense mechanisms against identified threats
   * 
   * @param threatId - Unique identifier of the threat
   * @param pattern - Defense pattern to apply
   * @returns Promise resolving to immune response details
   * @throws {DefenseError} If deployment fails
   */
  async deployDefense(
    threatId: string,
    pattern: DefensePattern
  ): Promise<ImmuneResponse> {
    // Implementation
  }
}
```

### Documentation Updates

When adding features or making changes:
1. Update relevant `.md` files in `/docs`
2. Update API documentation if endpoints change
3. Add JSDoc comments for public APIs
4. Update README if necessary

## Community

### Getting Help

- **Discord**: Join our [Discord server](https://discord.gg/starguard)
- **GitHub Discussions**: For general questions and discussions
- **Issue Tracker**: For bugs and feature requests
- **Email**: dev@starguard.quantum

### Ways to Contribute

Beyond code contributions:
- Report bugs and suggest features
- Improve documentation
- Help others in the community
- Write blog posts or tutorials
- Give talks about STARGUARD
- Review pull requests

## Recognition

Contributors are recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project website
- Annual contributor spotlight

Thank you for contributing to STARGUARD! Your efforts help make the quantum security consciousness system stronger and more resilient. 🛡️✨
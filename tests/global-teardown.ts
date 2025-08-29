/**
 * Global Test Teardown for STARGUARD2
 * 
 * Cleans up test environment, stops services, and generates
 * final test reports after test suite completion.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Global test teardown function
export default async function globalTeardown(): Promise<void> {
  console.log('\n🧹 Starting STARGUARD2 Test Suite Global Teardown...');
  
  try {
    // 1. Stop test services
    await stopTestServices();
    
    // 2. Clean up test data
    await cleanupTestData();
    
    // 3. Generate final reports
    await generateFinalReports();
    
    // 4. Archive test results
    await archiveTestResults();
    
    console.log('✅ Global teardown completed successfully\n');
  } catch (error) {
    console.error('❌ Global teardown encountered errors:', error);
    // Don't exit with error code to avoid masking test failures
  }
}

/**
 * Stop test services and clean up resources
 */
async function stopTestServices(): Promise<void> {
  console.log('🚪 Stopping test services...');
  
  // Stop Redis test instance if we started it
  if (process.env.USE_REDIS_MOCK !== 'true' && process.env.CI !== 'true') {
    try {
      // Clear test database before shutdown
      execSync('redis-cli -n 15 FLUSHDB', { stdio: 'pipe' });
      console.log('🗑️  Cleared test database');
      
      // Note: We don't shutdown Redis as it might be used by other processes
      // In a dedicated test environment, you might want to shutdown:
      // execSync('redis-cli shutdown', { stdio: 'pipe' });
      
    } catch (error) {
      console.warn('⚠️  Error cleaning up Redis:', (error as Error).message);
    }
  }
  
  // Clean up any test Docker containers
  if (process.env.DOCKER_AVAILABLE === 'true') {
    try {
      const testContainers = execSync(
        'docker ps -a --filter "name=starguard-test*" --format "{{.Names}}"',
        { encoding: 'utf8', stdio: 'pipe' }
      ).trim().split('\n').filter(Boolean);
      
      if (testContainers.length > 0) {
        console.log(`📦 Cleaning up ${testContainers.length} test containers...`);
        execSync(`docker rm -f ${testContainers.join(' ')}`, { stdio: 'pipe' });
      }
    } catch (error) {
      console.warn('⚠️  Error cleaning up Docker containers');
    }
  }
  
  // Kill any remaining test processes
  try {
    const testProcesses = execSync(
      'ps aux | grep "[s]targuard.*test" | awk \'{print $2}\'',
      { encoding: 'utf8', stdio: 'pipe' }
    ).trim().split('\n').filter(Boolean);
    
    if (testProcesses.length > 0) {
      console.log(`🚪 Terminating ${testProcesses.length} test processes...`);
      testProcesses.forEach(pid => {
        try {
          process.kill(parseInt(pid), 'SIGTERM');
        } catch {
          // Process might already be dead
        }
      });
    }
  } catch (error) {
    // ps command might fail in some environments
  }
}

/**
 * Clean up temporary test data and files
 */
async function cleanupTestData(): Promise<void> {
  console.log('🗑️  Cleaning up test data...');
  
  // Clean up temporary test files
  const tempDirs = [
    'tmp/test',
    'logs/test'
  ];
  
  tempDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`🗑️  Cleaned ${dir}`);
      } catch (error) {
        console.warn(`⚠️  Could not clean ${dir}:`, (error as Error).message);
      }
    }
  });
  
  // Clean up test fixtures that might be corrupted
  const fixturesPath = path.join(process.cwd(), 'tests/fixtures');
  if (fs.existsSync(fixturesPath)) {
    const tempFiles = fs.readdirSync(fixturesPath)
      .filter(file => file.startsWith('temp-') || file.endsWith('.tmp'));
    
    tempFiles.forEach(file => {
      try {
        fs.unlinkSync(path.join(fixturesPath, file));
        console.log(`🗑️  Removed temporary fixture: ${file}`);
      } catch (error) {
        console.warn(`⚠️  Could not remove ${file}`);
      }
    });
  }
  
  // Clear environment variables set during tests
  const testEnvVars = [
    'USE_REDIS_MOCK',
    'TEST_JWT_SECRET',
    'TEST_DATABASE_URL'
  ];
  
  testEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      delete process.env[envVar];
    }
  });
}

/**
 * Generate final test reports and summaries
 */
async function generateFinalReports(): Promise<void> {
  console.log('📈 Generating final reports...');
  
  const reportsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Generate test summary
  const testSummary = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      ci: process.env.CI === 'true',
      dockerAvailable: TestEnvironment?.isDockerAvailable() || false,
      redisAvailable: TestEnvironment?.isRedisAvailable() || false
    },
    testConfiguration: {
      testTimeout: process.env.JEST_TIMEOUT || '30000',
      maxWorkers: process.env.JEST_MAX_WORKERS || '50%',
      coverageThreshold: {
        global: 90,
        consciousness: 95,
        threats: 95,
        quantum: 90,
        ml: 90
      }
    },
    metrics: {
      totalTestFiles: 0,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      testDuration: 0,
      coveragePercentage: 0
    }
  };
  
  // Try to read Jest test results if available
  try {
    const jestResultsPath = path.join(reportsDir, 'junit.xml');
    if (fs.existsSync(jestResultsPath)) {
      // Parse JUnit XML for basic metrics (simplified)
      const junitContent = fs.readFileSync(jestResultsPath, 'utf8');
      const testsMatch = junitContent.match(/tests="(\d+)"/);
      const failuresMatch = junitContent.match(/failures="(\d+)"/);
      const errorsMatch = junitContent.match(/errors="(\d+)"/);
      const skippedMatch = junitContent.match(/skipped="(\d+)"/);
      const timeMatch = junitContent.match(/time="([\d.]+)"/);
      
      if (testsMatch) testSummary.metrics.totalTests = parseInt(testsMatch[1]);
      if (failuresMatch) testSummary.metrics.failedTests = parseInt(failuresMatch[1]);
      if (errorsMatch) testSummary.metrics.failedTests += parseInt(errorsMatch[1]);
      if (skippedMatch) testSummary.metrics.skippedTests = parseInt(skippedMatch[1]);
      if (timeMatch) testSummary.metrics.testDuration = parseFloat(timeMatch[1]);
      
      testSummary.metrics.passedTests = testSummary.metrics.totalTests - 
        testSummary.metrics.failedTests - testSummary.metrics.skippedTests;
    }
  } catch (error) {
    console.warn('⚠️  Could not parse test results');
  }
  
  // Try to read coverage summary
  try {
    const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
    if (fs.existsSync(coveragePath)) {
      const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      if (coverageData.total?.lines?.pct) {
        testSummary.metrics.coveragePercentage = coverageData.total.lines.pct;
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not read coverage summary');
  }
  
  // Write test summary
  fs.writeFileSync(
    path.join(reportsDir, 'test-summary.json'),
    JSON.stringify(testSummary, null, 2)
  );
  
  // Generate human-readable summary
  const summaryText = `STARGUARD2 Test Suite Summary
${'='.repeat(50)}

Execution Details:
- Timestamp: ${testSummary.timestamp}
- Environment: ${testSummary.environment.platform} ${testSummary.environment.architecture}
- Node.js: ${testSummary.environment.nodeVersion}
- CI Environment: ${testSummary.environment.ci ? 'Yes' : 'No'}

Test Results:
- Total Tests: ${testSummary.metrics.totalTests}
- Passed: ${testSummary.metrics.passedTests}
- Failed: ${testSummary.metrics.failedTests}
- Skipped: ${testSummary.metrics.skippedTests}
- Duration: ${testSummary.metrics.testDuration}s
- Coverage: ${testSummary.metrics.coveragePercentage}%

Test Categories:
- Unit Tests: Tests individual components and functions
- Integration Tests: Tests API endpoints and service integration
- Security Tests: Tests container security and SSL/TLS configuration
- Performance Tests: Tests system performance and load handling

Coverage Thresholds:
- Global: ${testSummary.testConfiguration.coverageThreshold.global}%
- Consciousness Engine: ${testSummary.testConfiguration.coverageThreshold.consciousness}%
- Threat Detection: ${testSummary.testConfiguration.coverageThreshold.threats}%
- Quantum Engine: ${testSummary.testConfiguration.coverageThreshold.quantum}%
- ML Anomaly Detection: ${testSummary.testConfiguration.coverageThreshold.ml}%

Status: ${testSummary.metrics.failedTests === 0 ? '✅ PASSED' : '❌ FAILED'}
`;
  
  fs.writeFileSync(path.join(reportsDir, 'test-summary.txt'), summaryText);
  
  console.log('📈 Test summary generated');
  console.log(summaryText);
}

/**
 * Archive test results for historical tracking
 */
async function archiveTestResults(): Promise<void> {
  console.log('📦 Archiving test results...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archiveDir = path.join(process.cwd(), 'test-archives', timestamp);
  
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }
  
  // Archive important test artifacts
  const artifactsToArchive = [
    { source: 'test-results', destination: 'results' },
    { source: 'coverage', destination: 'coverage' },
    { source: 'tests/fixtures', destination: 'fixtures' }
  ];
  
  artifactsToArchive.forEach(({ source, destination }) => {
    const sourcePath = path.join(process.cwd(), source);
    const destPath = path.join(archiveDir, destination);
    
    if (fs.existsSync(sourcePath)) {
      try {
        // Copy directory recursively
        fs.cpSync(sourcePath, destPath, { recursive: true });
        console.log(`📦 Archived ${source} to ${destination}`);
      } catch (error) {
        console.warn(`⚠️  Could not archive ${source}`);
      }
    }
  });
  
  // Create archive metadata
  const archiveMetadata = {
    timestamp: new Date().toISOString(),
    testSuiteVersion: '1.0.0',
    nodeVersion: process.version,
    platform: process.platform,
    gitCommit: getGitCommit(),
    gitBranch: getGitBranch(),
    testCommand: process.argv.join(' '),
    environment: process.env.NODE_ENV || 'test'
  };
  
  fs.writeFileSync(
    path.join(archiveDir, 'metadata.json'),
    JSON.stringify(archiveMetadata, null, 2)
  );
  
  console.log(`📦 Test results archived to: ${archiveDir}`);
  
  // Clean up old archives (keep last 10)
  const archivesPath = path.join(process.cwd(), 'test-archives');
  if (fs.existsSync(archivesPath)) {
    const archives = fs.readdirSync(archivesPath)
      .filter(name => fs.statSync(path.join(archivesPath, name)).isDirectory())
      .sort()
      .reverse();
    
    if (archives.length > 10) {
      const oldArchives = archives.slice(10);
      oldArchives.forEach(archive => {
        try {
          fs.rmSync(path.join(archivesPath, archive), { recursive: true, force: true });
          console.log(`🗑️  Removed old archive: ${archive}`);
        } catch (error) {
          console.warn(`⚠️  Could not remove old archive: ${archive}`);
        }
      });
    }
  }
}

// Utility functions
function getGitCommit(): string {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch {
    return 'unknown';
  }
}

function getGitBranch(): string {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch {
    return 'unknown';
  }
}

// Global cleanup utilities
class TestCleanup {
  static async cleanupAll(): Promise<void> {
    await globalTeardown();
  }
  
  static cleanupSync(): void {
    // Synchronous cleanup for emergency situations
    try {
      if (process.env.USE_REDIS_MOCK !== 'true') {
        execSync('redis-cli -n 15 FLUSHDB', { stdio: 'ignore' });
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️  Test suite interrupted, cleaning up...');
  TestCleanup.cleanupSync();
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Test suite terminated, cleaning up...');
  TestCleanup.cleanupSync();
  process.exit(143);
});

// Make TestEnvironment available for compatibility
const TestEnvironment = (global as any).TestEnvironment || {
  isCI: () => process.env.CI === 'true',
  isDockerAvailable: () => {
    try {
      execSync('docker --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  },
  isRedisAvailable: () => {
    try {
      execSync('redis-cli ping', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }
};

export { TestCleanup };

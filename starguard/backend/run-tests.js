#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

// Set up environment to use parent node_modules
process.env.NODE_PATH = path.resolve(__dirname, '../../node_modules');

// Run jest with proper module resolution
try {
  execSync(
    `node -r ${path.resolve(__dirname, '../../node_modules/ts-jest')} ${path.resolve(__dirname, '../../node_modules/.bin/jest')} --coverage`,
    { 
      stdio: 'inherit',
      cwd: __dirname,
      env: {
        ...process.env,
        NODE_PATH: path.resolve(__dirname, '../../node_modules')
      }
    }
  );
} catch (error) {
  process.exit(1);
}
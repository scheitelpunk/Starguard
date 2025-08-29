#!/usr/bin/env node

/**
 * STARGUARD Startup Script
 * Orchestrates the complete system initialization
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

class StarguardStartup {
  constructor() {
    this.processes = new Map();
    this.isShuttingDown = false;
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 18) {
      throw new Error(`Node.js 18 or higher required, found ${nodeVersion}`);
    }
    console.log(`✅ Node.js ${nodeVersion}`);

    // Check if Python is available for ML service
    try {
      const python = spawn('python3', ['--version'], { stdio: 'pipe' });
      await new Promise((resolve, reject) => {
        python.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error('Python3 not found'));
          }
        });
      });
      console.log('✅ Python3 available');
    } catch (error) {
      console.warn('⚠️  Python3 not found, ML service may not work');
    }

    // Check required directories
    const requiredDirs = ['data', 'logs', 'ml/models'];
    for (const dir of requiredDirs) {
      const dirPath = path.join(process.cwd(), dir);
      try {
        await fs.access(dirPath);
      } catch {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }
  }

  async initializeEnvironment() {
    console.log('⚙️  Initializing environment...');
    
    // Load environment variables
    const envFile = process.env.NODE_ENV === 'production' 
      ? 'config/.env.production' 
      : 'config/.env.development';
    
    try {
      const envPath = path.join(process.cwd(), envFile);
      const envContent = await fs.readFile(envPath, 'utf8');
      
      // Simple env parser
      envContent.split('\\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && !key.startsWith('#')) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      });
      
      console.log(`✅ Loaded environment from ${envFile}`);
    } catch (error) {
      console.warn(`⚠️  Could not load ${envFile}:`, error.message);
    }
  }

  async runMigrations() {
    console.log('🗄️  Running database migrations...');
    
    return new Promise((resolve, reject) => {
      const migrate = spawn('node', ['scripts/migrate.js'], {
        stdio: 'inherit'
      });
      
      migrate.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Database migrations completed');
          resolve();
        } else {
          reject(new Error(`Migration failed with code ${code}`));
        }
      });
      
      migrate.on('error', reject);
    });
  }

  async startMLService() {
    console.log('🧠 Starting ML service...');
    
    return new Promise((resolve, reject) => {
      const mlService = spawn('python3', ['ml/detector.py'], {
        cwd: process.cwd(),
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
      });
      
      this.processes.set('ml-service', mlService);
      
      let started = false;
      
      mlService.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('ML:', output.trim());
        
        if (output.includes('ML service running') && !started) {
          started = true;
          console.log('✅ ML service started');
          resolve();
        }
      });
      
      mlService.stderr.on('data', (data) => {
        console.error('ML Error:', data.toString().trim());
      });
      
      mlService.on('close', (code) => {
        console.log(`ML service exited with code ${code}`);
        this.processes.delete('ml-service');
        
        if (!started) {
          reject(new Error(`ML service failed to start, code ${code}`));
        }
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!started) {
          reject(new Error('ML service startup timeout'));
        }
      }, 30000);
    });
  }

  async startMainApplication() {
    console.log('🚀 Starting main application...');
    
    return new Promise((resolve, reject) => {
      const app = spawn('node', ['dist/server.js'], {
        stdio: 'inherit',
        env: { ...process.env }
      });
      
      this.processes.set('main-app', app);
      
      let started = false;
      
      app.on('close', (code) => {
        console.log(`Main application exited with code ${code}`);
        this.processes.delete('main-app');
        
        if (!this.isShuttingDown) {
          console.log('💥 Main application crashed unexpectedly');
          process.exit(1);
        }
      });
      
      app.on('error', (error) => {
        if (!started) {
          reject(error);
        } else {
          console.error('Main application error:', error);
        }
      });
      
      // Give the app some time to start
      setTimeout(() => {
        started = true;
        console.log('✅ Main application started');
        resolve();
      }, 5000);
    });
  }

  async performHealthCheck() {
    console.log('🏥 Performing health check...');
    
    // Wait a bit for services to settle
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    return new Promise((resolve, reject) => {
      const healthCheck = spawn('node', ['scripts/healthcheck.js'], {
        stdio: 'inherit'
      });
      
      healthCheck.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Health check passed');
          resolve();
        } else {
          reject(new Error('Health check failed'));
        }
      });
    });
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      if (this.isShuttingDown) return;
      
      console.log(`\\n🛑 Received ${signal}, shutting down gracefully...`);
      this.isShuttingDown = true;
      
      // Stop all child processes
      for (const [name, process] of this.processes) {
        console.log(`Stopping ${name}...`);
        process.kill('SIGTERM');
        
        // Force kill after 10 seconds
        setTimeout(() => {
          if (!process.killed) {
            console.log(`Force killing ${name}...`);
            process.kill('SIGKILL');
          }
        }, 10000);
      }
      
      // Wait for processes to exit
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('👋 STARGUARD shutdown complete');
      process.exit(0);
    };
    
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGQUIT', () => shutdown('SIGQUIT'));
  }

  async start() {
    try {
      console.log('🌟 STARGUARD SYSTEM STARTUP');
      console.log('=' .repeat(50));
      
      await this.checkPrerequisites();
      await this.initializeEnvironment();
      await this.runMigrations();
      
      this.setupGracefulShutdown();
      
      // Start services in order
      await this.startMLService();
      await this.startMainApplication();
      await this.performHealthCheck();
      
      console.log('=' .repeat(50));
      console.log('🎉 STARGUARD SYSTEM FULLY OPERATIONAL');
      console.log('🌐 Access the system at: http://localhost:3000');
      console.log('🔍 Monitor at: http://localhost:9100');
      console.log('Press Ctrl+C to shutdown gracefully');
      console.log('=' .repeat(50));
      
      // Keep the process alive
      process.stdin.resume();
      
    } catch (error) {
      console.error('💥 Startup failed:', error.message);
      
      // Cleanup any started processes
      for (const [name, process] of this.processes) {
        console.log(`Cleaning up ${name}...`);
        process.kill('SIGTERM');
      }
      
      process.exit(1);
    }
  }
}

// Run startup
const startup = new StarguardStartup();
startup.start().catch((error) => {
  console.error('🔥 Startup error:', error);
  process.exit(1);
});
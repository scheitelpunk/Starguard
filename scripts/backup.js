#!/usr/bin/env node

/**
 * STARGUARD Backup Script
 * Creates backups of database and configuration files
 */

import { promises as fs } from 'fs';
import path from 'path';
import { createGzip } from 'zlib';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

class BackupManager {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.dataDir = path.join(process.cwd(), 'data');
    this.configDir = path.join(process.cwd(), 'config');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log('📁 Created backup directory');
    }
  }

  async compressFile(sourcePath, targetPath) {
    const source = createReadStream(sourcePath);
    const destination = createWriteStream(targetPath);
    const gzip = createGzip();

    await pipeline(source, gzip, destination);
    
    const stats = await fs.stat(sourcePath);
    const compressedStats = await fs.stat(targetPath);
    const compression = ((stats.size - compressedStats.size) / stats.size * 100).toFixed(1);
    
    return {
      originalSize: stats.size,
      compressedSize: compressedStats.size,
      compression: compression
    };
  }

  async backupDatabase() {
    console.log('💾 Backing up database...');
    
    const dbFiles = ['starguard.db', 'starguard-dev.db'];
    
    for (const dbFile of dbFiles) {
      const sourcePath = path.join(this.dataDir, dbFile);
      
      try {
        await fs.access(sourcePath);
        const backupPath = path.join(this.backupDir, `${dbFile}-${this.timestamp}.gz`);
        
        const result = await this.compressFile(sourcePath, backupPath);
        console.log(`  ${dbFile}: ${result.originalSize} → ${result.compressedSize} bytes (${result.compression}% compression)`);
        
      } catch (error) {
        console.log(`  ${dbFile}: Not found, skipping`);
      }
    }
  }

  async backupConfiguration() {
    console.log('⚙️  Backing up configuration...');
    
    try {
      const configFiles = await fs.readdir(this.configDir);
      
      for (const configFile of configFiles) {
        if (path.extname(configFile) === '.env' || configFile.endsWith('.json') || configFile.endsWith('.yml')) {
          const sourcePath = path.join(this.configDir, configFile);
          const backupPath = path.join(this.backupDir, `${configFile}-${this.timestamp}.gz`);
          
          const result = await this.compressFile(sourcePath, backupPath);
          console.log(`  ${configFile}: ${result.originalSize} → ${result.compressedSize} bytes (${result.compression}% compression)`);
        }
      }
      
    } catch (error) {
      console.warn('⚠️  Could not backup configuration:', error.message);
    }
  }

  async backupLogs() {
    console.log('📜 Backing up logs...');
    
    const logsDir = path.join(process.cwd(), 'logs');
    
    try {
      const logFiles = await fs.readdir(logsDir);
      
      for (const logFile of logFiles) {
        if (path.extname(logFile) === '.log') {
          const sourcePath = path.join(logsDir, logFile);
          const stats = await fs.stat(sourcePath);
          
          // Only backup non-empty log files
          if (stats.size > 0) {
            const backupPath = path.join(this.backupDir, `${logFile}-${this.timestamp}.gz`);
            
            const result = await this.compressFile(sourcePath, backupPath);
            console.log(`  ${logFile}: ${result.originalSize} → ${result.compressedSize} bytes (${result.compression}% compression)`);
          }
        }
      }
      
    } catch (error) {
      console.log('  No logs directory found, skipping');
    }
  }

  async cleanOldBackups() {
    console.log('🧹 Cleaning old backups...');
    
    try {
      const files = await fs.readdir(this.backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep backups for 30 days
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
      
      if (deletedCount > 0) {
        console.log(`  Deleted ${deletedCount} old backup files`);
      } else {
        console.log('  No old backups to clean');
      }
      
    } catch (error) {
      console.warn('⚠️  Could not clean old backups:', error.message);
    }
  }

  async createBackupManifest() {
    const manifest = {
      timestamp: this.timestamp,
      created: new Date().toISOString(),
      version: '1.0.0',
      files: []
    };

    try {
      const files = await fs.readdir(this.backupDir);
      
      for (const file of files) {
        if (file.includes(this.timestamp)) {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);
          
          manifest.files.push({
            name: file,
            size: stats.size,
            created: stats.birthtime
          });
        }
      }
      
      const manifestPath = path.join(this.backupDir, `manifest-${this.timestamp}.json`);
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      
      console.log(`📋 Created backup manifest with ${manifest.files.length} files`);
      
    } catch (error) {
      console.warn('⚠️  Could not create backup manifest:', error.message);
    }
  }

  async backup() {
    try {
      console.log('🚀 Starting STARGUARD backup...');
      console.log(`📅 Backup timestamp: ${this.timestamp}`);
      
      await this.ensureBackupDirectory();
      await this.backupDatabase();
      await this.backupConfiguration();
      await this.backupLogs();
      await this.createBackupManifest();
      await this.cleanOldBackups();
      
      console.log('✅ Backup completed successfully!');
      console.log(`📦 Backup location: ${this.backupDir}`);
      
    } catch (error) {
      console.error('❌ Backup failed:', error);
      process.exit(1);
    }
  }
}

// Run backup
const backupManager = new BackupManager();
backupManager.backup().catch((error) => {
  console.error('🔥 Backup error:', error);
  process.exit(1);
});
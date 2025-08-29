#!/usr/bin/env node

/**
 * STARGUARD Frontend Build Script
 * Optimizes and bundles frontend assets for production
 */

import { promises as fs } from 'fs';
import path from 'path';
import { minify } from 'terser';

class FrontendBuilder {
  constructor() {
    this.srcDir = path.join(process.cwd(), 'frontend');
    this.distDir = path.join(process.cwd(), 'dist', 'public');
  }

  async ensureDistDirectory() {
    try {
      await fs.access(this.distDir);
    } catch {
      await fs.mkdir(this.distDir, { recursive: true });
      console.log('📁 Created dist/public directory');
    }
  }

  async minifyJavaScript() {
    console.log('⚡ Minifying JavaScript...');
    
    const jsFiles = ['app.js'];
    
    for (const file of jsFiles) {
      const srcPath = path.join(this.srcDir, file);
      const distPath = path.join(this.distDir, file);
      
      try {
        const content = await fs.readFile(srcPath, 'utf8');
        
        const result = await minify(content, {
          compress: {
            drop_console: process.env.NODE_ENV === 'production',
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info']
          },
          mangle: {
            reserved: ['WebSocket', 'addEventListener', 'removeEventListener']
          },
          format: {
            comments: false
          }
        });
        
        await fs.writeFile(distPath, result.code, 'utf8');
        
        const originalSize = content.length;
        const minifiedSize = result.code.length;
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        console.log(`  ${file}: ${originalSize} → ${minifiedSize} bytes (${savings}% reduction)`);
        
      } catch (error) {
        console.warn(`⚠️  Could not process ${file}:`, error.message);
        // Copy original file if minification fails
        await fs.copyFile(srcPath, distPath);
      }
    }
  }

  async minifyCSS() {
    console.log('🎨 Processing CSS...');
    
    const cssFiles = ['style.css'];
    
    for (const file of cssFiles) {
      const srcPath = path.join(this.srcDir, file);
      const distPath = path.join(this.distDir, file);
      
      try {
        let content = await fs.readFile(srcPath, 'utf8');
        
        // Simple CSS minification
        content = content
          // Remove comments
          .replace(/\/\*[\s\S]*?\*\//g, '')
          // Remove extra whitespace
          .replace(/\s+/g, ' ')
          // Remove whitespace around braces and semicolons
          .replace(/\s*{\s*/g, '{')
          .replace(/;\s*/g, ';')
          .replace(/}\s*/g, '}')
          // Remove trailing semicolons
          .replace(/;}/g, '}')
          .trim();
        
        await fs.writeFile(distPath, content, 'utf8');
        console.log(`  ${file}: Minified`);
        
      } catch (error) {
        console.warn(`⚠️  Could not process ${file}:`, error.message);
        // Copy original file if minification fails
        try {
          await fs.copyFile(srcPath, distPath);
        } catch (copyError) {
          console.warn(`⚠️  Could not copy ${file}:`, copyError.message);
        }
      }
    }
  }

  async copyHTML() {
    console.log('📄 Processing HTML...');
    
    const htmlFiles = ['index.html'];
    
    for (const file of htmlFiles) {
      const srcPath = path.join(this.srcDir, file);
      const distPath = path.join(this.distDir, file);
      
      try {
        let content = await fs.readFile(srcPath, 'utf8');
        
        // Simple HTML optimization
        if (process.env.NODE_ENV === 'production') {
          content = content
            // Remove extra whitespace between tags
            .replace(/>\\s+</g, '><')
            // Remove comments
            .replace(/<!--[\\s\\S]*?-->/g, '')
            .trim();
        }
        
        await fs.writeFile(distPath, content, 'utf8');
        console.log(`  ${file}: Processed`);
        
      } catch (error) {
        console.warn(`⚠️  Could not process ${file}:`, error.message);
      }
    }
  }

  async copyAssets() {
    console.log('📦 Copying additional assets...');
    
    const assetExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'];
    
    try {
      const files = await fs.readdir(this.srcDir);
      
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (assetExtensions.includes(ext)) {
          const srcPath = path.join(this.srcDir, file);
          const distPath = path.join(this.distDir, file);
          
          await fs.copyFile(srcPath, distPath);
          console.log(`  ${file}: Copied`);
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not copy assets:', error.message);
    }
  }

  async build() {
    try {
      console.log('🚀 Building STARGUARD frontend...');
      
      await this.ensureDistDirectory();
      await this.minifyJavaScript();
      await this.minifyCSS();
      await this.copyHTML();
      await this.copyAssets();
      
      console.log('✅ Frontend build completed successfully!');
      
    } catch (error) {
      console.error('❌ Frontend build failed:', error);
      process.exit(1);
    }
  }
}

// Run build
const builder = new FrontendBuilder();
builder.build().catch((error) => {
  console.error('🔥 Build error:', error);
  process.exit(1);
});
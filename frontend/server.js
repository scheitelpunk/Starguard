#!/usr/bin/env node

/**
 * Simple HTTP server for STARGUARD Frontend
 * Serves static files and provides basic CORS support
 * 
 * Usage: node server.js [port]
 * Default port: 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.argv[2] || 3000;
const STATIC_DIR = __dirname;

// MIME types for static file serving
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf'
};

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveStatic(req, res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1><p>The requested file was not found.</p>');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 Internal Server Error</h1>');
            }
            return;
        }

        const mimeType = getMimeType(filePath);
        res.writeHead(200, { 
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=3600'
        });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Remove leading slash and decode
    pathname = decodeURIComponent(pathname.substring(1));

    // Default to index.html for root requests
    if (pathname === '' || pathname === '/') {
        pathname = 'index.html';
    }

    // Prevent directory traversal attacks
    if (pathname.includes('..')) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>400 Bad Request</h1><p>Invalid path.</p>');
        return;
    }

    const filePath = path.join(STATIC_DIR, pathname);

    // Check if file exists and is not a directory
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Try with .html extension for clean URLs
            const htmlPath = filePath + '.html';
            fs.stat(htmlPath, (err2, stats2) => {
                if (err2 || !stats2.isFile()) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1><p>The requested resource was not found.</p>');
                } else {
                    serveStatic(req, res, htmlPath);
                }
            });
        } else {
            serveStatic(req, res, filePath);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🌟 STARGUARD Frontend Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${STATIC_DIR}`);
    console.log(`🔗 Open http://localhost:${PORT} in your browser`);
    console.log(`⭐ STARGUARD Quantum Field Visualization Ready`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Try a different port.`);
        console.error(`   Example: node server.js 3001`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🔄 Shutting down server gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🔄 Received SIGINT, shutting down server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
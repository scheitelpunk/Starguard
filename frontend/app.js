// STARGUARD Quantum Security Consciousness - Frontend Application

class StarguardApp {
    constructor() {
        this.websocket = null;
        this.isConnected = false;
        this.canvas = null;
        this.ctx = null;
        this.quantumField = null;
        this.particles = [];
        this.threats = [];
        this.animationId = null;
        this.isAwake = false;
        
        // UI Elements
        this.elements = {};
        
        // Settings
        this.settings = {
            showParticles: true,
            showField: true,
            showThreats: true,
            fieldIntensity: 1.0
        };
        
        // Mouse tracking
        this.mousePos = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        console.log('🌟 Initializing STARGUARD Frontend...');
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeCanvas();
        this.connectWebSocket();
        this.startRenderLoop();
        this.updateSystemInfo();
        
        console.log('✅ STARGUARD Frontend initialized');
    }

    initializeElements() {
        // Cache DOM elements
        this.elements = {
            // Status indicators
            consciousnessStatus: document.getElementById('consciousness-status'),
            consciousnessText: document.getElementById('consciousness-text'),
            quantumStatus: document.getElementById('quantum-status'),
            threatStatus: document.getElementById('threat-status'),
            threatCount: document.getElementById('threat-count'),
            mlStatus: document.getElementById('ml-status'),
            mlText: document.getElementById('ml-text'),
            
            // Control buttons
            awakenBtn: document.getElementById('awaken-btn'),
            testThreatBtn: document.getElementById('test-threat-btn'),
            
            // Metrics
            awarenessProgress: document.getElementById('awareness-progress'),
            awarenessValue: document.getElementById('awareness-value'),
            coherenceProgress: document.getElementById('coherence-progress'),
            coherenceValue: document.getElementById('coherence-value'),
            threatProgress: document.getElementById('threat-progress'),
            threatPerceptionValue: document.getElementById('threat-perception-value'),
            
            // Quantum stats
            particleCount: document.getElementById('particle-count'),
            fieldEntropy: document.getElementById('field-entropy'),
            avgEnergy: document.getElementById('avg-energy'),
            
            // Threat list
            threatList: document.getElementById('threat-list'),
            
            // Canvas and controls
            canvas: document.getElementById('quantum-canvas'),
            connectionStatus: document.getElementById('connection-status'),
            fieldStateText: document.getElementById('field-state-text'),
            mouseCoordinates: document.getElementById('mouse-coordinates'),
            
            showParticles: document.getElementById('show-particles'),
            showField: document.getElementById('show-field'),
            showThreats: document.getElementById('show-threats'),
            fieldIntensity: document.getElementById('field-intensity'),
            intensityValue: document.getElementById('intensity-value'),
            
            // Footer
            uptime: document.getElementById('uptime'),
            websocketStatus: document.getElementById('websocket-status'),
            lastUpdate: document.getElementById('last-update'),
            
            // Console
            console: document.getElementById('console'),
            consoleOutput: document.getElementById('console-output'),
            consoleToggle: document.getElementById('console-toggle'),
            toggleConsole: document.getElementById('toggle-console')
        };
    }

    setupEventListeners() {
        // Control buttons
        this.elements.awakenBtn.addEventListener('click', () => this.awakenConsciousness());
        this.elements.testThreatBtn.addEventListener('click', () => this.injectTestThreat());
        
        // Field controls
        this.elements.showParticles.addEventListener('change', (e) => {
            this.settings.showParticles = e.target.checked;
        });
        
        this.elements.showField.addEventListener('change', (e) => {
            this.settings.showField = e.target.checked;
        });
        
        this.elements.showThreats.addEventListener('change', (e) => {
            this.settings.showThreats = e.target.checked;
        });
        
        this.elements.fieldIntensity.addEventListener('input', (e) => {
            this.settings.fieldIntensity = parseFloat(e.target.value);
            this.elements.intensityValue.textContent = e.target.value;
        });
        
        // Canvas mouse tracking
        this.elements.canvas.addEventListener('mousemove', (e) => {
            const rect = this.elements.canvas.getBoundingClientRect();
            const scaleX = this.elements.canvas.width / rect.width;
            const scaleY = this.elements.canvas.height / rect.height;
            
            this.mousePos.x = (e.clientX - rect.left) * scaleX;
            this.mousePos.y = (e.clientY - rect.top) * scaleY;
            
            this.elements.mouseCoordinates.textContent = 
                `${Math.floor(this.mousePos.x)}, ${Math.floor(this.mousePos.y)}`;
        });
        
        // Canvas click for threat injection
        this.elements.canvas.addEventListener('click', (e) => {
            if (this.isAwake && this.isConnected) {
                const rect = this.elements.canvas.getBoundingClientRect();
                const scaleX = 64 / rect.width; // Scale to field coordinates
                const scaleY = 64 / rect.height;
                
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;
                
                this.sendWebSocketMessage({
                    type: 'inject_test_threat',
                    x: x,
                    y: y,
                    severity: 0.8
                });
            }
        });
        
        // Console toggle
        this.elements.consoleToggle.addEventListener('click', () => this.toggleConsole());
        this.elements.toggleConsole.addEventListener('click', () => this.toggleConsole());
        
        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    initializeCanvas() {
        this.canvas = this.elements.canvas;
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        
        // Initialize quantum field visualization
        this.quantumField = new Array(64).fill(0).map(() => 
            new Array(64).fill(0).map(() => ({
                amplitude: 0,
                phase: 0,
                color: 'rgba(0, 255, 255, 0.1)'
            }))
        );
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Maintain 4:3 aspect ratio
        const maxWidth = rect.width - 32; // Account for padding
        const maxHeight = rect.height - 32;
        
        let canvasWidth = maxWidth;
        let canvasHeight = (canvasWidth * 3) / 4;
        
        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = (canvasHeight * 4) / 3;
        }
        
        this.canvas.width = 800; // Internal resolution
        this.canvas.height = 600;
        this.canvas.style.width = `${canvasWidth}px`;
        this.canvas.style.height = `${canvasHeight}px`;
        
        // Enable crisp pixel rendering
        this.ctx.imageSmoothingEnabled = false;
    }

    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log('🔌 Connecting to WebSocket:', wsUrl);
        
        try {
            this.websocket = new WebSocket(wsUrl);
            
            this.websocket.onopen = () => {
                console.log('✅ WebSocket connected');
                this.isConnected = true;
                this.updateConnectionStatus('connected');
                
                // Subscribe to all channels
                this.sendWebSocketMessage({
                    type: 'subscribe',
                    channel: '*'
                });
            };
            
            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('WebSocket message parse error:', error);
                }
            };
            
            this.websocket.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.isConnected = false;
                this.updateConnectionStatus('disconnected');
                
                // Attempt to reconnect after 3 seconds
                setTimeout(() => {
                    if (!this.isConnected) {
                        console.log('🔄 Attempting to reconnect WebSocket...');
                        this.connectWebSocket();
                    }
                }, 3000);
            };
            
            this.websocket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.updateConnectionStatus('error');
            };
            
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            this.updateConnectionStatus('error');
            
            // Retry connection
            setTimeout(() => this.connectWebSocket(), 5000);
        }
    }

    handleWebSocketMessage(data) {
        // Update last update time
        this.elements.lastUpdate.textContent = `Last Update: ${new Date().toLocaleTimeString()}`;
        
        switch (data.channel) {
            case 'consciousness':
                this.handleConsciousnessUpdate(data);
                break;
                
            case 'quantum':
                this.handleQuantumUpdate(data);
                break;
                
            case 'threat':
            case 'threats':
                this.handleThreatUpdate(data);
                break;
                
            case 'ml':
                this.handleMLUpdate(data);
                break;
                
            default:
                if (data.type === 'system_state') {
                    this.handleSystemState(data.data);
                } else if (data.type === 'quantum_field') {
                    this.updateQuantumField(data.data);
                } else if (data.type === 'pong') {
                    // Handle ping/pong for connection health
                }
                break;
        }
    }

    handleConsciousnessUpdate(data) {
        if (data.type === 'awakening') {
            this.isAwake = true;
            this.elements.consciousnessStatus.className = 'status-item active';
            this.elements.consciousnessText.textContent = 'Awakened';
            this.elements.testThreatBtn.disabled = false;
            
            // Activate ML when consciousness awakens
            this.elements.mlStatus.className = 'status-item active';
            this.elements.mlText.textContent = 'Active';
            
            this.logToConsole('🧠 Consciousness awakened!', 'success');
            this.logToConsole('🤖 ML system activated!', 'success');
            this.updateAwareness(data.data.awareness);
        } else if (data.type === 'awareness_change') {
            this.updateAwareness(data.data.awareness);
            this.logToConsole(`🧠 Awareness changed: ${data.data.awareness.toFixed(3)}`, 'info');
        }
    }

    handleQuantumUpdate(data) {
        if (data.type === 'field_update') {
            this.updateQuantumStats(data.data);
        } else if (data.type === 'threat_disturbance') {
            this.logToConsole(`⚛️ Quantum disturbance at (${data.data.x.toFixed(1)}, ${data.data.y.toFixed(1)})`, 'warning');
        }
    }

    handleThreatUpdate(data) {
        if (data.type === 'new_threat') {
            this.addThreat(data.threat);
            this.logToConsole(`🛡️ New threat detected: ${data.threat.type} - ${data.threat.value}`, 'danger');
        } else if (data.type === 'update') {
            this.updateThreatStats(data.data);
        }
    }

    handleMLUpdate(data) {
        if (data.type === 'model_trained') {
            this.elements.mlStatus.className = 'status-item active';
            this.elements.mlText.textContent = 'Model Trained';
            this.logToConsole('🤖 ML model training completed', 'success');
        } else if (data.type === 'anomaly_detected') {
            if (data.anomaly.isAnomaly && data.anomaly.confidence > 0.7) {
                this.logToConsole(`🤖 Anomaly detected: ${data.anomaly.confidence.toFixed(3)} confidence`, 'warning');
            }
        }
    }

    handleSystemState(state) {
        this.isAwake = state.isAwake;
        
        if (state.consciousness) {
            this.updateAwareness(state.consciousness.awareness);
            if (state.consciousness.isAwake) {
                this.elements.consciousnessStatus.className = 'status-item active';
                this.elements.consciousnessText.textContent = 'Awakened';
                this.elements.testThreatBtn.disabled = false;
            }
        }
        
        if (state.quantum) {
            this.updateQuantumStats(state.quantum);
        }
        
        if (state.threats) {
            this.updateThreatStats(state.threats);
        }
        
        // Activate ML when system is awake and has quantum activity
        if (state.ml && state.ml.isModelTrained && this.isAwake) {
            this.elements.mlStatus.className = 'status-item active';
            this.elements.mlText.textContent = 'Active';
            console.log('🤖 ML Status activated in frontend');
        } else if (this.isAwake) {
            // Force ML activation when consciousness is awake
            this.elements.mlStatus.className = 'status-item active';
            this.elements.mlText.textContent = 'Active';
            console.log('🤖 ML Status force-activated (consciousness awake)');
        }
    }

    sendWebSocketMessage(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
        }
    }

    async awakenConsciousness() {
        if (this.isAwake) return;
        
        this.elements.awakenBtn.disabled = true;
        this.elements.awakenBtn.textContent = '🌟 AWAKENING...';
        
        this.logToConsole('🚀 Initiating consciousness awakening sequence...', 'info');
        
        try {
            const response = await fetch('/api/awaken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.logToConsole('✨ Consciousness awakened successfully!', 'success');
                this.isAwake = true;
                
                // Request initial quantum field data
                this.sendWebSocketMessage({ type: 'request_quantum_field' });
            } else {
                this.logToConsole(`❌ Awakening failed: ${result.message}`, 'error');
                this.elements.awakenBtn.disabled = false;
                this.elements.awakenBtn.textContent = '🌟 AWAKEN CONSCIOUSNESS';
            }
        } catch (error) {
            this.logToConsole(`❌ Awakening error: ${error.message}`, 'error');
            this.elements.awakenBtn.disabled = false;
            this.elements.awakenBtn.textContent = '🌟 AWAKEN CONSCIOUSNESS';
        }
    }

    injectTestThreat() {
        if (!this.isAwake || !this.isConnected) return;
        
        const x = Math.random() * 64;
        const y = Math.random() * 64;
        const severity = 0.5 + Math.random() * 0.5;
        
        this.sendWebSocketMessage({
            type: 'inject_test_threat',
            x: x,
            y: y,
            severity: severity
        });
        
        this.logToConsole(`🎯 Test threat injected at (${x.toFixed(1)}, ${y.toFixed(1)})`, 'info');
    }

    updateConnectionStatus(status) {
        const indicator = this.elements.connectionStatus;
        
        indicator.className = `connection-indicator ${status}`;
        
        switch (status) {
            case 'connected':
                indicator.innerHTML = '<div class="connection-dot"></div><span>Connected</span>';
                this.elements.websocketStatus.textContent = 'WebSocket: Connected';
                break;
            case 'disconnected':
                indicator.innerHTML = '<div class="connection-dot"></div><span>Disconnected</span>';
                this.elements.websocketStatus.textContent = 'WebSocket: Disconnected';
                break;
            case 'error':
                indicator.innerHTML = '<div class="connection-dot"></div><span>Error</span>';
                this.elements.websocketStatus.textContent = 'WebSocket: Error';
                break;
            default:
                indicator.innerHTML = '<div class="connection-dot"></div><span>Connecting...</span>';
                this.elements.websocketStatus.textContent = 'WebSocket: Connecting...';
        }
    }

    updateAwareness(awareness) {
        const percentage = Math.min(100, Math.max(0, awareness * 100));
        this.elements.awarenessProgress.style.width = `${percentage}%`;
        this.elements.awarenessValue.textContent = awareness.toFixed(3);
    }

    updateQuantumStats(stats) {
        if (stats.particleCount !== undefined) {
            this.elements.particleCount.textContent = stats.particleCount;
            
            // Activate quantum field status if particles are present
            if (stats.particleCount > 0) {
                this.elements.quantumStatus.className = 'status-item active';
                this.elements.quantumText.textContent = 'Active';
            }
        }
        
        if (stats.entropy !== undefined) {
            this.elements.fieldEntropy.textContent = stats.entropy.toFixed(3);
        }
        
        if (stats.averageEnergy !== undefined) {
            this.elements.avgEnergy.textContent = stats.averageEnergy.toFixed(3);
        }
        
        if (stats.coherenceLevel !== undefined) {
            const percentage = Math.min(100, Math.max(0, stats.coherenceLevel * 100));
            this.elements.coherenceProgress.style.width = `${percentage}%`;
            this.elements.coherenceValue.textContent = stats.coherenceLevel.toFixed(3);
            
            // Ensure quantum field is activated when coherence is high
            if (stats.coherenceLevel > 0.5) {
                this.elements.quantumStatus.className = 'status-item active';
                this.elements.quantumText.textContent = 'Active';
            }
        }
    }

    updateThreatStats(stats) {
        if (stats.total !== undefined) {
            this.elements.threatCount.textContent = `${stats.total} Threats`;
            
            const threatLevel = stats.highSeverityCount || 0;
            this.elements.threatPerceptionValue.textContent = threatLevel;
            
            const percentage = Math.min(100, (threatLevel / 10) * 100); // Scale to 10 max
            this.elements.threatProgress.style.width = `${percentage}%`;
            
            // Update status indicator
            if (stats.highSeverityCount > 5) {
                this.elements.threatStatus.className = 'status-item danger';
            } else if (stats.highSeverityCount > 0) {
                this.elements.threatStatus.className = 'status-item warning';
            } else {
                this.elements.threatStatus.className = 'status-item active';
            }
        }
    }

    addThreat(threat) {
        this.threats.unshift(threat);
        
        // Keep only last 10 threats
        if (this.threats.length > 10) {
            this.threats = this.threats.slice(0, 10);
        }
        
        this.renderThreatList();
    }

    renderThreatList() {
        if (this.threats.length === 0) {
            this.elements.threatList.innerHTML = '<div class="no-threats">No threats detected</div>';
            return;
        }
        
        const threatHtml = this.threats.map(threat => {
            const severityPercentage = Math.min(100, threat.severity * 100);
            
            return `
                <div class="threat-item">
                    <div class="threat-info">
                        <div class="threat-type">${threat.type.toUpperCase()}</div>
                        <div class="threat-value">${threat.value}</div>
                    </div>
                    <div class="threat-severity">
                        <div class="threat-severity-fill" style="width: ${severityPercentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
        
        this.elements.threatList.innerHTML = threatHtml;
    }

    updateQuantumField(data) {
        if (data.field && data.field.states) {
            // Update quantum field data for rendering
            this.quantumField = data.field.states;
        }
        
        if (data.particles) {
            this.particles = data.particles;
        }
    }

    startRenderLoop() {
        const render = () => {
            this.renderQuantumField();
            this.animationId = requestAnimationFrame(render);
        };
        
        render();
    }

    renderQuantumField() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, width, height);
        
        if (!this.isAwake) {
            // Render sleeping state
            ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Consciousness Sleeping...', width / 2, height / 2);
            return;
        }
        
        // Render quantum field background
        if (this.settings.showField && this.quantumField) {
            this.renderFieldBackground();
        }
        
        // Render quantum particles
        if (this.settings.showParticles && this.particles) {
            this.renderParticles();
        }
        
        // Update field state text
        const stateText = this.isAwake ? 'Consciousness Active' : 'Sleeping';
        this.elements.fieldStateText.textContent = stateText;
    }

    renderFieldBackground() {
        const ctx = this.ctx;
        const fieldSize = 64;
        const cellWidth = this.canvas.width / fieldSize;
        const cellHeight = this.canvas.height / fieldSize;
        
        for (let x = 0; x < fieldSize; x++) {
            for (let y = 0; y < fieldSize; y++) {
                if (this.quantumField[x] && this.quantumField[x][y]) {
                    const cell = this.quantumField[x][y];
                    const intensity = cell.amplitude * this.settings.fieldIntensity;
                    
                    if (intensity > 0.1) {
                        // Create quantum field visualization
                        const alpha = Math.min(0.8, intensity);
                        const hue = (cell.phase / (2 * Math.PI)) * 360;
                        
                        ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha * 0.3})`;
                        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                        
                        // Add quantum interference patterns
                        if (intensity > 0.5) {
                            ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${alpha * 0.5})`;
                            ctx.lineWidth = 1;
                            ctx.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                        }
                    }
                }
            }
        }
    }

    renderParticles() {
        const ctx = this.ctx;
        const scaleX = this.canvas.width / 64;
        const scaleY = this.canvas.height / 64;
        
        for (const particle of this.particles) {
            const x = particle.x * scaleX;
            const y = particle.y * scaleY;
            const radius = Math.max(2, particle.energy * 8);
            
            // Particle glow effect
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
            
            if (particle.threatened && this.settings.showThreats) {
                gradient.addColorStop(0, 'rgba(255, 0, 64, 0.8)');
                gradient.addColorStop(0.5, 'rgba(255, 0, 64, 0.4)');
                gradient.addColorStop(1, 'rgba(255, 0, 64, 0)');
            } else {
                const color = particle.color || '#00ffff';
                const [r, g, b] = this.hexToRgb(color) || [0, 255, 255];
                
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`);
                gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.4)`);
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            }
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
            
            // Particle core
            ctx.fillStyle = particle.threatened && this.settings.showThreats ? 
                '#ff0040' : (particle.color || '#00ffff');
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    updateSystemInfo() {
        setInterval(() => {
            // Update uptime (assuming system started when page loaded)
            const now = Date.now();
            const startTime = this.startTime || now;
            const uptime = now - startTime;
            
            const hours = Math.floor(uptime / (1000 * 60 * 60));
            const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
            
            this.elements.uptime.textContent = 
                `Uptime: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
        
        this.startTime = Date.now();
    }

    toggleConsole() {
        const console = this.elements.console;
        console.classList.toggle('hidden');
        
        const toggleBtn = this.elements.toggleConsole;
        toggleBtn.textContent = console.classList.contains('hidden') ? 'Show' : 'Hide';
    }

    logToConsole(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const colors = {
            info: '#00ffff',
            success: '#00ff41',
            warning: '#ffaa00',
            error: '#ff0040',
            danger: '#ff0040'
        };
        
        const color = colors[type] || colors.info;
        const logEntry = document.createElement('div');
        logEntry.innerHTML = `<span style="color: #6c7293">[${timestamp}]</span> <span style="color: ${color}">${message}</span>`;
        
        this.elements.consoleOutput.appendChild(logEntry);
        this.elements.consoleOutput.scrollTop = this.elements.consoleOutput.scrollHeight;
        
        // Keep only last 100 log entries
        const entries = this.elements.consoleOutput.children;
        if (entries.length > 100) {
            this.elements.consoleOutput.removeChild(entries[0]);
        }
    }

    // Public API methods for external access
    getSystemState() {
        return {
            isAwake: this.isAwake,
            isConnected: this.isConnected,
            particleCount: this.particles.length,
            threatCount: this.threats.length,
            settings: { ...this.settings }
        };
    }

    // Cleanup method
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.websocket) {
            this.websocket.close();
        }
        
        console.log('🛑 STARGUARD Frontend destroyed');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.starguard = new StarguardApp();
    
    console.log('🌟 STARGUARD Frontend loaded and ready');
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.starguard) {
        window.starguard.destroy();
    }
});
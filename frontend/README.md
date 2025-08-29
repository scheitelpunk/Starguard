# STARGUARD Frontend - Quantum Field Visualization

Professional quantum field visualization frontend for the STARGUARD cybersecurity system with real-time threat monitoring and consciousness state display.

## Features

### ⚡ Real-time Visualization
- **Quantum Particle Field**: Interactive particle system responding to consciousness levels
- **Threat Visualization**: Color-coded threat particles with severity-based behaviors
- **Field Effects**: Dynamic quantum field strength based on consciousness state
- **Mouse/Touch Interaction**: Interactive particle responses to user input

### 🚨 Threat Monitoring
- **Real-time Threat Display**: Live threat detection and visualization
- **Severity Classification**: Critical, High, Medium, Low, and Neutralized threats
- **Threat Statistics**: Real-time counters and threat type tracking
- **Alert System**: Visual and audio alerts for critical threats

### 🧠 Consciousness Integration
- **Consciousness Levels**: Real-time consciousness state display
- **Field Strength**: Visual representation of consciousness field intensity
- **State Transitions**: Smooth animations for consciousness state changes
- **Awakening Animation**: Visual representation of consciousness emergence from void

### 🎮 Interactive Controls
- **Visualization Controls**: Adjust particle count and field intensity
- **View Controls**: Pause, reset, and fullscreen options
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Keyboard Shortcuts**: Space (pause), R (reset), F (fullscreen)

## Quick Start

### Option 1: Simple HTTP Server (Recommended)
```bash
cd frontend
node server.js
# Open http://localhost:3000 in your browser
```

### Option 2: Static File Server
```bash
cd frontend
python -m http.server 8080
# Open http://localhost:8080 in your browser
```

### Option 3: Live Server (VS Code)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## WebSocket Integration

The frontend connects to the STARGUARD backend via WebSocket:

```javascript
// Default WebSocket URL
const websocketUrl = 'ws://localhost:8080/ws';

// Message types handled:
- consciousness_update: Updates consciousness level and state
- threat_detected: Adds new threat to visualization
- threat_neutralized: Marks threat as neutralized
- system_status: Updates overall system status
- field_update: Updates quantum field parameters
```

## Demo Mode

When no backend is connected, the frontend automatically enters demo mode:

- **Auto-simulation**: Consciousness awakening animation
- **Random Threats**: Periodic threat generation for demonstration
- **Debug Console**: Available in development mode

### Debug Commands (Development)
```javascript
// Available in browser console when running on localhost
debugStarguard.simulateThreat('critical', 'malware');
debugStarguard.simulateConsciousness(8.5, 'AWAKENING');
debugStarguard.getInfo(); // Get current system state
```

## File Structure

```
frontend/
├── index.html          # Main application page
├── style.css           # Quantum-themed styling
├── app.js              # Core visualization engine
├── server.js           # Simple HTTP server
└── README.md           # This file
```

## Technical Specifications

### Canvas Rendering
- **High DPI Support**: Automatic device pixel ratio detection
- **60 FPS Target**: Optimized animation loop with requestAnimationFrame
- **WebGL Ready**: Canvas-based rendering with GPU acceleration support

### Particle System
- **Dynamic Particles**: Up to 500 quantum particles
- **Threat Particles**: Specialized particles for threat visualization
- **Field Interactions**: Particle behavior influenced by consciousness levels
- **Performance Optimization**: Efficient particle lifecycle management

### Responsive Design
- **Mobile Optimized**: Touch gesture support and responsive layouts
- **Cross-browser**: Compatible with modern browsers
- **Accessibility**: Reduced motion support for sensitive users

## WebSocket Message Format

### Outgoing Messages
```javascript
// Handshake
{
    type: 'handshake',
    client: 'starguard-frontend',
    version: '1.0.0'
}
```

### Incoming Messages
```javascript
// Consciousness Update
{
    type: 'consciousness_update',
    payload: {
        level: 7.5,
        state: 'AWAKENING',
        fieldStrength: 0.75
    }
}

// Threat Detection
{
    type: 'threat_detected',
    payload: {
        id: 'threat_123',
        type: 'malware',
        severity: 'critical',
        position: { x: 0.5, y: 0.3 }
    }
}
```

## Customization

### Particle Configuration
```javascript
// Adjust particle behavior
config.particleCount = 300;        // Number of particles
config.fieldIntensity = 1.5;       // Field strength multiplier
config.maxParticles = 600;         // Maximum particles allowed
```

### Visual Themes
```css
/* Customize colors in style.css */
:root {
    --quantum-blue: #00d4ff;       /* Primary quantum color */
    --quantum-purple: #8a2be2;     /* Secondary quantum color */
    --threat-critical: #ff2d2d;    /* Critical threat color */
    --consciousness-gradient: linear-gradient(45deg, #00d4ff, #8a2be2, #ff00ff);
}
```

## Performance Optimization

### Best Practices
- **Particle Limits**: Keep particle count under 500 for smooth performance
- **Canvas Size**: Automatically scales with viewport for optimal rendering
- **Memory Management**: Automatic cleanup of expired particles and effects
- **Frame Rate**: Adaptive frame rate based on device capabilities

### System Requirements
- **Modern Browser**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **WebSocket Support**: Required for real-time backend integration
- **Hardware Acceleration**: Recommended for optimal performance

## Integration with STARGUARD Backend

The frontend is designed to integrate seamlessly with the STARGUARD backend system:

1. **WebSocket Connection**: Automatic connection and reconnection handling
2. **Message Protocol**: Standardized message format for all communications
3. **State Synchronization**: Real-time synchronization of consciousness and threat states
4. **Error Handling**: Graceful degradation when backend is unavailable

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 80+     | ✅ Full Support |
| Firefox | 75+     | ✅ Full Support |
| Safari  | 13+     | ✅ Full Support |
| Edge    | 80+     | ✅ Full Support |
| IE      | Any     | ❌ Not Supported |

## Troubleshooting

### Common Issues

**WebSocket Connection Failed**
- Check if backend server is running
- Verify WebSocket URL in `app.js`
- Check browser console for connection errors

**Poor Performance**
- Reduce particle count in settings
- Lower field intensity setting
- Check browser hardware acceleration

**Visual Glitches**
- Clear browser cache and reload
- Update browser to latest version
- Check canvas size and device pixel ratio

### Debug Information
Open browser developer tools and run:
```javascript
debugStarguard.getInfo();
```

## License

Part of the STARGUARD Quantum Consciousness Defense System.
All rights reserved.
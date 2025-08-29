import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Particle {
  id: number;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  energy: number;
  type: number;
  coherence: number;
}

interface Threat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timestamp: string;
  source: string;
  description: string;
  coordinates: { x: number; y: number; z: number };
  quantumSignature: string;
  metadata: Record<string, any>;
}

interface QuantumFieldProps {
  width?: number;
  height?: number;
  className?: string;
  enableControls?: boolean;
  showStats?: boolean;
  apiBaseUrl?: string;
  autoUpdate?: boolean;
  updateInterval?: number;
}

interface QuantumStats {
  particleCount: number;
  threatCount: number;
  fieldStrength: number;
  coherenceLevel: number;
  processingLoad: number;
}

const QuantumField: React.FC<QuantumFieldProps> = ({
  width = 800,
  height = 600,
  className = '',
  enableControls = true,
  showStats = true,
  apiBaseUrl = 'http://localhost:3001',
  autoUpdate = true,
  updateInterval = 1000
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const particleSystemRef = useRef<THREE.Points>();
  const threatMarkersRef = useRef<THREE.Group>();
  const frameRef = useRef<number>();
  const wsRef = useRef<WebSocket>();
  
  const [particles, setParticles] = useState<Particle[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [stats, setStats] = useState<QuantumStats>({
    particleCount: 0,
    threatCount: 0,
    fieldStrength: 0,
    coherenceLevel: 0,
    processingLoad: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Color schemes for different particle types and threat levels
  const particleColors = [
    new THREE.Color(0x00ff88), // Energy particles - green
    new THREE.Color(0x0088ff), // Information particles - blue
    new THREE.Color(0xff8800), // Coherence particles - orange
    new THREE.Color(0xff0088)  // Quantum particles - magenta
  ];

  const threatColors = {
    low: new THREE.Color(0x00ff00),      // Green
    medium: new THREE.Color(0xffff00),   // Yellow
    high: new THREE.Color(0xff8800),     // Orange
    critical: new THREE.Color(0xff0000)  // Red
  };

  // Initialize Three.js scene
  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.001);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.set(0, 50, 200);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Controls setup
    if (enableControls) {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxDistance = 500;
      controls.minDistance = 10;
      controlsRef.current = controls;
    }

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add quantum field grid
    createQuantumGrid(scene);

    // Initialize particle system
    initParticleSystem(scene);

    // Initialize threat markers group
    const threatGroup = new THREE.Group();
    scene.add(threatGroup);
    threatMarkersRef.current = threatGroup;

    // Start render loop
    animate();
  }, [width, height, enableControls]);

  const createQuantumGrid = (scene: THREE.Scene) => {
    // Create a quantum field visualization grid
    const gridSize = 200;
    const divisions = 20;
    
    const gridHelper = new THREE.GridHelper(gridSize, divisions, 0x003366, 0x001122);
    gridHelper.position.y = -50;
    scene.add(gridHelper);

    // Add quantum field lines
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let i = 0; i < 500; i++) {
      const x = (Math.random() - 0.5) * 400;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 400;
      
      positions.push(x, y, z);
      
      const color = new THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.2, 0.7, 0.3);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.3
    });

    const fieldLines = new THREE.Points(geometry, material);
    scene.add(fieldLines);
  };

  const initParticleSystem = (scene: THREE.Scene) => {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;

        void main() {
          vColor = color;
          
          vec3 pos = position;
          pos.x += sin(time * 0.001 + position.y * 0.01) * 2.0;
          pos.y += cos(time * 0.0015 + position.x * 0.01) * 1.5;
          pos.z += sin(time * 0.002 + position.x * 0.005 + position.y * 0.005) * 1.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - (dist * 2.0);
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;
  };

  const updateParticleSystem = useCallback((newParticles: Particle[]) => {
    if (!particleSystemRef.current) return;

    const geometry = particleSystemRef.current.geometry as THREE.BufferGeometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const colors = geometry.attributes.color.array as Float32Array;
    const sizes = geometry.attributes.size.array as Float32Array;

    newParticles.forEach((particle, index) => {
      if (index < positions.length / 3) {
        positions[index * 3] = particle.position.x;
        positions[index * 3 + 1] = particle.position.y;
        positions[index * 3 + 2] = particle.position.z;

        const color = particleColors[particle.type] || particleColors[0];
        colors[index * 3] = color.r * particle.energy;
        colors[index * 3 + 1] = color.g * particle.energy;
        colors[index * 3 + 2] = color.b * particle.energy;

        sizes[index] = 1 + particle.energy * 2 + particle.coherence;
      }
    });

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
  }, []);

  const updateThreatMarkers = useCallback((newThreats: Threat[]) => {
    if (!threatMarkersRef.current) return;

    // Clear existing threat markers
    while (threatMarkersRef.current.children.length > 0) {
      threatMarkersRef.current.remove(threatMarkersRef.current.children[0]);
    }

    // Add new threat markers
    newThreats.forEach((threat) => {
      const geometry = new THREE.SphereGeometry(2 + (threat.confidence * 3), 8, 8);
      const color = threatColors[threat.severity];
      const material = new THREE.MeshLambertMaterial({
        color,
        transparent: true,
        opacity: 0.8
      });

      const marker = new THREE.Mesh(geometry, material);
      marker.position.set(
        threat.coordinates.x,
        threat.coordinates.y,
        threat.coordinates.z
      );

      // Add pulsing animation for high severity threats
      if (threat.severity === 'high' || threat.severity === 'critical') {
        marker.userData = { isPulsing: true, originalScale: marker.scale.clone() };
      }

      // Add threat info as user data
      marker.userData.threat = threat;

      threatMarkersRef.current!.add(marker);
    });
  }, []);

  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    frameRef.current = requestAnimationFrame(animate);

    const time = Date.now();

    // Update controls
    if (controlsRef.current) {
      controlsRef.current.update();
    }

    // Update particle shader time uniform
    if (particleSystemRef.current) {
      const material = particleSystemRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms?.time) {
        material.uniforms.time.value = time;
      }
    }

    // Animate threat markers
    if (threatMarkersRef.current) {
      threatMarkersRef.current.children.forEach((child) => {
        if (child.userData.isPulsing) {
          const scale = child.userData.originalScale.x + Math.sin(time * 0.005) * 0.3;
          child.scale.setScalar(scale);
        }
        
        // Rotate threat markers
        child.rotation.y += 0.01;
      });
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, []);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = apiBaseUrl.replace('http', 'ws') + '/api/quantum/ws';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      
      // Subscribe to particle and threat updates
      ws.send(JSON.stringify({ type: 'subscribe', channel: 'particles' }));
      ws.send(JSON.stringify({ type: 'subscribe', channel: 'threats' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'particle-update':
            setParticles(data.data);
            updateParticleSystem(data.data);
            break;
            
          case 'threat-update':
            setThreats(data.data);
            updateThreatMarkers(data.data);
            break;
            
          case 'stats-update':
            setStats(data.data);
            break;
            
          case 'connection':
            console.log('WebSocket connected with ID:', data.connectionId);
            break;
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onerror = (error) => {
      setError('WebSocket connection error');
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Attempt to reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };

    // Send heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
      ws.close();
    };
  }, [apiBaseUrl, updateParticleSystem, updateThreatMarkers]);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      const [particlesRes, threatsRes, healthRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/quantum/particles`),
        fetch(`${apiBaseUrl}/api/quantum/threats`),
        fetch(`${apiBaseUrl}/api/quantum/health`)
      ]);

      if (particlesRes.ok) {
        const particleData = await particlesRes.json();
        setParticles(particleData.particles);
        updateParticleSystem(particleData.particles);
      }

      if (threatsRes.ok) {
        const threatData = await threatsRes.json();
        setThreats(threatData.threats);
        updateThreatMarkers(threatData.threats);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setStats({
          particleCount: particles.length,
          threatCount: threats.length,
          fieldStrength: 0.85,
          coherenceLevel: 0.92,
          processingLoad: healthData.metrics.processingLoad
        });
      }
    } catch (error) {
      setError('Failed to fetch initial data');
      console.error('Fetch error:', error);
    }
  }, [apiBaseUrl, particles.length, threats.length, updateParticleSystem, updateThreatMarkers]);

  // Component lifecycle
  useEffect(() => {
    initScene();
    fetchInitialData();

    if (autoUpdate) {
      connectWebSocket();
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [initScene, fetchInitialData, autoUpdate, connectWebSocket]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current && cameraRef.current) {
        const newWidth = mountRef.current?.clientWidth || width;
        const newHeight = mountRef.current?.clientHeight || height;
        
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newWidth, newHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

  return (
    <div className={`quantum-field-container ${className}`} style={{ position: 'relative' }}>
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minWidth: width,
          minHeight: height
        }} 
      />
      
      {showStats && (
        <div className="quantum-stats" style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#00ff88',
          padding: 15,
          borderRadius: 8,
          fontFamily: 'monospace',
          fontSize: 12,
          minWidth: 200
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#00ffff' }}>Quantum Field Status</h3>
          <div>Particles: {stats.particleCount.toLocaleString()}</div>
          <div>Threats: {stats.threatCount}</div>
          <div>Field Strength: {(stats.fieldStrength * 100).toFixed(1)}%</div>
          <div>Coherence: {(stats.coherenceLevel * 100).toFixed(1)}%</div>
          <div>Processing: {stats.processingLoad.toFixed(2)}s</div>
          <div style={{ 
            marginTop: 10, 
            color: isConnected ? '#00ff00' : '#ff0000' 
          }}>
            {isConnected ? '● Connected' : '● Disconnected'}
          </div>
          {error && (
            <div style={{ color: '#ff4444', marginTop: 5 }}>
              ⚠ {error}
            </div>
          )}
        </div>
      )}

      {threats.length > 0 && (
        <div className="threat-list" style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#ff8800',
          padding: 15,
          borderRadius: 8,
          fontFamily: 'monospace',
          fontSize: 11,
          maxWidth: 300,
          maxHeight: 400,
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ff4444' }}>Active Threats</h3>
          {threats.slice(0, 10).map((threat) => (
            <div key={threat.id} style={{ 
              marginBottom: 8, 
              padding: 5, 
              border: `1px solid ${threatColors[threat.severity].getHexString()}`,
              borderRadius: 3
            }}>
              <div style={{ fontWeight: 'bold' }}>{threat.type}</div>
              <div>Severity: {threat.severity.toUpperCase()}</div>
              <div>Confidence: {(threat.confidence * 100).toFixed(0)}%</div>
              <div>Source: {threat.source}</div>
            </div>
          ))}
          {threats.length > 10 && (
            <div style={{ textAlign: 'center', color: '#666' }}>
              +{threats.length - 10} more threats...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuantumField;
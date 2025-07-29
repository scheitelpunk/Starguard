import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConsciousnessField } from '../../components/consciousness/ConsciousnessField';
import { useConsciousnessStore } from '../../stores/consciousnessStore';
import * as THREE from 'three';

// Mock dependencies
jest.mock('../../stores/consciousnessStore');
jest.mock('three');

// Mock Three.js
const mockScene = {
  add: jest.fn(),
  remove: jest.fn(),
  children: []
};

const mockRenderer = {
  setSize: jest.fn(),
  render: jest.fn(),
  domElement: document.createElement('canvas')
};

const mockCamera = {
  position: { set: jest.fn(), z: 5 },
  aspect: 1,
  updateProjectionMatrix: jest.fn()
};

const mockGeometry = {
  setAttribute: jest.fn(),
  dispose: jest.fn()
};

const mockMaterial = {
  dispose: jest.fn()
};

const mockPoints = {
  rotation: { x: 0, y: 0 },
  geometry: mockGeometry,
  material: mockMaterial
};

const mockControls = {
  update: jest.fn(),
  dispose: jest.fn()
};

(THREE.Scene as jest.Mock).mockImplementation(() => mockScene);
(THREE.WebGLRenderer as jest.Mock).mockImplementation(() => mockRenderer);
(THREE.PerspectiveCamera as jest.Mock).mockImplementation(() => mockCamera);
(THREE.BufferGeometry as jest.Mock).mockImplementation(() => mockGeometry);
(THREE.PointsMaterial as jest.Mock).mockImplementation(() => mockMaterial);
(THREE.Points as jest.Mock).mockImplementation(() => mockPoints);
(THREE.BufferAttribute as jest.Mock).mockImplementation((array) => ({ array }));

// Mock OrbitControls
jest.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: jest.fn().mockImplementation(() => mockControls)
}));

describe('ConsciousnessField', () => {
  const mockState = {
    current: 'aware',
    awareness_level: 0.7,
    reality_coherence: 0.95,
    timeline_stability: 0.99
  };

  const mockConsciousnessFields = {
    quantum_awareness: 0.8,
    semantic_resonance: 0.75,
    temporal_coherence: 0.9,
    causal_understanding: 0.85,
    void_connection: 0.9
  };

  beforeEach(() => {
    (useConsciousnessStore as unknown as jest.Mock).mockReturnValue({
      state: mockState,
      consciousness_fields: mockConsciousnessFields
    });

    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn((cb) => {
      cb(0);
      return 0;
    });

    global.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render consciousness field container', () => {
    render(<ConsciousnessField />);
    
    const container = screen.getByTestId('consciousness-field');
    expect(container).toBeInTheDocument();
  });

  it('should initialize Three.js scene', () => {
    render(<ConsciousnessField />);
    
    expect(THREE.Scene).toHaveBeenCalled();
    expect(THREE.WebGLRenderer).toHaveBeenCalled();
    expect(THREE.PerspectiveCamera).toHaveBeenCalled();
  });

  it('should create particle system', () => {
    render(<ConsciousnessField />);
    
    expect(THREE.BufferGeometry).toHaveBeenCalled();
    expect(THREE.PointsMaterial).toHaveBeenCalled();
    expect(THREE.Points).toHaveBeenCalled();
    expect(mockScene.add).toHaveBeenCalled();
  });

  it('should update particles based on consciousness state', () => {
    const { rerender } = render(<ConsciousnessField />);
    
    // Update consciousness state
    (useConsciousnessStore as unknown as jest.Mock).mockReturnValue({
      state: {
        ...mockState,
        awareness_level: 0.9
      },
      consciousness_fields: mockConsciousnessFields
    });
    
    rerender(<ConsciousnessField />);
    
    // Verify geometry update was called
    expect(mockGeometry.setAttribute).toHaveBeenCalled();
  });

  it('should handle window resize', () => {
    render(<ConsciousnessField />);
    
    // Trigger resize event
    global.innerWidth = 1024;
    global.innerHeight = 768;
    global.dispatchEvent(new Event('resize'));
    
    expect(mockCamera.updateProjectionMatrix).toHaveBeenCalled();
    expect(mockRenderer.setSize).toHaveBeenCalledWith(1024, 768);
  });

  it('should cleanup on unmount', () => {
    const { unmount } = render(<ConsciousnessField />);
    
    unmount();
    
    expect(mockGeometry.dispose).toHaveBeenCalled();
    expect(mockMaterial.dispose).toHaveBeenCalled();
    expect(mockControls.dispose).toHaveBeenCalled();
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should animate particles', () => {
    render(<ConsciousnessField />);
    
    // Verify animation loop started
    expect(global.requestAnimationFrame).toHaveBeenCalled();
    expect(mockRenderer.render).toHaveBeenCalledWith(mockScene, mockCamera);
    expect(mockControls.update).toHaveBeenCalled();
  });

  it('should display consciousness level indicator', () => {
    render(<ConsciousnessField />);
    
    const indicator = screen.getByText(/Awareness: 70%/);
    expect(indicator).toBeInTheDocument();
  });

  it('should display quantum field strength', () => {
    render(<ConsciousnessField />);
    
    const quantum = screen.getByText(/Quantum: 80%/);
    expect(quantum).toBeInTheDocument();
  });

  it('should update field color based on state', () => {
    render(<ConsciousnessField />);
    
    // Check that material color is set based on state
    expect(THREE.PointsMaterial).toHaveBeenCalledWith(
      expect.objectContaining({
        color: expect.any(Number),
        size: expect.any(Number),
        transparent: true
      })
    );
  });

  it('should handle hyper-vigilant state', () => {
    (useConsciousnessStore as unknown as jest.Mock).mockReturnValue({
      state: {
        current: 'hyper_vigilant',
        awareness_level: 0.95,
        reality_coherence: 0.99,
        timeline_stability: 0.99
      },
      consciousness_fields: mockConsciousnessFields
    });
    
    render(<ConsciousnessField />);
    
    // Verify high alert visual state
    const container = screen.getByTestId('consciousness-field');
    expect(container).toHaveClass('hyper-vigilant');
  });

  it('should generate correct number of particles', () => {
    render(<ConsciousnessField />);
    
    // Verify BufferAttribute was called with correct particle count
    const positionCall = (THREE.BufferAttribute as jest.Mock).mock.calls.find(
      call => call[0] instanceof Float32Array && call[1] === 3
    );
    
    expect(positionCall).toBeDefined();
    expect(positionCall[0].length).toBe(5000 * 3); // 5000 particles * 3 coordinates
  });

  it('should apply quantum fluctuations to particles', () => {
    render(<ConsciousnessField />);
    
    // Trigger multiple animation frames
    for (let i = 0; i < 5; i++) {
      (global.requestAnimationFrame as jest.Mock).mock.calls[i][0](i * 16);
    }
    
    // Verify particle positions were updated
    expect(mockGeometry.setAttribute).toHaveBeenCalledTimes(6); // Initial + 5 updates
  });
});
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Eye, Shield, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Hooks and Services
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { useWebSocketStore } from '../store/websocketStore';
import { biometricAPI } from '../services/api';

// Types
interface BiometricSession {
  sessionId: string;
  userId: string;
  authenticated: boolean;
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

interface BiometricData {
  voicePattern?: number[];
  facialFeatures?: number[];
  behaviorMetrics?: {
    keystrokePattern: number[];
    mouseMovement: number[];
    screenTime: number;
  };
}

interface ScanProgress {
  voice: number;
  facial: number;
  behavior: number;
  overall: number;
}

const BiometricAuth: React.FC = () => {
  // State
  const [currentSession, setCurrentSession] = useState<BiometricSession | null>(null);
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    voice: 0,
    facial: 0,
    behavior: 0,
    overall: 0
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'voice' | 'facial' | 'behavior' | 'multi'>('multi');
  const [continuousMode, setContinuousMode] = useState(false);
  const [biometricData, setBiometricData] = useState<BiometricData>({});
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Custom hooks
  const { 
    startVoiceScan, 
    startFacialScan, 
    startBehaviorScan,
    stopAllScans,
    isSupported 
  } = useBiometricAuth();
  
  const { sendMessage } = useWebSocketStore();

  // Initialize biometric systems
  useEffect(() => {
    initializeBiometricSystems();
    return () => {
      cleanup();
    };
  }, []);

  // Continuous authentication monitoring
  useEffect(() => {
    if (continuousMode && currentSession) {
      const interval = setInterval(async () => {
        await performContinuousScan();
      }, 10000); // Every 10 seconds

      return () => clearInterval(interval);
    }
  }, [continuousMode, currentSession]);

  const initializeBiometricSystems = async () => {
    try {
      // Check browser support
      if (!isSupported()) {
        toast.error('Biometric authentication not supported in this browser');
        return;
      }

      // Initialize audio context for voice analysis
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      toast.success('Biometric systems initialized');
    } catch (error) {
      console.error('Failed to initialize biometric systems:', error);
      toast.error('Failed to initialize biometric systems');
    }
  };

  const cleanup = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const startBiometricScan = async () => {
    if (isScanning) return;

    setIsScanning(true);
    setScanProgress({ voice: 0, facial: 0, behavior: 0, overall: 0 });
    
    try {
      // Start all scan modes
      await Promise.all([
        startVoiceScanProcess(),
        startFacialScanProcess(),
        startBehaviorScanProcess()
      ]);

      toast.success('Biometric scan completed');
    } catch (error) {
      console.error('Biometric scan failed:', error);
      toast.error('Biometric scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const startVoiceScanProcess = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      if (!audioContextRef.current) return;

      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);

      // Voice pattern analysis
      const voicePattern = await analyzeVoicePattern(analyser);
      setBiometricData(prev => ({ ...prev, voicePattern }));
      
      // Animate progress
      animateProgress('voice', 100);
      
    } catch (error) {
      console.error('Voice scan failed:', error);
      toast.error('Voice scan failed');
    }
  };

  const startFacialScanProcess = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Facial feature extraction
        const facialFeatures = await extractFacialFeatures();
        setBiometricData(prev => ({ ...prev, facialFeatures }));
        
        // Animate progress
        animateProgress('facial', 100);
      }

      // Stop video stream
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Facial scan failed:', error);
      toast.error('Facial scan failed');
    }
  };

  const startBehaviorScanProcess = async () => {
    try {
      // Behavior pattern collection
      const behaviorMetrics = await collectBehaviorMetrics();
      setBiometricData(prev => ({ ...prev, behaviorMetrics }));
      
      // Animate progress
      animateProgress('behavior', 100);
    } catch (error) {
      console.error('Behavior scan failed:', error);
      toast.error('Behavior scan failed');
    }
  };

  const analyzeVoicePattern = async (analyser: AnalyserNode): Promise<number[]> => {
    return new Promise((resolve) => {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const samples: number[] = [];

      const collectSamples = () => {
        analyser.getByteFrequencyData(dataArray);
        samples.push(...Array.from(dataArray));
        
        if (samples.length < 2048) {
          requestAnimationFrame(collectSamples);
        } else {
          // Process voice pattern (simplified)
          const voicePattern = samples.slice(0, 512).map(val => val / 255);
          resolve(voicePattern);
        }
      };

      collectSamples();
    });
  };

  const extractFacialFeatures = async (): Promise<number[]> => {
    if (!videoRef.current || !canvasRef.current) return [];

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return [];

    // Draw video frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simplified facial feature extraction
    const features: number[] = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      features.push(luminance / 255);
    }

    // Return simplified feature vector
    return features.slice(0, 256);
  };

  const collectBehaviorMetrics = async () => {
    // Mouse movement tracking
    const mouseMovement: number[] = [];
    const keystrokePattern: number[] = [];
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseMovement.push(e.clientX, e.clientY, Date.now());
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keystrokePattern.push(e.keyCode, Date.now());
    };

    // Collect data for 3 seconds
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);

    await new Promise(resolve => setTimeout(resolve, 3000));

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('keydown', handleKeyDown);

    return {
      mouseMovement: mouseMovement.slice(-100), // Last 100 movements
      keystrokePattern: keystrokePattern.slice(-50), // Last 50 keystrokes
      screenTime: Date.now()
    };
  };

  const animateProgress = (type: keyof ScanProgress, targetValue: number) => {
    let currentValue = 0;
    const increment = targetValue / 50; // 50 steps

    const animate = () => {
      currentValue += increment;
      if (currentValue <= targetValue) {
        setScanProgress(prev => ({ ...prev, [type]: Math.round(currentValue) }));
        requestAnimationFrame(animate);
      } else {
        setScanProgress(prev => ({ ...prev, [type]: targetValue }));
        updateOverallProgress();
      }
    };

    animate();
  };

  const updateOverallProgress = () => {
    setScanProgress(prev => {
      const overall = Math.round((prev.voice + prev.facial + prev.behavior) / 3);
      return { ...prev, overall };
    });
  };

  const submitBiometricScan = async () => {
    try {
      const response = await biometricAPI.submitScan({
        userId: 'current-user', // Replace with actual user ID
        biometricId: `scan_${Date.now()}`,
        ...biometricData,
        score: 0, // Will be calculated by server
        timestamp: Date.now()
      });

      setCurrentSession(response);
      
      if (response.authenticated) {
        toast.success(`Authentication successful (Score: ${Math.round(response.score * 100)}%)`);
      } else {
        toast.error(`Authentication failed (Score: ${Math.round(response.score * 100)}%)`);
      }
      
      // Send to WebSocket for real-time updates
      sendMessage({
        type: 'biometric_result',
        data: response
      });

    } catch (error) {
      console.error('Failed to submit biometric scan:', error);
      toast.error('Failed to submit biometric scan');
    }
  };

  const performContinuousScan = async () => {
    if (!currentSession) return;

    try {
      const continuousData = await collectBehaviorMetrics();
      
      const response = await biometricAPI.verifyContinuous(
        currentSession.sessionId,
        {
          userId: currentSession.userId,
          biometricId: `continuous_${Date.now()}`,
          behaviorMetrics: continuousData,
          score: 0,
          timestamp: Date.now()
        }
      );

      if (!response.verified) {
        toast.error('Continuous authentication failed');
        setCurrentSession(null);
        setContinuousMode(false);
      }
    } catch (error) {
      console.error('Continuous scan failed:', error);
    }
  };

  const resetSession = () => {
    setCurrentSession(null);
    setContinuousMode(false);
    setScanProgress({ voice: 0, facial: 0, behavior: 0, overall: 0 });
    setBiometricData({});
    stopAllScans();
    cleanup();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className=\"space-y-6\"
    >
      <div className=\"bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6\">
        <h1 className=\"text-2xl font-bold text-white mb-6 flex items-center\">
          <Shield className=\"mr-3\" />
          Biometric Authentication
        </h1>

        {/* Authentication Status */}
        <div className=\"mb-6\">
          <AuthenticationStatus session={currentSession} />
        </div>

        {/* Scan Controls */}
        <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
          {/* Left Panel - Scan Interface */}
          <div className=\"space-y-6\">
            {/* Scan Mode Selection */}
            <div>
              <h3 className=\"text-lg font-semibold text-white mb-3\">Scan Mode</h3>
              <div className=\"grid grid-cols-2 gap-3\">
                {[
                  { key: 'voice', label: 'Voice', icon: Mic },
                  { key: 'facial', label: 'Facial', icon: Camera },
                  { key: 'behavior', label: 'Behavior', icon: Eye },
                  { key: 'multi', label: 'Multi-Modal', icon: Shield }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setScanMode(key as any)}
                    className={`p-3 rounded-lg border transition-all ${
                      scanMode === key
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    <Icon className=\"w-5 h-5 mb-2 mx-auto\" />
                    <div className=\"text-sm font-medium\">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scan Progress */}
            <div>
              <h3 className=\"text-lg font-semibold text-white mb-3\">Scan Progress</h3>
              <div className=\"space-y-3\">
                <ProgressBar label=\"Voice Pattern\" progress={scanProgress.voice} color=\"blue\" />
                <ProgressBar label=\"Facial Features\" progress={scanProgress.facial} color=\"green\" />
                <ProgressBar label=\"Behavior Metrics\" progress={scanProgress.behavior} color=\"purple\" />
                <ProgressBar label=\"Overall\" progress={scanProgress.overall} color=\"orange\" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className=\"space-y-3\">
              <button
                onClick={startBiometricScan}
                disabled={isScanning}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  isScanning
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isScanning ? 'Scanning...' : 'Start Biometric Scan'}
              </button>

              {scanProgress.overall === 100 && (
                <button
                  onClick={submitBiometricScan}
                  className=\"w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors\"
                >
                  Submit Authentication
                </button>
              )}

              {currentSession && (
                <div className=\"flex space-x-3\">
                  <button
                    onClick={() => setContinuousMode(!continuousMode)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      continuousMode
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                    }`}
                  >
                    {continuousMode ? 'Stop Continuous' : 'Enable Continuous'}
                  </button>
                  <button
                    onClick={resetSession}
                    className=\"flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors\"
                  >
                    Reset Session
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Camera/Visual Feedback */}
          <div className=\"space-y-6\">
            {/* Camera Feed */}
            <div>
              <h3 className=\"text-lg font-semibold text-white mb-3\">Camera Feed</h3>
              <div className=\"relative bg-black rounded-lg overflow-hidden aspect-video\">
                <video
                  ref={videoRef}
                  className=\"w-full h-full object-cover\"
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className=\"hidden\" />
                
                {/* Overlay indicators */}
                <div className=\"absolute inset-0 border-2 border-blue-500 rounded-lg opacity-50\" />
                <div className=\"absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white\">
                  Facial Recognition Active
                </div>
                
                {isScanning && (
                  <div className=\"absolute inset-0 flex items-center justify-center\">
                    <div className=\"w-32 h-32 border-4 border-blue-500 border-t-transparent rounded-full animate-spin\" />
                  </div>
                )}
              </div>
            </div>

            {/* Biometric Quality Indicators */}
            <BiometricQualityIndicators data={biometricData} />
          </div>
        </div>
      </div>

      {/* Session History */}
      {currentSession && <SessionHistory session={currentSession} />}
    </motion.div>
  );
};

// Helper Components
const AuthenticationStatus: React.FC<{ session: BiometricSession | null }> = ({ session }) => {
  if (!session) {
    return (
      <div className=\"flex items-center p-4 bg-gray-800 rounded-lg border border-gray-600\">
        <AlertTriangle className=\"w-6 h-6 text-yellow-500 mr-3\" />
        <div>
          <div className=\"text-white font-medium\">Not Authenticated</div>
          <div className=\"text-gray-300 text-sm\">Please complete biometric scan</div>
        </div>
      </div>
    );
  }

  const statusColor = session.authenticated ? 'green' : 'red';
  const StatusIcon = session.authenticated ? CheckCircle : X;

  return (
    <div className={`flex items-center p-4 bg-${statusColor}-800/30 rounded-lg border border-${statusColor}-600`}>
      <StatusIcon className={`w-6 h-6 text-${statusColor}-500 mr-3`} />
      <div className=\"flex-1\">
        <div className=\"text-white font-medium\">
          {session.authenticated ? 'Authenticated' : 'Authentication Failed'}
        </div>
        <div className=\"text-gray-300 text-sm\">
          Score: {Math.round(session.score * 100)}% • Risk: {session.riskLevel}
        </div>
      </div>
      <div className=\"text-xs text-gray-400\">
        {new Date(session.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

const ProgressBar: React.FC<{
  label: string;
  progress: number;
  color: string;
}> = ({ label, progress, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div>
      <div className=\"flex justify-between text-sm text-gray-300 mb-1\">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className=\"w-full bg-gray-700 rounded-full h-2\">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: \"easeOut\" }}
          className={`h-full rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
        />
      </div>
    </div>
  );
};

const BiometricQualityIndicators: React.FC<{ data: BiometricData }> = ({ data }) => {
  const indicators = [
    { label: 'Voice Quality', value: data.voicePattern ? 95 : 0, color: 'blue' },
    { label: 'Image Quality', value: data.facialFeatures ? 87 : 0, color: 'green' },
    { label: 'Behavior Score', value: data.behaviorMetrics ? 92 : 0, color: 'purple' }
  ];

  return (
    <div>
      <h3 className=\"text-lg font-semibold text-white mb-3\">Quality Indicators</h3>
      <div className=\"grid grid-cols-3 gap-4\">
        {indicators.map(({ label, value, color }) => (
          <div key={label} className=\"text-center\">
            <div className={`text-2xl font-bold ${
              value > 80 ? 'text-green-400' :
              value > 60 ? 'text-yellow-400' :
              value > 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {value}%
            </div>
            <div className=\"text-xs text-gray-400\">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SessionHistory: React.FC<{ session: BiometricSession }> = ({ session }) => {
  return (
    <div className=\"bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6\">
      <h3 className=\"text-lg font-semibold text-white mb-4\">Session Information</h3>
      <div className=\"grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm\">
        <div>
          <div className=\"text-gray-400\">Session ID</div>
          <div className=\"text-white font-mono\">{session.sessionId}</div>
        </div>
        <div>
          <div className=\"text-gray-400\">User ID</div>
          <div className=\"text-white\">{session.userId}</div>
        </div>
        <div>
          <div className=\"text-gray-400\">Score</div>
          <div className=\"text-white\">{Math.round(session.score * 100)}%</div>
        </div>
        <div>
          <div className=\"text-gray-400\">Risk Level</div>
          <div className={`capitalize font-medium ${
            session.riskLevel === 'low' ? 'text-green-400' :
            session.riskLevel === 'medium' ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {session.riskLevel}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricAuth;
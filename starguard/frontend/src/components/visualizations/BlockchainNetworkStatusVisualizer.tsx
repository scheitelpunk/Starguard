/**
 * STARGUARD Blockchain Network Status Visualizer
 * 
 * Eine hochentwickelte 3D-Visualisierung des Blockchain-Netzwerks
 * für immutable Threat Intelligence Sharing mit Real-time Network
 * Monitoring und Consensus Mechanism Visualization.
 * 
 * Features:
 * - Real-time Blockchain Network Topology
 * - Proof-of-Consciousness Consensus Visualization
 * - Smart Contract Execution Monitoring
 * - Transaction Flow Analysis
 * - Network Health and Performance Metrics
 * - Cryptocurrency Mining Visualization
 * - Cross-chain Interoperability Display
 * - Quantum Security Status
 * 
 * @author STARGUARD Blockchain Visualization Team
 * @version 2.0.0
 * @classification BLOCKCHAIN_NETWORK_VISUALIZATION
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats, Text, Html, Line, Sphere, Box } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { EffectComposer, Bloom, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import { BlockchainThreatIntelligence } from '../../../services/BlockchainThreatIntelligence';
import { WebSocketService } from '../../../services/WebSocketService';
import './BlockchainNetworkStatusVisualizer.css';

interface BlockchainNode {
  id: string;
  nodeType: 'MINER' | 'VALIDATOR' | 'CONSCIOUSNESS_NODE' | 'SMART_CONTRACT' | 'GATEWAY';
  position: [number, number, number];
  networkAddress: string;
  stakingPower: number;
  consciousnessLevel: number;
  hashRate: number; // H/s
  blocksMined: number;
  connectionCount: number;
  reputation: number;
  quantumSecurity: QuantumSecurityStatus;
  uptime: number;
  geographicLocation: [number, number]; // [lat, lng]
}

interface QuantumSecurityStatus {
  quantumResistance: number;
  postQuantumAlgorithms: string[];
  quantumKeyDistribution: boolean;
  quantumRandomness: number;
}

interface BlockchainBlock {
  blockHash: string;
  blockNumber: number;
  timestamp: Date;
  miner: string;
  transactionCount: number;
  blockSize: number; // bytes
  difficulty: number;
  gasUsed: number;
  gasLimit: number;
  consciousnessSignature: ConsciousnessSignature;
  quantumProof: QuantumProof;
  threatIntelligenceData: ThreatIntelligenceTransaction[];
}

interface ConsciousnessSignature {
  awarenessHash: string;
  coherenceProof: number;
  fieldSignature: string;
  consciousnessLevel: number;
}

interface QuantumProof {
  quantumRandomness: string;
  bellStateProof: string;
  nonlocalityVerification: number;
  quantumEntanglementHash: string;
}

interface ThreatIntelligenceTransaction {
  id: string;
  transactionType: 'THREAT_REPORT' | 'INTELLIGENCE_SHARE' | 'CONSENSUS_VOTE' | 'SMART_CONTRACT_EXECUTION';
  threatData: any;
  reputation_stake: number;
  verification_nodes: string[];
  consensus_score: number;
}

interface SmartContract {
  id: string;
  contractAddress: string;
  contractType: 'THREAT_VERIFICATION' | 'REPUTATION_MANAGEMENT' | 'AUTOMATED_RESPONSE' | 'CONSENSUS_ORACLE';
  executionCount: number;
  gasConsumption: number;
  consciousnessRequirement: number;
  codeHash: string;
  deploymentBlock: number;
  isActive: boolean;
}

interface Transaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  transactionType: 'THREAT_INTEL' | 'CONSENSUS_VOTE' | 'SMART_CONTRACT' | 'MINING_REWARD';
  value: number;
  gasPrice: number;
  timestamp: Date;
  confirmations: number;
  consciousnessVerified: boolean;
  quantumSigned: boolean;
}

interface NetworkMetrics {
  totalNodes: number;
  activeMiners: number;
  networkHashRate: number;
  currentDifficulty: number;
  averageBlockTime: number; // seconds
  transactionThroughput: number; // TPS
  networkLatency: number; // ms
  consciousnessCoherence: number;
  quantumSecurityLevel: number;
  decentralizationIndex: number;
}

interface BlockchainNetworkData {
  nodes: BlockchainNode[];
  recentBlocks: BlockchainBlock[];
  pendingTransactions: Transaction[];
  smartContracts: SmartContract[];
  networkMetrics: NetworkMetrics;
  consensusStatus: ConsensusStatus;
  threatIntelligenceStats: ThreatIntelligenceStats;
}

interface ConsensusStatus {
  consensusAlgorithm: 'PROOF_OF_CONSCIOUSNESS' | 'PROOF_OF_STAKE' | 'PROOF_OF_AUTHORITY';
  currentRound: number;
  validatorCount: number;
  consensusParticipation: number;
  finalizationTime: number; // seconds
  forkCount: number;
}

interface ThreatIntelligenceStats {
  totalReports: number;
  verifiedThreats: number;
  falsePositives: number;
  reputationAccuracy: number;
  intelligenceValueScore: number;
}

interface VisualizationControls {
  showNodes: boolean;
  showTransactions: boolean;
  showSmartContracts: boolean;
  showConsensusProcess: boolean;
  showQuantumSecurity: boolean;
  animationSpeed: number;
  nodeScale: number;
  transactionFlow: boolean;
  networkTopology: '3D' | 'FORCE_DIRECTED' | 'GEOGRAPHIC' | 'HIERARCHICAL';
}

const BlockchainNetworkStatusVisualizer: React.FC = () => {
  const [networkData, setNetworkData] = useState<BlockchainNetworkData>({
    nodes: [],
    recentBlocks: [],
    pendingTransactions: [],
    smartContracts: [],
    networkMetrics: {
      totalNodes: 0,
      activeMiners: 0,
      networkHashRate: 0,
      currentDifficulty: 0,
      averageBlockTime: 0,
      transactionThroughput: 0,
      networkLatency: 0,
      consciousnessCoherence: 0,
      quantumSecurityLevel: 0,
      decentralizationIndex: 0
    },
    consensusStatus: {
      consensusAlgorithm: 'PROOF_OF_CONSCIOUSNESS',
      currentRound: 0,
      validatorCount: 0,
      consensusParticipation: 0,
      finalizationTime: 0,
      forkCount: 0
    },
    threatIntelligenceStats: {
      totalReports: 0,
      verifiedThreats: 0,
      falsePositives: 0,
      reputationAccuracy: 0,
      intelligenceValueScore: 0
    }
  });

  const [controls, setControls] = useState<VisualizationControls>({
    showNodes: true,
    showTransactions: true,
    showSmartContracts: true,
    showConsensusProcess: true,
    showQuantumSecurity: true,
    animationSpeed: 1.0,
    nodeScale: 1.0,
    transactionFlow: true,
    networkTopology: 'FORCE_DIRECTED'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webSocketRef = useRef<WebSocketService | null>(null);
  const blockchainServiceRef = useRef<BlockchainThreatIntelligence | null>(null);

  // Initialize blockchain services
  useEffect(() => {
    const initializeBlockchainServices = async () => {
      try {
        // Initialize Blockchain Threat Intelligence
        blockchainServiceRef.current = new BlockchainThreatIntelligence();
        await blockchainServiceRef.current.initialize();

        // Initialize WebSocket for real-time blockchain updates
        webSocketRef.current = new WebSocketService();
        await webSocketRef.current.connect();

        // Subscribe to blockchain network updates
        webSocketRef.current.subscribe('blockchain_network_status', handleNetworkStatusUpdate);
        webSocketRef.current.subscribe('new_block_mined', handleNewBlockMined);
        webSocketRef.current.subscribe('transaction_pending', handleTransactionUpdate);
        webSocketRef.current.subscribe('consensus_round', handleConsensusUpdate);
        webSocketRef.current.subscribe('smart_contract_execution', handleSmartContractUpdate);

        // Load initial blockchain network data
        await loadBlockchainNetworkData();
        setIsLoading(false);
      } catch (err) {
        setError(`Failed to initialize blockchain network visualizer: ${err.message}`);
        setIsLoading(false);
      }
    };

    initializeBlockchainServices();

    return () => {
      webSocketRef.current?.disconnect();
    };
  }, []);

  const loadBlockchainNetworkData = async () => {
    if (!blockchainServiceRef.current) return;

    try {
      const networkStatus = await blockchainServiceRef.current.getNetworkStatus();
      const blockchainStats = await blockchainServiceRef.current.getBlockchainStatistics();

      setNetworkData({
        nodes: networkStatus.nodes.map(transformBlockchainNode),
        recentBlocks: networkStatus.recentBlocks.map(transformBlockchainBlock),
        pendingTransactions: networkStatus.pendingTransactions.map(transformTransaction),
        smartContracts: networkStatus.smartContracts.map(transformSmartContract),
        networkMetrics: transformNetworkMetrics(blockchainStats.metrics),
        consensusStatus: transformConsensusStatus(networkStatus.consensus),
        threatIntelligenceStats: transformThreatIntelligenceStats(blockchainStats.threatIntelligence)
      });
    } catch (error) {
      console.error('Failed to load blockchain network data:', error);
    }
  };

  const handleNetworkStatusUpdate = useCallback((data: any) => {
    setNetworkData(prevData => ({
      ...prevData,
      networkMetrics: {
        ...prevData.networkMetrics,
        networkHashRate: data.hashRate ?? prevData.networkMetrics.networkHashRate,
        transactionThroughput: data.tps ?? prevData.networkMetrics.transactionThroughput,
        networkLatency: data.latency ?? prevData.networkMetrics.networkLatency,
        consciousnessCoherence: data.consciousnessCoherence ?? prevData.networkMetrics.consciousnessCoherence
      }
    }));
  }, []);

  const handleNewBlockMined = useCallback((blockData: any) => {
    const newBlock: BlockchainBlock = {
      blockHash: blockData.hash,
      blockNumber: blockData.number,
      timestamp: new Date(blockData.timestamp),
      miner: blockData.miner,
      transactionCount: blockData.transactionCount,
      blockSize: blockData.size,
      difficulty: blockData.difficulty,
      gasUsed: blockData.gasUsed,
      gasLimit: blockData.gasLimit,
      consciousnessSignature: blockData.consciousnessSignature,
      quantumProof: blockData.quantumProof,
      threatIntelligenceData: blockData.threatIntelligenceData || []
    };

    setNetworkData(prevData => ({
      ...prevData,
      recentBlocks: [newBlock, ...prevData.recentBlocks].slice(0, 20) // Keep last 20 blocks
    }));
  }, []);

  const handleTransactionUpdate = useCallback((txData: any) => {
    const newTransaction: Transaction = {
      id: txData.hash,
      fromAddress: txData.from,
      toAddress: txData.to,
      transactionType: txData.type,
      value: txData.value,
      gasPrice: txData.gasPrice,
      timestamp: new Date(txData.timestamp),
      confirmations: txData.confirmations,
      consciousnessVerified: txData.consciousnessVerified,
      quantumSigned: txData.quantumSigned
    };

    setNetworkData(prevData => ({
      ...prevData,
      pendingTransactions: [newTransaction, ...prevData.pendingTransactions].slice(0, 100) // Keep last 100
    }));
  }, []);

  const handleConsensusUpdate = useCallback((consensusData: any) => {
    setNetworkData(prevData => ({
      ...prevData,
      consensusStatus: {
        ...prevData.consensusStatus,
        currentRound: consensusData.round,
        consensusParticipation: consensusData.participation,
        finalizationTime: consensusData.finalizationTime
      }
    }));
  }, []);

  const handleSmartContractUpdate = useCallback((contractData: any) => {
    setNetworkData(prevData => ({
      ...prevData,
      smartContracts: prevData.smartContracts.map(contract =>
        contract.id === contractData.contractId
          ? { ...contract, executionCount: contract.executionCount + 1 }
          : contract
      )
    }));
  }, []);

  // Transform functions
  const transformBlockchainNode = (node: any): BlockchainNode => ({
    id: node.id,
    nodeType: node.type,
    position: [
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 40
    ],
    networkAddress: node.address,
    stakingPower: node.stakingPower || 0,
    consciousnessLevel: node.consciousnessLevel || 0,
    hashRate: node.hashRate || 0,
    blocksMined: node.blocksMined || 0,
    connectionCount: node.connections || 0,
    reputation: node.reputation || 0,
    quantumSecurity: node.quantumSecurity || {
      quantumResistance: 0,
      postQuantumAlgorithms: [],
      quantumKeyDistribution: false,
      quantumRandomness: 0
    },
    uptime: node.uptime || 0,
    geographicLocation: node.geoLocation || [0, 0]
  });

  const transformBlockchainBlock = (block: any): BlockchainBlock => ({
    blockHash: block.hash,
    blockNumber: block.number,
    timestamp: new Date(block.timestamp),
    miner: block.miner,
    transactionCount: block.transactionCount,
    blockSize: block.size,
    difficulty: block.difficulty,
    gasUsed: block.gasUsed,
    gasLimit: block.gasLimit,
    consciousnessSignature: block.consciousnessSignature || {},
    quantumProof: block.quantumProof || {},
    threatIntelligenceData: block.threatIntelligenceData || []
  });

  const transformTransaction = (tx: any): Transaction => ({
    id: tx.hash,
    fromAddress: tx.from,
    toAddress: tx.to,
    transactionType: tx.type,
    value: tx.value,
    gasPrice: tx.gasPrice,
    timestamp: new Date(tx.timestamp),
    confirmations: tx.confirmations,
    consciousnessVerified: tx.consciousnessVerified,
    quantumSigned: tx.quantumSigned
  });

  const transformSmartContract = (contract: any): SmartContract => ({
    id: contract.id,
    contractAddress: contract.address,
    contractType: contract.type,
    executionCount: contract.executionCount,
    gasConsumption: contract.gasConsumption,
    consciousnessRequirement: contract.consciousnessRequirement,
    codeHash: contract.codeHash,
    deploymentBlock: contract.deploymentBlock,
    isActive: contract.isActive
  });

  const transformNetworkMetrics = (metrics: any): NetworkMetrics => ({
    totalNodes: metrics.totalNodes || 0,
    activeMiners: metrics.activeMiners || 0,
    networkHashRate: metrics.networkHashRate || 0,
    currentDifficulty: metrics.currentDifficulty || 0,
    averageBlockTime: metrics.averageBlockTime || 0,
    transactionThroughput: metrics.transactionThroughput || 0,
    networkLatency: metrics.networkLatency || 0,
    consciousnessCoherence: metrics.consciousnessCoherence || 0,
    quantumSecurityLevel: metrics.quantumSecurityLevel || 0,
    decentralizationIndex: metrics.decentralizationIndex || 0
  });

  const transformConsensusStatus = (consensus: any): ConsensusStatus => ({
    consensusAlgorithm: consensus.algorithm || 'PROOF_OF_CONSCIOUSNESS',
    currentRound: consensus.currentRound || 0,
    validatorCount: consensus.validatorCount || 0,
    consensusParticipation: consensus.participation || 0,
    finalizationTime: consensus.finalizationTime || 0,
    forkCount: consensus.forkCount || 0
  });

  const transformThreatIntelligenceStats = (stats: any): ThreatIntelligenceStats => ({
    totalReports: stats.totalReports || 0,
    verifiedThreats: stats.verifiedThreats || 0,
    falsePositives: stats.falsePositives || 0,
    reputationAccuracy: stats.reputationAccuracy || 0,
    intelligenceValueScore: stats.intelligenceValueScore || 0
  });

  if (isLoading) {
    return (
      <div className="blockchain-network-loading">
        <div className="loading-spinner blockchain-spinner"></div>
        <p>Initializing Blockchain Network Visualization...</p>
        <p>Connecting to blockchain nodes...</p>
        <p>Synchronizing consensus state...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blockchain-network-error">
        <h3>Blockchain Network Visualization Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry Blockchain Connection</button>
      </div>
    );
  }

  return (
    <div className="blockchain-network-status-visualizer">
      {/* Control Panel */}
      <BlockchainControlPanel 
        controls={controls} 
        onControlsChange={setControls}
        networkData={networkData}
      />

      {/* Network Status Panel */}
      <BlockchainStatusPanel networkData={networkData} />

      {/* 3D Blockchain Canvas */}
      <div className="blockchain-visualizer-canvas">
        <Canvas
          camera={{ position: [0, 0, 50], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[20, 20, 20]} intensity={1.0} color="#00ff00" />
          <pointLight position={[-20, -20, -20]} intensity={0.6} color="#0080ff" />
          
          {/* Network Topology Visualization */}
          <NetworkTopology 
            networkData={networkData}
            controls={controls}
          />

          {/* Blockchain Nodes */}
          {controls.showNodes && networkData.nodes.map(node => (
            <BlockchainNodeVisualization 
              key={node.id}
              node={node}
              controls={controls}
            />
          ))}

          {/* Transaction Flow */}
          {controls.showTransactions && controls.transactionFlow && 
            networkData.pendingTransactions.slice(0, 20).map(transaction => (
              <TransactionFlowVisualization
                key={transaction.id}
                transaction={transaction}
                nodes={networkData.nodes}
                animationSpeed={controls.animationSpeed}
              />
            ))}

          {/* Smart Contracts */}
          {controls.showSmartContracts && networkData.smartContracts
            .filter(contract => contract.isActive)
            .map(contract => (
              <SmartContractVisualization
                key={contract.id}
                contract={contract}
                nodes={networkData.nodes}
              />
            ))}

          {/* Consensus Process */}
          {controls.showConsensusProcess && (
            <ConsensusProcessVisualization 
              consensusStatus={networkData.consensusStatus}
              nodes={networkData.nodes.filter(n => n.nodeType === 'VALIDATOR')}
            />
          )}

          {/* Quantum Security Overlay */}
          {controls.showQuantumSecurity && (
            <QuantumSecurityOverlay 
              networkData={networkData}
            />
          )}

          <OrbitControls enablePan enableZoom enableRotate />
          <Stats />

          {/* Blockchain Post-processing Effects */}
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
            <ChromaticAberration offset={[0.002, 0.002]} />
            <Scanline density={1.25} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Blockchain Analysis Panel */}
      <BlockchainAnalysisPanel networkData={networkData} />
    </div>
  );
};

// Network Topology Component
const NetworkTopology: React.FC<{
  networkData: BlockchainNetworkData;
  controls: VisualizationControls;
}> = ({ networkData, controls }) => {
  const groupRef = useRef<THREE.Group>(null);

  const connections = useMemo(() => {
    // Generate network connections based on node relationships
    const connectionLines = [];
    for (let i = 0; i < networkData.nodes.length; i++) {
      for (let j = i + 1; j < networkData.nodes.length; j++) {
        const nodeA = networkData.nodes[i];
        const nodeB = networkData.nodes[j];
        
        // Create connections based on node types and proximity
        if (nodeA.nodeType === 'GATEWAY' || nodeB.nodeType === 'GATEWAY' ||
            (nodeA.reputation > 0.7 && nodeB.reputation > 0.7)) {
          connectionLines.push({
            start: nodeA.position,
            end: nodeB.position,
            strength: (nodeA.reputation + nodeB.reputation) / 2
          });
        }
      }
    }
    return connectionLines;
  }, [networkData.nodes]);

  return (
    <group ref={groupRef}>
      {connections.map((connection, index) => (
        <Line
          key={index}
          points={[connection.start, connection.end]}
          color={`hsl(${connection.strength * 240}, 70%, 50%)`}
          lineWidth={1}
          transparent
          opacity={connection.strength * 0.5}
        />
      ))}
    </group>
  );
};

// Blockchain Node Visualization Component
const BlockchainNodeVisualization: React.FC<{
  node: BlockchainNode;
  controls: VisualizationControls;
}> = ({ node, controls }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { clock } = useThree();

  const { scale } = useSpring({
    scale: (1 + node.stakingPower) * controls.nodeScale,
    config: { tension: 300, friction: 10 }
  });

  useFrame(() => {
    if (groupRef.current) {
      const time = clock.getElapsedTime() * controls.animationSpeed;
      
      // Mining activity visualization
      if (node.nodeType === 'MINER' && node.hashRate > 0) {
        const miningPulse = 1 + Math.sin(time * 10) * 0.3 * (node.hashRate / 1000000); // Normalize hash rate
        groupRef.current.scale.setScalar(miningPulse);
      }
      
      // Consciousness-based rotation
      groupRef.current.rotation.y = time * node.consciousnessLevel;
    }
  });

  const getNodeColor = (nodeType: string) => {
    switch (nodeType) {
      case 'MINER': return '#ff8800';
      case 'VALIDATOR': return '#00ff88';
      case 'CONSCIOUSNESS_NODE': return '#8800ff';
      case 'SMART_CONTRACT': return '#0088ff';
      case 'GATEWAY': return '#ff0088';
      default: return '#ffffff';
    }
  };

  const getNodeGeometry = (nodeType: string) => {
    switch (nodeType) {
      case 'MINER': return <Box args={[2, 2, 2]} />;
      case 'VALIDATOR': return <octahedronGeometry args={[1.5, 0]} />;
      case 'CONSCIOUSNESS_NODE': return <sphereGeometry args={[1.5, 16, 12]} />;
      case 'SMART_CONTRACT': return <tetrahedronGeometry args={[1.5, 0]} />;
      case 'GATEWAY': return <dodecahedronGeometry args={[1.5, 0]} />;
      default: return <sphereGeometry args={[1, 8, 6]} />;
    }
  };

  return (
    <animated.group 
      ref={groupRef}
      position={node.position}
      scale={scale}
    >
      <mesh>
        {getNodeGeometry(node.nodeType)}
        <meshPhongMaterial 
          color={getNodeColor(node.nodeType)}
          transparent 
          opacity={0.8}
          emissive={getNodeColor(node.nodeType)}
          emissiveIntensity={node.consciousnessLevel * 0.3}
        />
      </mesh>
      
      {/* Quantum security indicator */}
      {node.quantumSecurity.quantumResistance > 0.5 && (
        <mesh position={[0, 3, 0]}>
          <sphereGeometry args={[0.3, 8, 6]} />
          <meshBasicMaterial 
            color="#ffff00"
            transparent
            opacity={node.quantumSecurity.quantumResistance}
          />
        </mesh>
      )}
      
      {/* Node information */}
      <Html distanceFactor={15}>
        <div className="blockchain-node-info">
          <div className="node-type">{node.nodeType}</div>
          <div className="node-address">{node.networkAddress.substring(0, 8)}...</div>
          <div className="staking-power">
            Stake: {(node.stakingPower * 100).toFixed(1)}%
          </div>
          <div className="consciousness-level">
            Consciousness: {(node.consciousnessLevel * 100).toFixed(1)}%
          </div>
          {node.nodeType === 'MINER' && (
            <div className="hash-rate">
              Hash Rate: {(node.hashRate / 1000000).toFixed(2)} MH/s
            </div>
          )}
          <div className="reputation">
            Reputation: {(node.reputation * 100).toFixed(1)}%
          </div>
        </div>
      </Html>
    </animated.group>
  );
};

// Transaction Flow Visualization Component
const TransactionFlowVisualization: React.FC<{
  transaction: Transaction;
  nodes: BlockchainNode[];
  animationSpeed: number;
}> = ({ transaction, nodes, animationSpeed }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { clock } = useThree();

  const fromNode = nodes.find(n => n.networkAddress === transaction.fromAddress);
  const toNode = nodes.find(n => n.networkAddress === transaction.toAddress);

  useFrame(() => {
    if (groupRef.current && fromNode && toNode) {
      const time = clock.getElapsedTime() * animationSpeed;
      
      // Animate transaction along path
      const progress = (Math.sin(time * 2) + 1) * 0.5;
      const position = new THREE.Vector3().lerpVectors(
        new THREE.Vector3(...fromNode.position),
        new THREE.Vector3(...toNode.position),
        progress
      );
      
      groupRef.current.position.copy(position);
    }
  });

  if (!fromNode || !toNode) return null;

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'THREAT_INTEL': return '#ff4444';
      case 'CONSENSUS_VOTE': return '#44ff44';
      case 'SMART_CONTRACT': return '#4444ff';
      case 'MINING_REWARD': return '#ffff44';
      default: return '#ffffff';
    }
  };

  return (
    <group ref={groupRef}>
      {/* Transaction path */}
      <Line
        points={[fromNode.position, toNode.position]}
        color={getTransactionColor(transaction.transactionType)}
        lineWidth={2}
        transparent
        opacity={0.6}
      />
      
      {/* Moving transaction indicator */}
      <Sphere args={[0.2, 8, 6]}>
        <meshBasicMaterial 
          color={getTransactionColor(transaction.transactionType)}
          transparent
          opacity={transaction.consciousnessVerified ? 1.0 : 0.5}
        />
      </Sphere>
      
      <Html distanceFactor={25}>
        <div className="transaction-info">
          <div>Type: {transaction.transactionType}</div>
          <div>Value: {transaction.value.toFixed(4)} STAR</div>
          <div>Confirmations: {transaction.confirmations}</div>
          {transaction.quantumSigned && <div className="quantum-signed">⚛️ Quantum Signed</div>}
        </div>
      </Html>
    </group>
  );
};

// Smart Contract Visualization Component
const SmartContractVisualization: React.FC<{
  contract: SmartContract;
  nodes: BlockchainNode[];
}> = ({ contract, nodes }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  // Find the node hosting this contract
  const hostNode = nodes.find(n => 
    n.nodeType === 'SMART_CONTRACT' && 
    n.networkAddress.includes(contract.contractAddress.substring(0, 6))
  );

  useFrame(() => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      
      // Contract execution pulse
      if (contract.executionCount > 0) {
        const pulse = 1 + Math.sin(time * 8) * 0.2;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  if (!hostNode) return null;

  const getContractColor = (type: string) => {
    switch (type) {
      case 'THREAT_VERIFICATION': return '#ff0000';
      case 'REPUTATION_MANAGEMENT': return '#00ff00';
      case 'AUTOMATED_RESPONSE': return '#0000ff';
      case 'CONSENSUS_ORACLE': return '#ff00ff';
      default: return '#ffffff';
    }
  };

  return (
    <mesh 
      ref={meshRef} 
      position={[
        hostNode.position[0] + 2,
        hostNode.position[1] + 2,
        hostNode.position[2]
      ]}
    >
      <icosahedronGeometry args={[0.8, 1]} />
      <meshPhongMaterial 
        color={getContractColor(contract.contractType)}
        transparent 
        opacity={0.7}
        emissive={getContractColor(contract.contractType)}
        emissiveIntensity={contract.consciousnessRequirement * 0.4}
      />
      
      <Html distanceFactor={30}>
        <div className="smart-contract-info">
          <div>{contract.contractType}</div>
          <div>Executions: {contract.executionCount}</div>
          <div>Gas Used: {contract.gasConsumption.toLocaleString()}</div>
          <div>Consciousness Req: {(contract.consciousnessRequirement * 100).toFixed(0)}%</div>
        </div>
      </Html>
    </mesh>
  );
};

// Consensus Process Visualization Component
const ConsensusProcessVisualization: React.FC<{
  consensusStatus: ConsensusStatus;
  nodes: BlockchainNode[];
}> = ({ consensusStatus, nodes }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { clock } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      
      // Consensus round rotation
      groupRef.current.rotation.y = time * 0.5 + consensusStatus.currentRound * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 20]}>
      {/* Consensus ring */}
      <mesh>
        <torusGeometry args={[15, 1, 8, 16]} />
        <meshPhongMaterial 
          color="#00ffff"
          transparent 
          opacity={consensusStatus.consensusParticipation}
          emissive="#004444"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Consensus status text */}
      <Text
        position={[0, 0, 0]}
        fontSize={2}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        {consensusStatus.consensusAlgorithm}
      </Text>
      
      <Text
        position={[0, -3, 0]}
        fontSize={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Round: {consensusStatus.currentRound}
      </Text>
      
      <Html distanceFactor={40}>
        <div className="consensus-info">
          <div>Validators: {consensusStatus.validatorCount}</div>
          <div>Participation: {(consensusStatus.consensusParticipation * 100).toFixed(1)}%</div>
          <div>Finalization: {consensusStatus.finalizationTime}s</div>
          <div>Forks: {consensusStatus.forkCount}</div>
        </div>
      </Html>
    </group>
  );
};

// Quantum Security Overlay Component
const QuantumSecurityOverlay: React.FC<{
  networkData: BlockchainNetworkData;
}> = ({ networkData }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      
      // Quantum field oscillation
      const quantumPhase = time * 3 + networkData.networkMetrics.quantumSecurityLevel * 5;
      const scale = 1 + Math.sin(quantumPhase) * 0.1 * networkData.networkMetrics.quantumSecurityLevel;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -10]}>
      <sphereGeometry args={[30, 32, 24]} />
      <meshPhongMaterial 
        color={`hsl(${networkData.networkMetrics.quantumSecurityLevel * 120}, 60%, 30%)`}
        transparent 
        opacity={0.1}
        wireframe={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Control Panel Component
const BlockchainControlPanel: React.FC<{
  controls: VisualizationControls;
  onControlsChange: (controls: VisualizationControls) => void;
  networkData: BlockchainNetworkData;
}> = ({ controls, onControlsChange, networkData }) => {
  return (
    <div className="blockchain-control-panel">
      <h3>Blockchain Network Controls</h3>
      
      <div className="control-group">
        <label>Display Options</label>
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={controls.showNodes}
              onChange={(e) => onControlsChange({...controls, showNodes: e.target.checked})}
            />
            Network Nodes
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={controls.showTransactions}
              onChange={(e) => onControlsChange({...controls, showTransactions: e.target.checked})}
            />
            Transactions
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={controls.showSmartContracts}
              onChange={(e) => onControlsChange({...controls, showSmartContracts: e.target.checked})}
            />
            Smart Contracts
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={controls.showConsensusProcess}
              onChange={(e) => onControlsChange({...controls, showConsensusProcess: e.target.checked})}
            />
            Consensus Process
          </label>
        </div>
      </div>

      <div className="control-group">
        <label>Animation Speed</label>
        <input 
          type="range" 
          min="0.1" 
          max="3" 
          step="0.1" 
          value={controls.animationSpeed}
          onChange={(e) => onControlsChange({...controls, animationSpeed: parseFloat(e.target.value)})}
        />
        <span>{controls.animationSpeed.toFixed(1)}x</span>
      </div>

      <div className="control-group">
        <label>Node Scale</label>
        <input 
          type="range" 
          min="0.5" 
          max="2" 
          step="0.1" 
          value={controls.nodeScale}
          onChange={(e) => onControlsChange({...controls, nodeScale: parseFloat(e.target.value)})}
        />
        <span>{controls.nodeScale.toFixed(1)}</span>
      </div>
    </div>
  );
};

// Status Panel Component
const BlockchainStatusPanel: React.FC<{
  networkData: BlockchainNetworkData;
}> = ({ networkData }) => {
  return (
    <div className="blockchain-status-panel">
      <h3>Network Status</h3>
      
      <div className="status-item">
        <label>Network Hash Rate</label>
        <span>{(networkData.networkMetrics.networkHashRate / 1000000).toFixed(2)} MH/s</span>
      </div>

      <div className="status-item">
        <label>Transaction Throughput</label>
        <span>{networkData.networkMetrics.transactionThroughput.toFixed(1)} TPS</span>
      </div>

      <div className="status-item">
        <label>Network Latency</label>
        <span>{networkData.networkMetrics.networkLatency.toFixed(0)} ms</span>
      </div>

      <div className="status-item">
        <label>Consciousness Coherence</label>
        <div className="meter">
          <div 
            className="meter-fill" 
            style={{ 
              width: `${networkData.networkMetrics.consciousnessCoherence * 100}%`,
              backgroundColor: `hsl(${networkData.networkMetrics.consciousnessCoherence * 120}, 80%, 50%)`
            }}
          ></div>
        </div>
        <span>{(networkData.networkMetrics.consciousnessCoherence * 100).toFixed(1)}%</span>
      </div>

      <div className="status-item">
        <label>Quantum Security</label>
        <div className="meter">
          <div 
            className="meter-fill" 
            style={{ 
              width: `${networkData.networkMetrics.quantumSecurityLevel * 100}%`,
              backgroundColor: `hsl(${240 + networkData.networkMetrics.quantumSecurityLevel * 120}, 80%, 50%)`
            }}
          ></div>
        </div>
        <span>{(networkData.networkMetrics.quantumSecurityLevel * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
};

// Analysis Panel Component
const BlockchainAnalysisPanel: React.FC<{
  networkData: BlockchainNetworkData;
}> = ({ networkData }) => {
  return (
    <div className="blockchain-analysis-panel">
      <h3>Network Analysis</h3>
      
      <div className="analysis-section">
        <h4>Network Health</h4>
        <div className="stat-display">
          <span className="stat-value">{networkData.networkMetrics.totalNodes}</span>
          <span className="stat-label">Total Nodes</span>
        </div>
        <div className="stat-display">
          <span className="stat-value">{networkData.networkMetrics.activeMiners}</span>
          <span className="stat-label">Active Miners</span>
        </div>
      </div>

      <div className="analysis-section">
        <h4>Consensus Status</h4>
        <div className="stat-display">
          <span className="stat-value">{networkData.consensusStatus.validatorCount}</span>
          <span className="stat-label">Validators</span>
        </div>
        <div className="stat-display">
          <span className="stat-value">{(networkData.consensusStatus.consensusParticipation * 100).toFixed(1)}%</span>
          <span className="stat-label">Participation</span>
        </div>
      </div>

      <div className="analysis-section">
        <h4>Threat Intelligence</h4>
        <div className="stat-display">
          <span className="stat-value">{networkData.threatIntelligenceStats.totalReports}</span>
          <span className="stat-label">Total Reports</span>
        </div>
        <div className="stat-display">
          <span className="stat-value">{networkData.threatIntelligenceStats.verifiedThreats}</span>
          <span className="stat-label">Verified Threats</span>
        </div>
        <div className="stat-display">
          <span className="stat-value">{(networkData.threatIntelligenceStats.reputationAccuracy * 100).toFixed(1)}%</span>
          <span className="stat-label">Accuracy</span>
        </div>
      </div>

      <div className="analysis-section">
        <h4>Recent Activity</h4>
        <div className="stat-display">
          <span className="stat-value">{networkData.recentBlocks.length}</span>
          <span className="stat-label">Recent Blocks</span>
        </div>
        <div className="stat-display">
          <span className="stat-value">{networkData.pendingTransactions.length}</span>
          <span className="stat-label">Pending Transactions</span>
        </div>
      </div>
    </div>
  );
};

export default BlockchainNetworkStatusVisualizer;
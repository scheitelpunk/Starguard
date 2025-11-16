/**
 * ConsciousnessAuth - Advanced Biometric Authentication Engine (Refactored)
 *
 * Main orchestrator that coordinates keystroke dynamics, mouse movement,
 * and behavioral pattern analysis for continuous biometric authentication
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import {
  BiometricConfig,
  BiometricProfile,
  KeystrokeEvent,
  MouseEvent,
  AuthenticationSession,
  AuthenticationResult
} from './biometric-types';
import { KeystrokeAnalyzer } from './keystroke-analyzer';
import { MouseAnalyzer } from './mouse-analyzer';
import { BehavioralAnalyzer } from './behavioral-analyzer';

export class ConsciousnessAuth extends EventEmitter {
  private readonly config: BiometricConfig = {
    sessionTimeout: 300000,
    minSampleSize: 50,
    confidenceThreshold: 0.75,
    riskThreshold: 0.6,
    updateThreshold: 0.1,
    keystrokeTimingTolerance: 50,
    mouseVelocityTolerance: 0.2,
    profileRetentionDays: 90,
    maxProfileAge: 7776000000,
  };

  private biometricProfiles: Map<string, BiometricProfile> = new Map();
  private activeSessions: Map<string, AuthenticationSession> = new Map();
  private processingQueue: Array<KeystrokeEvent | MouseEvent> = [];
  private isProcessing: boolean = false;
  private cleanupInterval?: NodeJS.Timeout;

  // Component analyzers
  private keystrokeAnalyzer: KeystrokeAnalyzer;
  private mouseAnalyzer: MouseAnalyzer;
  private behavioralAnalyzer: BehavioralAnalyzer;

  constructor(private logger = console) {
    super();

    // Initialize analyzers
    this.keystrokeAnalyzer = new KeystrokeAnalyzer(this.config.minSampleSize);
    this.mouseAnalyzer = new MouseAnalyzer(this.config.minSampleSize);
    this.behavioralAnalyzer = new BehavioralAnalyzer(this.config.minSampleSize);

    this.setupEventHandlers();
    this.startBackgroundProcessing();
  }

  /**
   * Initialize the authentication engine
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info('ConsciousnessAuth: Initializing biometric authentication engine');

      await this.loadExistingProfiles();
      this.startCleanupRoutine();

      this.emit('initialized');
      this.logger.info('ConsciousnessAuth: Successfully initialized');
    } catch (error) {
      this.logger.error('ConsciousnessAuth: Initialization failed', error);
      throw new Error(`ConsciousnessAuth initialization failed: ${error}`);
    }
  }

  /**
   * Start a new authentication session
   */
  public async startSession(userId: string): Promise<string> {
    try {
      const sessionId = crypto.randomUUID();

      const session: AuthenticationSession = {
        sessionId,
        userId,
        startTime: Date.now(),
        keystrokeEvents: [],
        mouseEvents: [],
        isActive: true,
        lastActivity: Date.now()
      };

      this.activeSessions.set(sessionId, session);

      this.logger.info(`ConsciousnessAuth: Started session ${sessionId} for user ${userId}`);
      this.emit('session_started', { sessionId, userId });

      return sessionId;
    } catch (error) {
      this.logger.error('ConsciousnessAuth: Failed to start session', error);
      throw error;
    }
  }

  /**
   * Process keystroke event for biometric analysis
   */
  public async captureKeystroke(event: KeystrokeEvent): Promise<void> {
    try {
      const session = this.activeSessions.get(event.sessionId);
      if (!session || !session.isActive) {
        throw new Error('Invalid or inactive session');
      }

      // Enrich event with derived metrics
      const enrichedEvent = this.keystrokeAnalyzer.enrichKeystrokeEvent(event, session.keystrokeEvents);

      // Add to session
      session.keystrokeEvents.push(enrichedEvent);
      session.lastActivity = Date.now();

      // Add to processing queue
      this.processingQueue.push(enrichedEvent);

      if (!this.isProcessing) {
        this.processEventQueue();
      }

      this.emit('keystroke_captured', enrichedEvent);
    } catch (error) {
      this.logger.error('ConsciousnessAuth: Keystroke capture failed', error);
      throw error;
    }
  }

  /**
   * Process mouse movement event for biometric analysis
   */
  public async captureMouseMovement(event: MouseEvent): Promise<void> {
    try {
      const session = this.activeSessions.get(event.sessionId);
      if (!session || !session.isActive) {
        throw new Error('Invalid or inactive session');
      }

      // Enrich event with calculated metrics
      const enrichedEvent = this.mouseAnalyzer.enrichMouseEvent(event, session.mouseEvents);

      // Add to session
      session.mouseEvents.push(enrichedEvent);
      session.lastActivity = Date.now();

      // Add to processing queue
      this.processingQueue.push(enrichedEvent);

      if (!this.isProcessing) {
        this.processEventQueue();
      }

      this.emit('mouse_captured', enrichedEvent);
    } catch (error) {
      this.logger.error('ConsciousnessAuth: Mouse capture failed', error);
      throw error;
    }
  }

  /**
   * Perform real-time authentication based on current session data
   */
  public async authenticateSession(sessionId: string): Promise<AuthenticationResult> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.isActive) {
        throw new Error('Invalid or inactive session');
      }

      const profile = this.biometricProfiles.get(session.userId);
      if (!profile) {
        throw new Error('No biometric profile found for user');
      }

      // Analyze current session against user profile
      const keystrokeScore = await this.keystrokeAnalyzer.analyzeKeystrokeDynamics(
        session.keystrokeEvents,
        profile
      );
      const mouseScore = await this.mouseAnalyzer.analyzeMouseMovement(session.mouseEvents, profile);
      const behavioralScore = await this.behavioralAnalyzer.analyzeBehavioralPattern(session, profile);

      // Calculate composite authentication score
      const compositeScore = this.calculateCompositeScore(
        keystrokeScore,
        mouseScore,
        behavioralScore
      );

      // Determine authentication result
      const authenticated = compositeScore.confidence >= this.config.confidenceThreshold &&
                          compositeScore.riskScore <= this.config.riskThreshold;

      const result: AuthenticationResult = {
        userId: session.userId,
        authenticated,
        confidence: compositeScore.confidence,
        riskScore: compositeScore.riskScore,
        matchingFactors: compositeScore.matchingFactors,
        anomalies: compositeScore.anomalies,
        timestamp: Date.now(),
        sessionId
      };

      // Update profile if authentication is successful and confidence is high
      if (authenticated && compositeScore.confidence > 0.85) {
        await this.updateBiometricProfile(session, profile);
      }

      this.emit('authentication_result', result);
      return result;

    } catch (error) {
      this.logger.error('ConsciousnessAuth: Authentication failed', error);
      throw error;
    }
  }

  /**
   * Create initial biometric profile for new user
   */
  public async createBiometricProfile(
    userId: string,
    sessionId: string
  ): Promise<BiometricProfile> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || session.userId !== userId) {
        throw new Error('Invalid session for profile creation');
      }

      // Ensure sufficient sample size
      if (session.keystrokeEvents.length < this.config.minSampleSize ||
          session.mouseEvents.length < this.config.minSampleSize) {
        throw new Error('Insufficient biometric samples for profile creation');
      }

      // Build initial profile
      const profile: BiometricProfile = {
        userId,
        keystrokeDynamics: await this.keystrokeAnalyzer.buildKeystrokeDynamicsProfile(
          session.keystrokeEvents
        ),
        mouseMovement: await this.mouseAnalyzer.buildMouseMovementProfile(session.mouseEvents),
        behavioralPattern: await this.behavioralAnalyzer.buildBehavioralPatternProfile(session),
        created: Date.now(),
        lastUpdated: Date.now(),
        sampleCount: session.keystrokeEvents.length + session.mouseEvents.length
      };

      // Store profile
      this.biometricProfiles.set(userId, profile);

      this.logger.info(`ConsciousnessAuth: Created biometric profile for user ${userId}`);
      this.emit('profile_created', { userId, profile });

      return profile;
    } catch (error) {
      this.logger.error('ConsciousnessAuth: Profile creation failed', error);
      throw error;
    }
  }

  /**
   * Calculate composite authentication score
   */
  private calculateCompositeScore(
    keystrokeScore: { confidence: number; anomalies: string[] },
    mouseScore: { confidence: number; anomalies: string[] },
    behavioralScore: { confidence: number; anomalies: string[] }
  ): {
    confidence: number;
    riskScore: number;
    matchingFactors: string[];
    anomalies: string[];
  } {
    const weights = {
      keystroke: 0.4,
      mouse: 0.35,
      behavioral: 0.25
    };

    // Calculate weighted confidence
    const confidence = (
      keystrokeScore.confidence * weights.keystroke +
      mouseScore.confidence * weights.mouse +
      behavioralScore.confidence * weights.behavioral
    );

    // Calculate risk score
    const totalAnomalies = [
      ...keystrokeScore.anomalies,
      ...mouseScore.anomalies,
      ...behavioralScore.anomalies
    ];

    const anomalyPenalty = Math.min(totalAnomalies.length * 0.1, 0.5);
    const riskScore = (1 - confidence) + anomalyPenalty;

    // Identify matching factors
    const matchingFactors: string[] = [];
    if (keystrokeScore.confidence > 0.7) matchingFactors.push('KEYSTROKE_DYNAMICS');
    if (mouseScore.confidence > 0.7) matchingFactors.push('MOUSE_MOVEMENT');
    if (behavioralScore.confidence > 0.7) matchingFactors.push('BEHAVIORAL_PATTERN');

    return {
      confidence: Math.max(0, Math.min(1, confidence)),
      riskScore: Math.max(0, Math.min(1, riskScore)),
      matchingFactors,
      anomalies: totalAnomalies
    };
  }

  /**
   * Update biometric profile with new session data
   */
  private async updateBiometricProfile(
    session: AuthenticationSession,
    profile: BiometricProfile
  ): Promise<void> {
    try {
      // Build profiles from recent session data
      const recentKeystroke = await this.keystrokeAnalyzer.buildKeystrokeDynamicsProfile(
        session.keystrokeEvents.slice(-50)
      );
      const recentMouse = await this.mouseAnalyzer.buildMouseMovementProfile(
        session.mouseEvents.slice(-100)
      );
      const recentBehavioral = await this.behavioralAnalyzer.buildBehavioralPatternProfile(session);

      const alpha = this.config.updateThreshold;

      // Update keystroke dynamics
      this.behavioralAnalyzer.updateStatisticalMeasures(
        profile.keystrokeDynamics.typingRhythm,
        recentKeystroke.typingRhythm,
        alpha
      );

      // Update mouse movement
      this.behavioralAnalyzer.updateStatisticalMeasures(
        profile.mouseMovement.velocity,
        recentMouse.velocity,
        alpha
      );
      this.behavioralAnalyzer.updateStatisticalMeasures(
        profile.mouseMovement.acceleration,
        recentMouse.acceleration,
        alpha
      );

      // Update behavioral patterns
      this.behavioralAnalyzer.updateStatisticalMeasures(
        profile.behavioralPattern.errorRate,
        recentBehavioral.errorRate,
        alpha
      );
      this.behavioralAnalyzer.updateStatisticalMeasures(
        profile.behavioralPattern.interactionFrequency,
        recentBehavioral.interactionFrequency,
        alpha
      );

      // Update metadata
      profile.lastUpdated = Date.now();
      profile.sampleCount += session.keystrokeEvents.length + session.mouseEvents.length;

      this.logger.info(`ConsciousnessAuth: Updated biometric profile for user ${profile.userId}`);
      this.emit('profile_updated', { userId: profile.userId, sampleCount: profile.sampleCount });

    } catch (error) {
      this.logger.error('ConsciousnessAuth: Profile update failed', error);
    }
  }

  /**
   * Process event queue asynchronously
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const batchSize = Math.min(100, this.processingQueue.length);
      const batch = this.processingQueue.splice(0, batchSize);

      await Promise.all(
        batch.map(event => this.processEventForLearning(event))
      );

    } catch (error) {
      this.logger.error('ConsciousnessAuth: Event processing failed', error);
    } finally {
      this.isProcessing = false;

      if (this.processingQueue.length > 0) {
        setImmediate(() => this.processEventQueue());
      }
    }
  }

  private async processEventForLearning(event: KeystrokeEvent | MouseEvent): Promise<void> {
    this.emit('event_processed', event);
  }

  private async loadExistingProfiles(): Promise<void> {
    this.logger.info('ConsciousnessAuth: Loaded existing biometric profiles');
  }

  private startCleanupRoutine(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 300000);
  }

  private performCleanup(): void {
    const currentTime = Date.now();

    // Clean inactive sessions
    for (const [sessionId, session] of this.activeSessions) {
      if (currentTime - session.lastActivity > this.config.sessionTimeout) {
        session.isActive = false;
        this.emit('session_expired', { sessionId, userId: session.userId });
      }
    }

    // Clean old profiles
    for (const [userId, profile] of this.biometricProfiles) {
      if (currentTime - profile.lastUpdated > this.config.maxProfileAge) {
        this.biometricProfiles.delete(userId);
        this.emit('profile_expired', { userId });
      }
    }

    // Limit processing queue size
    if (this.processingQueue.length > 1000) {
      this.processingQueue.splice(0, this.processingQueue.length - 500);
    }
  }

  private setupEventHandlers(): void {
    this.on('error', (error) => {
      this.logger.error('ConsciousnessAuth: Error event', error);
    });
  }

  private startBackgroundProcessing(): void {
    setImmediate(() => this.processEventQueue());
  }

  public async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.activeSessions.delete(sessionId);
      this.emit('session_ended', { sessionId, userId: session.userId });
      this.logger.info(`ConsciousnessAuth: Ended session ${sessionId}`);
    }
  }

  public getStats() {
    return {
      activeProfiles: this.biometricProfiles.size,
      activeSessions: Array.from(this.activeSessions.values()).filter(s => s.isActive).length,
      processingQueueSize: this.processingQueue.length,
      isProcessing: this.isProcessing,
      config: this.config
    };
  }

  public async shutdown(): Promise<void> {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = undefined;
      }

      for (const sessionId of this.activeSessions.keys()) {
        await this.endSession(sessionId);
      }

      this.processingQueue.length = 0;
      this.isProcessing = false;

      this.emit('shutdown');
      this.logger.info('ConsciousnessAuth: Successfully shut down');
    } catch (error) {
      this.logger.error('ConsciousnessAuth: Shutdown failed', error);
      throw error;
    }
  }
}

export default ConsciousnessAuth;

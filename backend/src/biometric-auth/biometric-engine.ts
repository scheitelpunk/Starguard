import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import { performance } from 'perf_hooks';

// Types for biometric authentication
interface KeystrokeEvent {
  key: string;
  eventType: 'keydown' | 'keyup';
  timestamp: number;
  pressure?: number;
  sessionId: string;
}

interface MouseEvent {
  x: number;
  y: number;
  timestamp: number;
  eventType: 'move' | 'click' | 'scroll';
  button?: number;
  velocity?: number;
  acceleration?: number;
  sessionId: string;
}

interface BiometricProfile {
  userId: string;
  keystrokeDynamics: KeystrokeDynamicsProfile;
  mouseMovement: MouseMovementProfile;
  behavioralPattern: BehavioralPatternProfile;
  created: number;
  lastUpdated: number;
  sampleCount: number;
}

interface KeystrokeDynamicsProfile {
  dwellTimes: Map<string, StatisticalMeasures>; // Key hold times
  flightTimes: StatisticalMeasures; // Time between key releases and next key presses
  pressurePatterns: Map<string, StatisticalMeasures>; // Key pressure patterns
  typingRhythm: StatisticalMeasures; // Overall typing rhythm
  commonDigraphs: Map<string, StatisticalMeasures>; // Two-character combinations
}

interface MouseMovementProfile {
  velocity: StatisticalMeasures;
  acceleration: StatisticalMeasures;
  trajectoryAngles: StatisticalMeasures;
  clickPatterns: StatisticalMeasures;
  scrollingBehavior: StatisticalMeasures;
  pauseDuration: StatisticalMeasures;
  movementSmoothing: number; // Jitter vs smooth movement ratio
}

interface BehavioralPatternProfile {
  sessionDuration: StatisticalMeasures;
  activityPattern: Map<number, number>; // Hour of day activity levels
  errorRate: StatisticalMeasures;
  interactionFrequency: StatisticalMeasures;
  multitaskingPattern: StatisticalMeasures;
  focusMetrics: StatisticalMeasures;
}

interface StatisticalMeasures {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  samples: number;
  confidence: number;
}

interface AuthenticationResult {
  userId: string;
  authenticated: boolean;
  confidence: number;
  riskScore: number;
  matchingFactors: string[];
  anomalies: string[];
  timestamp: number;
  sessionId: string;
}

interface AuthenticationSession {
  sessionId: string;
  userId: string;
  startTime: number;
  keystrokeEvents: KeystrokeEvent[];
  mouseEvents: MouseEvent[];
  isActive: boolean;
  lastActivity: number;
}

/**
 * ConsciousnessAuth - Advanced Biometric Authentication Engine
 * 
 * Implements comprehensive biometric authentication using:
 * - Keystroke dynamics with dwell and flight time analysis
 * - Mouse movement pattern recognition
 * - Behavioral pattern matching with statistical scoring
 * - Real-time anomaly detection and risk assessment
 */
export class ConsciousnessAuth extends EventEmitter {
  private readonly config = {
    sessionTimeout: 300000, // 5 minutes
    minSampleSize: 50, // Minimum events for reliable profiling
    confidenceThreshold: 0.75, // Minimum confidence for authentication
    riskThreshold: 0.6, // Maximum risk score for authentication
    updateThreshold: 0.1, // Profile update sensitivity
    keystrokeTimingTolerance: 50, // ms tolerance for keystroke timing
    mouseVelocityTolerance: 0.2, // Velocity tolerance ratio
    profileRetentionDays: 90, // Profile data retention
    maxProfileAge: 7776000000, // 90 days in ms
  };

  private biometricProfiles: Map<string, BiometricProfile> = new Map();
  private activeSessions: Map<string, AuthenticationSession> = new Map();
  private processingQueue: Array<KeystrokeEvent | MouseEvent> = [];
  private isProcessing: boolean = false;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(private logger = console) {
    super();
    this.setupEventHandlers();
    this.startBackgroundProcessing();
  }

  /**
   * Initialize the authentication engine
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info('ConsciousnessAuth: Initializing biometric authentication engine');
      
      // Load existing profiles (in production, this would be from database)
      await this.loadExistingProfiles();
      
      // Start cleanup routine
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
      // Validate session
      const session = this.activeSessions.get(event.sessionId);
      if (!session || !session.isActive) {
        throw new Error('Invalid or inactive session');
      }

      // Enrich event with derived metrics
      const enrichedEvent = await this.enrichKeystrokeEvent(event, session);
      
      // Add to session
      session.keystrokeEvents.push(enrichedEvent);
      session.lastActivity = Date.now();
      
      // Add to processing queue
      this.processingQueue.push(enrichedEvent);
      
      // Trigger processing if not already running
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
      // Validate session
      const session = this.activeSessions.get(event.sessionId);
      if (!session || !session.isActive) {
        throw new Error('Invalid or inactive session');
      }

      // Enrich event with calculated metrics
      const enrichedEvent = await this.enrichMouseEvent(event, session);
      
      // Add to session
      session.mouseEvents.push(enrichedEvent);
      session.lastActivity = Date.now();
      
      // Add to processing queue
      this.processingQueue.push(enrichedEvent);
      
      // Trigger processing if not already running
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
      const keystrokeScore = await this.analyzeKeystrokeDynamics(session, profile);
      const mouseScore = await this.analyzeMouseMovement(session, profile);
      const behavioralScore = await this.analyzeBehavioralPattern(session, profile);

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
        keystrokeDynamics: await this.buildKeystrokeDynamicsProfile(session.keystrokeEvents),
        mouseMovement: await this.buildMouseMovementProfile(session.mouseEvents),
        behavioralPattern: await this.buildBehavioralPatternProfile(session),
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
   * Enrich keystroke event with timing and pattern analysis
   */
  private async enrichKeystrokeEvent(
    event: KeystrokeEvent,
    session: AuthenticationSession
  ): Promise<KeystrokeEvent> {
    // Calculate dwell time (if this is a keyup event)
    if (event.eventType === 'keyup') {
      const correspondingKeydown = session.keystrokeEvents
        .slice()
        .reverse()
        .find(e => e.key === event.key && e.eventType === 'keydown');
      
      if (correspondingKeydown) {
        (event as any).dwellTime = event.timestamp - correspondingKeydown.timestamp;
      }
    }

    // Calculate flight time (time between key release and next key press)
    if (event.eventType === 'keydown' && session.keystrokeEvents.length > 0) {
      const lastKeyup = session.keystrokeEvents
        .slice()
        .reverse()
        .find(e => e.eventType === 'keyup');
      
      if (lastKeyup) {
        (event as any).flightTime = event.timestamp - lastKeyup.timestamp;
      }
    }

    return event;
  }

  /**
   * Enrich mouse event with velocity and acceleration data
   */
  private async enrichMouseEvent(
    event: MouseEvent,
    session: AuthenticationSession
  ): Promise<MouseEvent> {
    if (event.eventType === 'move' && session.mouseEvents.length > 0) {
      const lastEvent = session.mouseEvents[session.mouseEvents.length - 1];
      
      if (lastEvent.eventType === 'move') {
        const deltaTime = event.timestamp - lastEvent.timestamp;
        const deltaX = event.x - lastEvent.x;
        const deltaY = event.y - lastEvent.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Calculate velocity (pixels per millisecond)
        event.velocity = deltaTime > 0 ? distance / deltaTime : 0;
        
        // Calculate acceleration
        if (lastEvent.velocity !== undefined) {
          event.acceleration = (event.velocity - lastEvent.velocity) / deltaTime;
        }
      }
    }

    return event;
  }

  /**
   * Build keystroke dynamics profile from events
   */
  private async buildKeystrokeDynamicsProfile(
    events: KeystrokeEvent[]
  ): Promise<KeystrokeDynamicsProfile> {
    const dwellTimes = new Map<string, number[]>();
    const flightTimes: number[] = [];
    const pressurePatterns = new Map<string, number[]>();
    const typingRhythm: number[] = [];
    const digraphTimes = new Map<string, number[]>();

    // Process events to extract timing patterns
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      
      // Collect dwell times
      if ((event as any).dwellTime) {
        if (!dwellTimes.has(event.key)) {
          dwellTimes.set(event.key, []);
        }
        dwellTimes.get(event.key)!.push((event as any).dwellTime);
      }

      // Collect flight times
      if ((event as any).flightTime) {
        flightTimes.push((event as any).flightTime);
      }

      // Collect pressure patterns
      if (event.pressure) {
        if (!pressurePatterns.has(event.key)) {
          pressurePatterns.set(event.key, []);
        }
        pressurePatterns.get(event.key)!.push(event.pressure);
      }

      // Build digraph timing (two-character combinations)
      if (i > 0 && event.eventType === 'keydown') {
        const prevEvent = events[i - 1];
        if (prevEvent.eventType === 'keydown') {
          const digraph = prevEvent.key + event.key;
          const digraphTime = event.timestamp - prevEvent.timestamp;
          
          if (!digraphTimes.has(digraph)) {
            digraphTimes.set(digraph, []);
          }
          digraphTimes.get(digraph)!.push(digraphTime);
        }
      }
    }

    // Convert to statistical measures
    const dwellTimesMap = this.convertToStatisticalMeasures(dwellTimes);
    const flightTimesMeasures = this.calculateStatisticalMeasures(flightTimes);
    const pressurePatternsMap = this.convertToStatisticalMeasures(pressurePatterns);
    const typingRhythmMeasures = this.calculateStatisticalMeasures(flightTimes);
    const commonDigraphsMap = this.convertToStatisticalMeasures(digraphTimes);

    return {
      dwellTimes: dwellTimesMap,
      flightTimes: flightTimesMeasures,
      pressurePatterns: pressurePatternsMap,
      typingRhythm: typingRhythmMeasures,
      commonDigraphs: commonDigraphsMap
    };
  }

  /**
   * Build mouse movement profile from events
   */
  private async buildMouseMovementProfile(events: MouseEvent[]): Promise<MouseMovementProfile> {
    const velocities: number[] = [];
    const accelerations: number[] = [];
    const trajectoryAngles: number[] = [];
    const clickIntervals: number[] = [];
    const scrollPatterns: number[] = [];
    const pauseDurations: number[] = [];
    
    let lastClickTime = 0;
    let lastMoveTime = 0;
    let movementSmoothing = 0;
    let smoothMovements = 0;
    let jitterMovements = 0;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      // Collect velocities and accelerations
      if (event.velocity !== undefined) {
        velocities.push(event.velocity);
        
        // Analyze movement smoothing (jitter detection)
        if (event.velocity > 0.1) { // Significant movement
          if (event.acceleration !== undefined && Math.abs(event.acceleration) < 0.001) {
            smoothMovements++;
          } else {
            jitterMovements++;
          }
        }
      }

      if (event.acceleration !== undefined) {
        accelerations.push(event.acceleration);
      }

      // Calculate trajectory angles
      if (i > 1 && event.eventType === 'move') {
        const prev1 = events[i - 1];
        const prev2 = events[i - 2];
        
        if (prev1.eventType === 'move' && prev2.eventType === 'move') {
          const angle1 = Math.atan2(prev1.y - prev2.y, prev1.x - prev2.x);
          const angle2 = Math.atan2(event.y - prev1.y, event.x - prev1.x);
          const angleDiff = Math.abs(angle2 - angle1);
          trajectoryAngles.push(angleDiff);
        }
      }

      // Collect click patterns
      if (event.eventType === 'click') {
        if (lastClickTime > 0) {
          clickIntervals.push(event.timestamp - lastClickTime);
        }
        lastClickTime = event.timestamp;
      }

      // Collect scroll patterns
      if (event.eventType === 'scroll') {
        if (scrollPatterns.length > 0) {
          const lastScroll = events.slice(0, i).reverse().find(e => e.eventType === 'scroll');
          if (lastScroll) {
            scrollPatterns.push(event.timestamp - lastScroll.timestamp);
          }
        }
      }

      // Calculate pause durations
      if (event.eventType === 'move') {
        if (lastMoveTime > 0) {
          const interval = event.timestamp - lastMoveTime;
          if (interval > 100) { // Pause longer than 100ms
            pauseDurations.push(interval);
          }
        }
        lastMoveTime = event.timestamp;
      }
    }

    // Calculate movement smoothing ratio
    movementSmoothing = smoothMovements / Math.max(smoothMovements + jitterMovements, 1);

    return {
      velocity: this.calculateStatisticalMeasures(velocities),
      acceleration: this.calculateStatisticalMeasures(accelerations),
      trajectoryAngles: this.calculateStatisticalMeasures(trajectoryAngles),
      clickPatterns: this.calculateStatisticalMeasures(clickIntervals),
      scrollingBehavior: this.calculateStatisticalMeasures(scrollPatterns),
      pauseDuration: this.calculateStatisticalMeasures(pauseDurations),
      movementSmoothing
    };
  }

  /**
   * Build behavioral pattern profile from session data
   */
  private async buildBehavioralPatternProfile(
    session: AuthenticationSession
  ): Promise<BehavioralPatternProfile> {
    const sessionDuration = Date.now() - session.startTime;
    const activityPattern = new Map<number, number>();
    
    // Calculate activity by hour
    const startHour = new Date(session.startTime).getHours();
    activityPattern.set(startHour, (activityPattern.get(startHour) || 0) + 1);

    // Calculate error patterns (backspace usage)
    const errorEvents = session.keystrokeEvents.filter(e => 
      e.key === 'Backspace' || e.key === 'Delete'
    );
    const errorRate = errorEvents.length / Math.max(session.keystrokeEvents.length, 1);

    // Calculate interaction frequency
    const totalEvents = session.keystrokeEvents.length + session.mouseEvents.length;
    const interactionFrequency = totalEvents / Math.max(sessionDuration / 1000, 1); // Events per second

    return {
      sessionDuration: this.calculateStatisticalMeasures([sessionDuration]),
      activityPattern,
      errorRate: this.calculateStatisticalMeasures([errorRate]),
      interactionFrequency: this.calculateStatisticalMeasures([interactionFrequency]),
      multitaskingPattern: this.calculateStatisticalMeasures([0]), // Placeholder
      focusMetrics: this.calculateStatisticalMeasures([0]) // Placeholder
    };
  }

  /**
   * Analyze keystroke dynamics against profile
   */
  private async analyzeKeystrokeDynamics(
    session: AuthenticationSession,
    profile: BiometricProfile
  ): Promise<{ confidence: number; anomalies: string[] }> {
    const anomalies: string[] = [];
    let totalScore = 0;
    let scoreCount = 0;

    // Analyze recent keystroke events
    const recentEvents = session.keystrokeEvents.slice(-50); // Last 50 events
    
    // Build temporary profile from recent events
    const tempProfile = await this.buildKeystrokeDynamicsProfile(recentEvents);

    // Compare dwell times
    for (const [key, measures] of tempProfile.dwellTimes) {
      const profileMeasures = profile.keystrokeDynamics.dwellTimes.get(key);
      if (profileMeasures) {
        const deviation = Math.abs(measures.mean - profileMeasures.mean) / profileMeasures.stdDev;
        
        if (deviation > 2) { // More than 2 standard deviations
          anomalies.push(`DWELL_TIME_ANOMALY_${key}`);
        }
        
        totalScore += Math.max(0, 1 - (deviation / 3)); // Normalize to 0-1
        scoreCount++;
      }
    }

    // Compare typing rhythm
    const rhythmDeviation = Math.abs(
      tempProfile.typingRhythm.mean - profile.keystrokeDynamics.typingRhythm.mean
    ) / profile.keystrokeDynamics.typingRhythm.stdDev;
    
    if (rhythmDeviation > 2) {
      anomalies.push('TYPING_RHYTHM_ANOMALY');
    }
    
    totalScore += Math.max(0, 1 - (rhythmDeviation / 3));
    scoreCount++;

    // Compare common digraphs
    for (const [digraph, measures] of tempProfile.commonDigraphs) {
      const profileMeasures = profile.keystrokeDynamics.commonDigraphs.get(digraph);
      if (profileMeasures) {
        const deviation = Math.abs(measures.mean - profileMeasures.mean) / profileMeasures.stdDev;
        
        if (deviation > 2.5) {
          anomalies.push(`DIGRAPH_TIMING_ANOMALY_${digraph}`);
        }
        
        totalScore += Math.max(0, 1 - (deviation / 3));
        scoreCount++;
      }
    }

    const confidence = scoreCount > 0 ? totalScore / scoreCount : 0;
    
    return { confidence, anomalies };
  }

  /**
   * Analyze mouse movement against profile
   */
  private async analyzeMouseMovement(
    session: AuthenticationSession,
    profile: BiometricProfile
  ): Promise<{ confidence: number; anomalies: string[] }> {
    const anomalies: string[] = [];
    let totalScore = 0;
    let scoreCount = 0;

    // Analyze recent mouse events
    const recentEvents = session.mouseEvents.slice(-100); // Last 100 events
    
    if (recentEvents.length === 0) {
      return { confidence: 0.5, anomalies: ['NO_MOUSE_DATA'] }; // Neutral if no mouse data
    }

    // Build temporary profile from recent events
    const tempProfile = await this.buildMouseMovementProfile(recentEvents);

    // Compare velocity patterns
    const velocityDeviation = Math.abs(
      tempProfile.velocity.mean - profile.mouseMovement.velocity.mean
    ) / profile.mouseMovement.velocity.stdDev;
    
    if (velocityDeviation > 2) {
      anomalies.push('MOUSE_VELOCITY_ANOMALY');
    }
    
    totalScore += Math.max(0, 1 - (velocityDeviation / 3));
    scoreCount++;

    // Compare acceleration patterns
    const accelerationDeviation = Math.abs(
      tempProfile.acceleration.mean - profile.mouseMovement.acceleration.mean
    ) / profile.mouseMovement.acceleration.stdDev;
    
    if (accelerationDeviation > 2) {
      anomalies.push('MOUSE_ACCELERATION_ANOMALY');
    }
    
    totalScore += Math.max(0, 1 - (accelerationDeviation / 3));
    scoreCount++;

    // Compare movement smoothing
    const smoothingDiff = Math.abs(
      tempProfile.movementSmoothing - profile.mouseMovement.movementSmoothing
    );
    
    if (smoothingDiff > 0.3) {
      anomalies.push('MOUSE_SMOOTHING_ANOMALY');
    }
    
    totalScore += Math.max(0, 1 - (smoothingDiff / 0.5));
    scoreCount++;

    const confidence = scoreCount > 0 ? totalScore / scoreCount : 0;
    
    return { confidence, anomalies };
  }

  /**
   * Analyze behavioral patterns against profile
   */
  private async analyzeBehavioralPattern(
    session: AuthenticationSession,
    profile: BiometricProfile
  ): Promise<{ confidence: number; anomalies: string[] }> {
    const anomalies: string[] = [];
    let totalScore = 0;
    let scoreCount = 0;

    // Build current session behavioral profile
    const tempProfile = await this.buildBehavioralPatternProfile(session);

    // Compare session duration patterns
    const currentDuration = Date.now() - session.startTime;
    const durationDeviation = Math.abs(
      currentDuration - profile.behavioralPattern.sessionDuration.mean
    ) / profile.behavioralPattern.sessionDuration.stdDev;
    
    if (durationDeviation > 2) {
      anomalies.push('SESSION_DURATION_ANOMALY');
    }
    
    totalScore += Math.max(0, 1 - (durationDeviation / 3));
    scoreCount++;

    // Compare activity patterns (time of day)
    const currentHour = new Date().getHours();
    const expectedActivity = profile.behavioralPattern.activityPattern.get(currentHour) || 0;
    
    if (expectedActivity === 0) {
      anomalies.push('UNUSUAL_ACTIVITY_TIME');
      totalScore += 0.3; // Low but not zero score for unusual time
    } else {
      totalScore += 0.8; // Good score for expected time
    }
    scoreCount++;

    // Compare error rates
    const errorDeviation = Math.abs(
      tempProfile.errorRate.mean - profile.behavioralPattern.errorRate.mean
    ) / Math.max(profile.behavioralPattern.errorRate.stdDev, 0.01);
    
    if (errorDeviation > 2) {
      anomalies.push('ERROR_RATE_ANOMALY');
    }
    
    totalScore += Math.max(0, 1 - (errorDeviation / 3));
    scoreCount++;

    const confidence = scoreCount > 0 ? totalScore / scoreCount : 0;
    
    return { confidence, anomalies };
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

    // Calculate risk score (inverse of confidence with anomaly penalties)
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
      const recentKeystroke = await this.buildKeystrokeDynamicsProfile(
        session.keystrokeEvents.slice(-50)
      );
      const recentMouse = await this.buildMouseMovementProfile(
        session.mouseEvents.slice(-100)
      );
      const recentBehavioral = await this.buildBehavioralPatternProfile(session);

      // Update profiles with exponential moving average
      const alpha = this.config.updateThreshold; // Learning rate
      
      // Update keystroke dynamics
      this.updateStatisticalMeasures(profile.keystrokeDynamics.typingRhythm, recentKeystroke.typingRhythm, alpha);
      
      // Update mouse movement
      this.updateStatisticalMeasures(profile.mouseMovement.velocity, recentMouse.velocity, alpha);
      this.updateStatisticalMeasures(profile.mouseMovement.acceleration, recentMouse.acceleration, alpha);
      
      // Update behavioral patterns
      this.updateStatisticalMeasures(profile.behavioralPattern.errorRate, recentBehavioral.errorRate, alpha);
      this.updateStatisticalMeasures(profile.behavioralPattern.interactionFrequency, recentBehavioral.interactionFrequency, alpha);

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
   * Helper method to calculate statistical measures
   */
  private calculateStatisticalMeasures(values: number[]): StatisticalMeasures {
    if (values.length === 0) {
      return { mean: 0, stdDev: 0, min: 0, max: 0, samples: 0, confidence: 0 };
    }

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const confidence = Math.min(values.length / this.config.minSampleSize, 1.0);

    return { mean, stdDev, min, max, samples: values.length, confidence };
  }

  /**
   * Helper method to convert maps to statistical measures
   */
  private convertToStatisticalMeasures(
    dataMap: Map<string, number[]>
  ): Map<string, StatisticalMeasures> {
    const result = new Map<string, StatisticalMeasures>();
    
    for (const [key, values] of dataMap) {
      result.set(key, this.calculateStatisticalMeasures(values));
    }
    
    return result;
  }

  /**
   * Update statistical measures with exponential moving average
   */
  private updateStatisticalMeasures(
    existing: StatisticalMeasures,
    newData: StatisticalMeasures,
    alpha: number
  ): void {
    if (newData.samples === 0) return;

    existing.mean = existing.mean * (1 - alpha) + newData.mean * alpha;
    existing.stdDev = existing.stdDev * (1 - alpha) + newData.stdDev * alpha;
    existing.samples += newData.samples;
    existing.confidence = Math.min(existing.samples / this.config.minSampleSize, 1.0);
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

      // Process batch of events
      await Promise.all(
        batch.map(event => this.processEventForLearning(event))
      );

    } catch (error) {
      this.logger.error('ConsciousnessAuth: Event processing failed', error);
    } finally {
      this.isProcessing = false;
      
      // Continue processing if there are more events
      if (this.processingQueue.length > 0) {
        setImmediate(() => this.processEventQueue());
      }
    }
  }

  /**
   * Process individual event for continuous learning
   */
  private async processEventForLearning(event: KeystrokeEvent | MouseEvent): Promise<void> {
    // This would implement continuous learning algorithms
    // For now, we just emit the event for external processing
    this.emit('event_processed', event);
  }

  /**
   * Load existing biometric profiles (placeholder for database integration)
   */
  private async loadExistingProfiles(): Promise<void> {
    // In production, this would load profiles from persistent storage
    this.logger.info('ConsciousnessAuth: Loaded existing biometric profiles');
  }

  /**
   * Start background cleanup routine
   */
  private startCleanupRoutine(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 300000); // Run every 5 minutes
  }

  /**
   * Perform periodic cleanup
   */
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
    // Start the event processing loop
    setImmediate(() => this.processEventQueue());
  }

  /**
   * End authentication session
   */
  public async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.activeSessions.delete(sessionId);
      this.emit('session_ended', { sessionId, userId: session.userId });
      this.logger.info(`ConsciousnessAuth: Ended session ${sessionId}`);
    }
  }

  /**
   * Get authentication statistics
   */
  public getStats() {
    return {
      activeProfiles: this.biometricProfiles.size,
      activeSessions: Array.from(this.activeSessions.values()).filter(s => s.isActive).length,
      processingQueueSize: this.processingQueue.length,
      isProcessing: this.isProcessing,
      config: this.config
    };
  }

  /**
   * Shutdown the authentication engine
   */
  public async shutdown(): Promise<void> {
    try {
      // Clear cleanup interval
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = undefined;
      }

      // End all active sessions
      for (const sessionId of this.activeSessions.keys()) {
        await this.endSession(sessionId);
      }

      // Clear processing queue
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
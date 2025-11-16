/**
 * SOAR Engine - Security Orchestration, Automation, and Response
 * Automated incident response with playbook-based execution
 */

import { EventEmitter } from 'events';
import { Logger } from '../utils/logger.js';
import type {
  Incident,
  IncidentType,
  Playbook,
  PlaybookAction,
  PlaybookExecution,
  ActionResult,
  NotificationChannel,
  EscalationRule
} from './types.js';

export class SOAREngine extends EventEmitter {
  private logger: Logger;
  private playbooks: Map<string, Playbook>;
  private executions: Map<string, PlaybookExecution>;
  private notificationChannels: Map<string, NotificationChannel>;
  private escalationRules: EscalationRule[];
  private actionRegistry: Map<string, PlaybookAction>;

  constructor() {
    super();
    this.logger = new Logger('soar-engine');
    this.playbooks = new Map();
    this.executions = new Map();
    this.notificationChannels = new Map();
    this.escalationRules = [];
    this.actionRegistry = new Map();

    // Initialize actions BEFORE playbooks (playbooks reference actions)
    this.initializeDefaultActions();
    this.initializeDefaultPlaybooks();
  }

  /**
   * Main entry point - respond to an incident
   */
  async respondToIncident(incident: Incident): Promise<PlaybookExecution> {
    this.logger.info('Responding to incident', { incidentId: incident.id, type: incident.type });

    try {
      // Select appropriate playbook
      const playbook = this.selectPlaybook(incident);

      if (!playbook) {
        this.logger.warn('No playbook found for incident', { type: incident.type });
        throw new Error(`No playbook available for incident type: ${incident.type}`);
      }

      // Create execution context
      const execution: PlaybookExecution = {
        id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        playbookId: playbook.id,
        incidentId: incident.id,
        startTime: Date.now(),
        status: 'running',
        actionResults: new Map(),
        errors: []
      };

      this.executions.set(execution.id, execution);
      this.emit('execution:started', execution);

      // Execute playbook
      await this.executePlaybook(playbook, incident, execution);

      // Finalize execution
      execution.endTime = Date.now();
      execution.status = execution.errors.length > 0 ? 'partial' : 'completed';

      this.emit('execution:completed', execution);
      this.logger.info('Playbook execution completed', {
        executionId: execution.id,
        duration: execution.endTime - execution.startTime,
        status: execution.status
      });

      // Send notifications
      await this.notifyStakeholders(incident, execution);

      return execution;

    } catch (error) {
      this.logger.error('Failed to respond to incident', {
        error: error instanceof Error ? error.message : String(error),
        incidentId: incident.id
      });
      throw error;
    }
  }

  /**
   * Select the most appropriate playbook for an incident
   */
  private selectPlaybook(incident: Incident): Playbook | null {
    // Find playbooks matching the incident type
    const candidates = Array.from(this.playbooks.values()).filter(pb =>
      pb.incidentTypes.includes(incident.type)
    );

    if (candidates.length === 0) {
      return null;
    }

    // Select based on conditions if available
    for (const playbook of candidates) {
      if (this.evaluateConditions(playbook, incident)) {
        return playbook;
      }
    }

    // Return first matching playbook if no conditions match
    return candidates[0];
  }

  /**
   * Evaluate playbook conditions
   */
  private evaluateConditions(playbook: Playbook, incident: Incident): boolean {
    if (!playbook.conditions || playbook.conditions.length === 0) {
      return true;
    }

    return playbook.conditions.every(condition => {
      const incidentValue = (incident as any)[condition.field];

      switch (condition.operator) {
        case 'equals':
          return incidentValue === condition.value;
        case 'contains':
          return Array.isArray(incidentValue)
            ? incidentValue.includes(condition.value)
            : String(incidentValue).includes(String(condition.value));
        case 'greaterThan':
          return incidentValue > condition.value;
        case 'lessThan':
          return incidentValue < condition.value;
        default:
          return false;
      }
    });
  }

  /**
   * Execute a playbook's actions
   */
  private async executePlaybook(
    playbook: Playbook,
    incident: Incident,
    execution: PlaybookExecution
  ): Promise<void> {
    this.logger.info('Executing playbook', {
      playbookId: playbook.id,
      actionsCount: playbook.actions.length,
      parallel: playbook.parallelExecution
    });

    if (playbook.parallelExecution) {
      // Execute actions in parallel
      await Promise.allSettled(
        playbook.actions.map(action =>
          this.executeAction(action, incident, execution)
        )
      );
    } else {
      // Execute actions sequentially
      for (const action of playbook.actions) {
        await this.executeAction(action, incident, execution);
      }
    }
  }

  /**
   * Execute a single action with retry logic
   */
  private async executeAction(
    action: PlaybookAction,
    incident: Incident,
    execution: PlaybookExecution
  ): Promise<ActionResult> {
    const maxRetries = action.retries || 3;
    const timeout = action.timeout || 30000;

    this.logger.info('Executing action', { actionId: action.id, actionName: action.name });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();

        // Execute with timeout
        const result = await Promise.race([
          action.execute(incident),
          this.createTimeout(timeout, action.name)
        ]);

        result.duration = Date.now() - startTime;

        execution.actionResults.set(action.id, result);
        this.emit('action:completed', { action, result, incident });

        if (result.success) {
          this.logger.info('Action completed successfully', {
            actionId: action.id,
            duration: result.duration
          });
          return result;
        } else {
          throw new Error(result.message);
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.logger.error('Action failed', {
          actionId: action.id,
          attempt,
          error: errorMsg
        });

        if (attempt === maxRetries) {
          const failedResult: ActionResult = {
            success: false,
            message: `Action failed after ${maxRetries} attempts: ${errorMsg}`,
            duration: 0,
            errors: [errorMsg]
          };

          execution.actionResults.set(action.id, failedResult);
          execution.errors.push(`${action.name}: ${errorMsg}`);
          this.emit('action:failed', { action, error: errorMsg, incident });

          return failedResult;
        }

        // Wait before retry (exponential backoff)
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }

    // Should never reach here
    throw new Error('Unexpected execution path');
  }

  /**
   * Create a timeout promise
   */
  private createTimeout(ms: number, actionName: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Action timeout after ${ms}ms: ${actionName}`)), ms);
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Notify stakeholders about incident and response
   */
  private async notifyStakeholders(
    incident: Incident,
    execution: PlaybookExecution
  ): Promise<void> {
    const escalationRule = this.escalationRules.find(
      rule => rule.severity === incident.severity
    );

    if (!escalationRule) {
      return;
    }

    const message = this.formatNotificationMessage(incident, execution);

    for (const channel of escalationRule.notificationChannels) {
      if (channel.enabled) {
        try {
          await this.sendNotification(channel, message);
        } catch (error) {
          this.logger.error('Failed to send notification', {
            channel: channel.type,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }
  }

  /**
   * Format notification message
   */
  private formatNotificationMessage(
    incident: Incident,
    execution: PlaybookExecution
  ): string {
    const successActions = Array.from(execution.actionResults.values())
      .filter(r => r.success).length;
    const totalActions = execution.actionResults.size;

    return `
🚨 INCIDENT RESPONSE COMPLETED

Incident ID: ${incident.id}
Type: ${incident.type}
Severity: ${incident.severity.toUpperCase()}
Status: ${incident.status}

Playbook Execution:
- Execution ID: ${execution.id}
- Duration: ${execution.endTime ? (execution.endTime - execution.startTime) / 1000 : 0}s
- Actions Completed: ${successActions}/${totalActions}
- Status: ${execution.status}

${execution.errors.length > 0 ? `\n⚠️ Errors:\n${execution.errors.join('\n')}` : '✅ All actions completed successfully'}

Affected Resources:
- Hosts: ${incident.hosts.join(', ')}
- Users: ${incident.users.join(', ')}

Next Steps:
${incident.status === 'contained' ? '- Continue monitoring\n- Prepare forensics report' : '- Escalate to security team'}
    `.trim();
  }

  /**
   * Send notification through channel
   */
  private async sendNotification(
    channel: NotificationChannel,
    message: string
  ): Promise<void> {
    this.logger.info('Sending notification', { channel: channel.type });

    switch (channel.type) {
      case 'slack':
        // Would integrate with Slack API
        this.logger.info('Slack notification sent', { message: message.substring(0, 100) });
        break;
      case 'email':
        // Would integrate with email service
        this.logger.info('Email notification sent');
        break;
      case 'pagerduty':
        // Would integrate with PagerDuty API
        this.logger.info('PagerDuty alert created');
        break;
      case 'webhook':
        // Would send HTTP POST to webhook
        this.logger.info('Webhook triggered');
        break;
      case 'sms':
        // Would send SMS
        this.logger.info('SMS sent');
        break;
    }
  }

  /**
   * Register a custom action
   */
  registerAction(action: PlaybookAction): void {
    this.actionRegistry.set(action.id, action);
    this.logger.info('Action registered', { actionId: action.id, name: action.name });
  }

  /**
   * Register a custom playbook
   */
  registerPlaybook(playbook: Playbook): void {
    this.playbooks.set(playbook.id, playbook);
    this.logger.info('Playbook registered', {
      playbookId: playbook.id,
      name: playbook.name,
      types: playbook.incidentTypes
    });
  }

  /**
   * Add escalation rule
   */
  addEscalationRule(rule: EscalationRule): void {
    this.escalationRules.push(rule);
    this.logger.info('Escalation rule added', { severity: rule.severity });
  }

  /**
   * Add notification channel
   */
  addNotificationChannel(id: string, channel: NotificationChannel): void {
    this.notificationChannels.set(id, channel);
    this.logger.info('Notification channel added', { id, type: channel.type });
  }

  /**
   * Get execution status
   */
  getExecution(executionId: string): PlaybookExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Initialize default actions
   */
  private initializeDefaultActions(): void {
    // Isolation actions
    this.registerAction({
      id: 'isolate-host',
      name: 'Isolate Host',
      description: 'Disconnect host from network',
      execute: async (incident) => {
        await this.sleep(500); // Simulate network operation
        return {
          success: true,
          message: `Isolated ${incident.hosts.length} hosts from network`,
          duration: 0,
          data: { isolatedHosts: incident.hosts }
        };
      }
    });

    this.registerAction({
      id: 'block-ip',
      name: 'Block IP Addresses',
      description: 'Add IPs to firewall blocklist',
      execute: async (incident) => {
        await this.sleep(300);
        return {
          success: true,
          message: `Blocked ${incident.sourceIPs.length} IP addresses`,
          duration: 0,
          data: { blockedIPs: incident.sourceIPs }
        };
      }
    });

    // Forensics actions
    this.registerAction({
      id: 'snapshot-forensics',
      name: 'Create Forensic Snapshot',
      description: 'Capture memory and disk snapshots',
      execute: async (incident) => {
        await this.sleep(2000); // Simulate snapshot creation
        return {
          success: true,
          message: `Created forensic snapshots for ${incident.hosts.length} hosts`,
          duration: 0,
          data: { snapshotIds: incident.hosts.map(h => `snap-${h}-${Date.now()}`) }
        };
      }
    });

    // Communication blocking
    this.registerAction({
      id: 'block-c2',
      name: 'Block C2 Communications',
      description: 'Block command and control server communications',
      execute: async (incident) => {
        await this.sleep(400);
        const c2Count = incident.c2Servers?.length || 0;
        return {
          success: true,
          message: `Blocked ${c2Count} C2 servers`,
          duration: 0,
          data: { blockedServers: incident.c2Servers }
        };
      }
    });

    // Data protection
    this.registerAction({
      id: 'backup-recovery',
      name: 'Initiate Backup Recovery',
      description: 'Start recovery from clean backups',
      execute: async (incident) => {
        await this.sleep(1000);
        return {
          success: true,
          message: `Initiated recovery for ${incident.affectedData.length} data sets`,
          duration: 0,
          data: { recoveryJobs: incident.affectedData.map(d => `job-${d}`) }
        };
      }
    });

    // DDoS mitigation
    this.registerAction({
      id: 'enable-rate-limiting',
      name: 'Enable Rate Limiting',
      description: 'Activate aggressive rate limiting',
      execute: async (incident) => {
        await this.sleep(200);
        return {
          success: true,
          message: `Rate limiting enabled for ${incident.targetIPs.length} targets`,
          duration: 0
        };
      }
    });

    this.registerAction({
      id: 'activate-cdn',
      name: 'Activate CDN Protection',
      description: 'Enable CDN with DDoS mitigation',
      execute: async (incident) => {
        await this.sleep(500);
        return {
          success: true,
          message: `CDN activated for ${incident.targetDomains.length} domains`,
          duration: 0
        };
      }
    });

    // Notification actions
    this.registerAction({
      id: 'notify-stakeholders',
      name: 'Notify Stakeholders',
      description: 'Send incident notifications',
      execute: async (incident) => {
        await this.sleep(100);
        return {
          success: true,
          message: 'Stakeholders notified',
          duration: 0
        };
      }
    });
  }

  /**
   * Initialize default playbooks
   */
  private initializeDefaultPlaybooks(): void {
    // Ransomware playbook
    this.registerPlaybook({
      id: 'playbook-ransomware',
      name: 'Ransomware Response',
      description: 'Automated response to ransomware incidents',
      incidentTypes: ['ransomware' as IncidentType],
      actions: [
        this.createAction('isolate-host'),
        this.createAction('block-c2'),
        this.createAction('snapshot-forensics'),
        this.createAction('notify-stakeholders'),
        this.createAction('backup-recovery')
      ],
      parallelExecution: false
    });

    // DDoS playbook
    this.registerPlaybook({
      id: 'playbook-ddos',
      name: 'DDoS Mitigation',
      description: 'Automated DDoS attack mitigation',
      incidentTypes: ['ddos' as IncidentType],
      actions: [
        this.createAction('enable-rate-limiting'),
        this.createAction('activate-cdn'),
        this.createAction('block-ip'),
        this.createAction('notify-stakeholders')
      ],
      parallelExecution: true
    });

    // Data breach playbook
    this.registerPlaybook({
      id: 'playbook-data-breach',
      name: 'Data Breach Response',
      description: 'Response to data breach incidents',
      incidentTypes: ['data_breach' as IncidentType],
      actions: [
        this.createAction('isolate-host'),
        this.createAction('snapshot-forensics'),
        this.createAction('block-ip'),
        this.createAction('notify-stakeholders')
      ],
      parallelExecution: false
    });
  }

  /**
   * Helper to create action reference
   */
  private createAction(actionId: string): PlaybookAction {
    const action = this.actionRegistry.get(actionId);
    if (!action) {
      throw new Error(`Action not found: ${actionId}`);
    }
    return action;
  }
}

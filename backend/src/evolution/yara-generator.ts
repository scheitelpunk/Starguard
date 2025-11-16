/**
 * YARA Rule Generator for defense organisms
 * Converts defense organisms into YARA detection rules
 */

import { DefenseOrganism, DefenseGene, YARARule, YARAString } from '../ml-security/adaptive-policies-types';

export class YARAGenerator {
  constructor(
    private yaraComplexityLimit: number = 20,
    private logger = console
  ) {}

  /**
   * Generate YARA rule from defense organism
   */
  public async generateYARARule(organism: DefenseOrganism): Promise<YARARule> {
    try {
      const ruleName = `defense_rule_${organism.id.substring(0, 8)}_gen${organism.generation}`;
      const strings: YARAString[] = [];
      const conditions: string[] = [];

      // Extract patterns from genes
      for (const gene of organism.genes) {
        const stringName = `$${gene.type.toLowerCase()}_${gene.id.substring(0, 6)}`;

        let yaraString: YARAString;

        switch (gene.type) {
          case 'SIGNATURE':
            yaraString = {
              name: stringName,
              type: 'hex',
              value: this.convertSequenceToHex(gene.sequence),
              modifiers: ['nocase']
            };
            break;

          case 'BEHAVIOR':
            yaraString = {
              name: stringName,
              type: 'regex',
              value: this.convertSequenceToBehaviorRegex(gene.sequence),
              modifiers: ['ascii', 'wide']
            };
            break;

          case 'NETWORK':
            yaraString = {
              name: stringName,
              type: 'text',
              value: this.convertSequenceToNetworkPattern(gene.sequence),
              modifiers: ['nocase']
            };
            break;

          case 'HEURISTIC':
            yaraString = {
              name: stringName,
              type: 'regex',
              value: this.convertSequenceToHeuristicPattern(gene.sequence),
              modifiers: ['nocase']
            };
            break;

          default:
            continue;
        }

        strings.push(yaraString);

        // Build condition based on gene strength
        if (gene.strength > 0.8) {
          conditions.push(stringName);
        } else {
          conditions.push(`(${stringName})`);
        }
      }

      // Construct rule condition with fitness-based logic
      let ruleCondition: string;

      if (organism.fitness > 0.9) {
        const strongPatterns = conditions.slice(0, Math.min(3, conditions.length));
        ruleCondition = `any of (${strongPatterns.join(', ')})`;
      } else if (organism.fitness > 0.7) {
        ruleCondition = `2 of them`;
      } else {
        ruleCondition = `any of them`;
      }

      const yaraRule: YARARule = {
        name: ruleName,
        tags: [
          'generated',
          'defense_dna',
          `gen_${organism.generation}`,
          `fitness_${Math.floor(organism.fitness * 100)}`
        ],
        meta: {
          description: `Auto-generated defense rule from organism ${organism.id}`,
          author: 'DefenseDNA',
          date: new Date().toISOString(),
          generation: organism.generation.toString(),
          fitness: organism.fitness.toString(),
          detection_rate: organism.performance.detectionRate.toString(),
          false_positive_rate: organism.performance.falsePositiveRate.toString(),
          lineage: organism.lineage.join(' -> ')
        },
        strings,
        condition: ruleCondition,
        generated: Date.now(),
        fitness: organism.fitness
      };

      // Validate rule complexity
      if (this.calculateYARARuleComplexity(yaraRule) > this.yaraComplexityLimit) {
        yaraRule.strings = yaraRule.strings.slice(0, Math.floor(this.yaraComplexityLimit / 2));
        yaraRule.condition = 'any of them';
      }

      return yaraRule;

    } catch (error) {
      this.logger.error('YARAGenerator: YARA rule generation failed', error);
      throw error;
    }
  }

  /**
   * Get unique YARA rules
   */
  public getUniqueRules(rules: YARARule[]): YARARule[] {
    const unique = new Map<string, YARARule>();
    for (const rule of rules) {
      const key = rule.strings.map(s => s.value).join('|');
      if (!unique.has(key) || unique.get(key)!.fitness < rule.fitness) {
        unique.set(key, rule);
      }
    }
    return Array.from(unique.values());
  }

  /**
   * Convert sequence to hex format
   */
  private convertSequenceToHex(sequence: string): string {
    return sequence.replace(/[^0-9A-Fa-f]/g, '').match(/.{1,2}/g)?.join(' ') || sequence;
  }

  /**
   * Convert sequence to behavior regex
   */
  private convertSequenceToBehaviorRegex(sequence: string): string {
    return sequence.replace(/_/g, '\\w+').toLowerCase();
  }

  /**
   * Convert sequence to network pattern
   */
  private convertSequenceToNetworkPattern(sequence: string): string {
    return sequence.replace(/[|]/g, ' | ');
  }

  /**
   * Convert sequence to heuristic pattern
   */
  private convertSequenceToHeuristicPattern(sequence: string): string {
    return `(${sequence.toLowerCase().replace(/_/g, '|')})`;
  }

  /**
   * Calculate YARA rule complexity
   */
  private calculateYARARuleComplexity(rule: YARARule): number {
    return rule.strings.length + rule.condition.split(' ').length;
  }
}

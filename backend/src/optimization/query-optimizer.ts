import { Logger } from '../utils/logger.js';

export interface QueryPlan {
  query: string;
  params: any[];
  useIndex?: string;
  estimatedRows: number;
  estimatedCost: number;
}

export interface IndexDefinition {
  table: string;
  columns: string[];
  unique?: boolean;
  name?: string;
}

/**
 * QueryOptimizer - Database query optimization
 *
 * Features:
 * - Query plan analysis
 * - Index recommendations
 * - Query rewriting
 * - Pagination optimization
 * - Slow query detection
 */
export class QueryOptimizer {
  private logger: Logger;
  private slowQueryThreshold: number = 1000; // ms
  private queryStats: Map<string, {
    count: number;
    totalTime: number;
    avgTime: number;
    maxTime: number;
    minTime: number;
  }> = new Map();

  // Common indexes for Starguard tables
  private recommendedIndexes: IndexDefinition[] = [
    // Threats table
    { table: 'threats', columns: ['severity', 'timestamp'] },
    { table: 'threats', columns: ['source'] },
    { table: 'threats', columns: ['type'] },
    { table: 'threats', columns: ['timestamp'] },
    { table: 'threats', columns: ['userId', 'timestamp'] },

    // Biometric profiles table
    { table: 'biometric_profiles', columns: ['userId'], unique: true },
    { table: 'biometric_profiles', columns: ['lastUpdated'] },
    { table: 'biometric_profiles', columns: ['created'] },

    // Logs table
    { table: 'logs', columns: ['timestamp'] },
    { table: 'logs', columns: ['level', 'timestamp'] },
    { table: 'logs', columns: ['source'] },

    // Sessions table
    { table: 'sessions', columns: ['userId'] },
    { table: 'sessions', columns: ['sessionId'], unique: true },
    { table: 'sessions', columns: ['expiresAt'] },

    // Quantum events table
    { table: 'quantum_events', columns: ['timestamp'] },
    { table: 'quantum_events', columns: ['type', 'timestamp'] },
    { table: 'quantum_events', columns: ['severity'] },
  ];

  constructor() {
    this.logger = new Logger('query-optimizer');
  }

  /**
   * Get index creation SQL for all recommended indexes
   */
  getIndexCreationSQL(): string[] {
    const statements: string[] = [];

    for (const index of this.recommendedIndexes) {
      const indexName = index.name || `idx_${index.table}_${index.columns.join('_')}`;
      const unique = index.unique ? 'UNIQUE ' : '';
      const columns = index.columns.join(', ');

      statements.push(
        `CREATE ${unique}INDEX IF NOT EXISTS ${indexName} ON ${index.table} (${columns})`
      );
    }

    return statements;
  }

  /**
   * Optimize query with pagination
   */
  optimizePagination(
    baseQuery: string,
    page: number,
    pageSize: number,
    orderBy: string = 'id DESC'
  ): QueryPlan {
    const offset = (page - 1) * pageSize;

    // Use LIMIT/OFFSET with proper ordering
    const optimizedQuery = `
      ${baseQuery}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    return {
      query: optimizedQuery,
      params: [pageSize, offset],
      estimatedRows: pageSize,
      estimatedCost: offset + pageSize,
    };
  }

  /**
   * Optimize query with cursor-based pagination (more efficient)
   */
  optimizeCursorPagination(
    baseQuery: string,
    lastId: number | null,
    pageSize: number,
    orderColumn: string = 'id',
    orderDirection: 'ASC' | 'DESC' = 'DESC'
  ): QueryPlan {
    let optimizedQuery: string;
    let params: any[];

    if (lastId === null) {
      // First page
      optimizedQuery = `
        ${baseQuery}
        ORDER BY ${orderColumn} ${orderDirection}
        LIMIT ?
      `;
      params = [pageSize];
    } else {
      // Subsequent pages
      const operator = orderDirection === 'DESC' ? '<' : '>';
      optimizedQuery = `
        ${baseQuery}
        AND ${orderColumn} ${operator} ?
        ORDER BY ${orderColumn} ${orderDirection}
        LIMIT ?
      `;
      params = [lastId, pageSize];
    }

    return {
      query: optimizedQuery,
      params,
      estimatedRows: pageSize,
      estimatedCost: pageSize, // Much better than offset
    };
  }

  /**
   * Optimize SELECT query to use covering indexes
   */
  optimizeSelect(
    table: string,
    columns: string[],
    where?: { [key: string]: any },
    limit?: number
  ): QueryPlan {
    // Build SELECT clause
    const selectClause = columns.length > 0 ? columns.join(', ') : '*';

    // Build WHERE clause
    let whereClause = '';
    const params: any[] = [];

    if (where) {
      const conditions = Object.entries(where).map(([key, value]) => {
        params.push(value);
        return `${key} = ?`;
      });
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    // Build query
    let query = `SELECT ${selectClause} FROM ${table} ${whereClause}`;

    if (limit) {
      query += ` LIMIT ?`;
      params.push(limit);
    }

    // Find applicable index
    const applicableIndex = this.findApplicableIndex(table, where ? Object.keys(where) : []);

    return {
      query,
      params,
      useIndex: applicableIndex?.name,
      estimatedRows: limit || 1000,
      estimatedCost: this.estimateQueryCost(table, where, limit),
    };
  }

  /**
   * Find applicable index for query
   */
  private findApplicableIndex(table: string, columns: string[]): IndexDefinition | null {
    if (columns.length === 0) return null;

    // Find indexes for this table
    const tableIndexes = this.recommendedIndexes.filter(idx => idx.table === table);

    // Find best matching index (most columns match from left to right)
    let bestIndex: IndexDefinition | null = null;
    let bestMatchCount = 0;

    for (const index of tableIndexes) {
      let matchCount = 0;
      for (let i = 0; i < Math.min(index.columns.length, columns.length); i++) {
        if (index.columns[i] === columns[i]) {
          matchCount++;
        } else {
          break; // Index columns must match from left
        }
      }

      if (matchCount > bestMatchCount) {
        bestMatchCount = matchCount;
        bestIndex = index;
      }
    }

    return bestIndex;
  }

  /**
   * Estimate query cost
   */
  private estimateQueryCost(
    table: string,
    where?: { [key: string]: any },
    limit?: number
  ): number {
    // Simple heuristic-based cost estimation
    let cost = 100; // Base cost

    if (!where || Object.keys(where).length === 0) {
      cost += 1000; // Full table scan
    } else {
      const indexable = this.findApplicableIndex(table, Object.keys(where));
      if (indexable) {
        cost += 10; // Index seek
      } else {
        cost += 500; // Full table scan with filter
      }
    }

    if (limit) {
      cost = Math.min(cost, limit * 2); // Limit reduces cost
    }

    return cost;
  }

  /**
   * Track query execution time
   */
  trackQuery(query: string, executionTime: number): void {
    const normalizedQuery = this.normalizeQuery(query);
    const stats = this.queryStats.get(normalizedQuery) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      maxTime: 0,
      minTime: Infinity,
    };

    stats.count++;
    stats.totalTime += executionTime;
    stats.avgTime = stats.totalTime / stats.count;
    stats.maxTime = Math.max(stats.maxTime, executionTime);
    stats.minTime = Math.min(stats.minTime, executionTime);

    this.queryStats.set(normalizedQuery, stats);

    // Log slow queries
    if (executionTime > this.slowQueryThreshold) {
      this.logger.warn('Slow query detected', {
        query: normalizedQuery,
        executionTime,
        threshold: this.slowQueryThreshold,
      });
    }
  }

  /**
   * Normalize query for statistics
   */
  private normalizeQuery(query: string): string {
    return query
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\d+/g, '?') // Replace numbers with ?
      .replace(/'[^']*'/g, '?') // Replace strings with ?
      .replace(/"[^"]*"/g, '?'); // Replace quoted strings with ?
  }

  /**
   * Get slow queries
   */
  getSlowQueries(threshold?: number): Array<{ query: string; stats: any }> {
    const thresholdMs = threshold || this.slowQueryThreshold;
    const slowQueries: Array<{ query: string; stats: any }> = [];

    for (const [query, stats] of this.queryStats) {
      if (stats.avgTime > thresholdMs || stats.maxTime > thresholdMs * 2) {
        slowQueries.push({ query, stats });
      }
    }

    // Sort by average time (slowest first)
    slowQueries.sort((a, b) => b.stats.avgTime - a.stats.avgTime);

    return slowQueries;
  }

  /**
   * Get query statistics
   */
  getStats() {
    const allStats: { [key: string]: any } = {};
    let totalQueries = 0;
    let totalTime = 0;

    for (const [query, stats] of this.queryStats) {
      allStats[query] = stats;
      totalQueries += stats.count;
      totalTime += stats.totalTime;
    }

    return {
      totalQueries,
      totalTime,
      avgQueryTime: totalQueries > 0 ? totalTime / totalQueries : 0,
      uniqueQueries: this.queryStats.size,
      slowQueries: this.getSlowQueries().length,
      queries: allStats,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.queryStats.clear();
  }

  /**
   * Optimize batch INSERT
   */
  optimizeBatchInsert(
    table: string,
    columns: string[],
    rows: any[][],
    batchSize: number = 100
  ): QueryPlan[] {
    const plans: QueryPlan[] = [];
    const columnList = columns.join(', ');

    // Split into batches
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const placeholders = batch.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
      const params = batch.flat();

      plans.push({
        query: `INSERT INTO ${table} (${columnList}) VALUES ${placeholders}`,
        params,
        estimatedRows: batch.length,
        estimatedCost: batch.length,
      });
    }

    return plans;
  }

  /**
   * Optimize UPDATE with chunking
   */
  optimizeChunkedUpdate(
    table: string,
    updates: { [key: string]: any },
    where: { [key: string]: any },
    chunkSize: number = 1000
  ): QueryPlan {
    const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const whereClauses = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const params = [...Object.values(updates), ...Object.values(where)];

    const query = `
      UPDATE ${table}
      SET ${setClauses}
      WHERE ${whereClauses}
      LIMIT ?
    `;

    params.push(chunkSize);

    return {
      query,
      params,
      estimatedRows: chunkSize,
      estimatedCost: chunkSize,
    };
  }

  /**
   * Generate SQL for creating all indexes
   */
  async createAllIndexes(db: any): Promise<void> {
    const statements = this.getIndexCreationSQL();

    this.logger.info(`Creating ${statements.length} indexes...`);

    for (const statement of statements) {
      try {
        await db.exec(statement);
        this.logger.debug(`Index created: ${statement}`);
      } catch (error) {
        this.logger.error(`Failed to create index: ${statement}`, error instanceof Error ? error : new Error(String(error)));
      }
    }

    this.logger.info('All indexes created successfully');
  }

  /**
   * Analyze query plan (for SQLite)
   */
  async analyzeQuery(db: any, query: string, params: any[] = []): Promise<any> {
    try {
      const explainQuery = `EXPLAIN QUERY PLAN ${query}`;
      const plan = await db.all(explainQuery, params);

      this.logger.debug('Query plan:', { query, plan });

      return plan;
    } catch (error) {
      this.logger.error('Failed to analyze query', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }
}

export default QueryOptimizer;

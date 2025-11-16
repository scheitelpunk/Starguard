import { Worker } from 'worker_threads';
import { Logger } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface WorkerTask {
  id: string;
  type: 'shannon_entropy' | 'genetic_fitness' | 'biometric_analysis' | 'crypto' | 'transform';
  data: any;
}

export interface WorkerResult {
  id: string;
  result: any;
  error?: string;
  duration: number;
}

interface PendingTask {
  task: WorkerTask;
  resolve: (result: any) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

/**
 * WorkerPool - Manage pool of worker threads for parallel processing
 *
 * Features:
 * - Automatic worker lifecycle management
 * - Task queuing and distribution
 * - Worker health monitoring
 * - Automatic worker restart on failure
 * - Performance metrics
 */
export class WorkerPool {
  private logger: Logger;
  private workers: Worker[] = [];
  private availableWorkers: number[] = [];
  private taskQueue: PendingTask[] = [];
  private pendingTasks: Map<string, PendingTask> = new Map();
  private workerTasks: Map<number, string> = new Map();
  private poolSize: number;
  private workerScript: string;
  private stats = {
    tasksProcessed: 0,
    tasksQueued: 0,
    tasksFailed: 0,
    workersRestarted: 0,
    averageProcessingTime: 0,
  };

  constructor(poolSize: number = 4) {
    this.logger = new Logger('worker-pool');
    this.poolSize = poolSize;
    this.workerScript = path.join(__dirname, 'compute-worker.js');

    this.initialize();
  }

  /**
   * Initialize worker pool
   */
  private initialize(): void {
    for (let i = 0; i < this.poolSize; i++) {
      this.createWorker(i);
    }

    this.logger.info(`Worker pool initialized with ${this.poolSize} workers`);
  }

  /**
   * Create a new worker
   */
  private createWorker(index: number): void {
    try {
      const worker = new Worker(this.workerScript);

      worker.on('message', (result: WorkerResult) => {
        this.handleWorkerResult(index, result);
      });

      worker.on('error', (error) => {
        this.handleWorkerError(index, error);
      });

      worker.on('exit', (code) => {
        this.handleWorkerExit(index, code);
      });

      this.workers[index] = worker;
      this.availableWorkers.push(index);

      this.logger.debug(`Worker ${index} created`);
    } catch (error) {
      this.logger.error(`Failed to create worker ${index}`, error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle worker result
   */
  private handleWorkerResult(workerIndex: number, result: WorkerResult): void {
    const taskId = this.workerTasks.get(workerIndex);
    if (!taskId) {
      this.logger.warn(`Received result for unknown task from worker ${workerIndex}`);
      return;
    }

    const pending = this.pendingTasks.get(taskId);
    if (!pending) {
      this.logger.warn(`No pending task found for ID ${taskId}`);
      return;
    }

    // Update stats
    this.stats.tasksProcessed++;
    const processingTime = Date.now() - pending.timestamp;
    this.stats.averageProcessingTime =
      (this.stats.averageProcessingTime * (this.stats.tasksProcessed - 1) + processingTime) /
      this.stats.tasksProcessed;

    // Clean up
    this.pendingTasks.delete(taskId);
    this.workerTasks.delete(workerIndex);
    this.availableWorkers.push(workerIndex);

    // Resolve or reject promise
    if (result.error) {
      this.stats.tasksFailed++;
      pending.reject(new Error(result.error));
    } else {
      pending.resolve(result.result);
    }

    // Process next task in queue
    this.processNextTask();
  }

  /**
   * Handle worker error
   */
  private handleWorkerError(workerIndex: number, error: Error): void {
    this.logger.error(`Worker ${workerIndex} error`, error);

    const taskId = this.workerTasks.get(workerIndex);
    if (taskId) {
      const pending = this.pendingTasks.get(taskId);
      if (pending) {
        this.stats.tasksFailed++;
        pending.reject(error);
        this.pendingTasks.delete(taskId);
      }
      this.workerTasks.delete(workerIndex);
    }

    // Restart worker
    this.restartWorker(workerIndex);
  }

  /**
   * Handle worker exit
   */
  private handleWorkerExit(workerIndex: number, code: number): void {
    if (code !== 0) {
      this.logger.warn(`Worker ${workerIndex} exited with code ${code}`);
      this.restartWorker(workerIndex);
    }
  }

  /**
   * Restart a worker
   */
  private restartWorker(index: number): void {
    this.logger.info(`Restarting worker ${index}`);
    this.stats.workersRestarted++;

    // Terminate old worker if it exists
    if (this.workers[index]) {
      try {
        this.workers[index].terminate();
      } catch (error) {
        this.logger.error(`Failed to terminate worker ${index}`, error instanceof Error ? error : new Error(String(error)));
      }
    }

    // Remove from available workers
    const availIndex = this.availableWorkers.indexOf(index);
    if (availIndex !== -1) {
      this.availableWorkers.splice(availIndex, 1);
    }

    // Create new worker
    this.createWorker(index);
  }

  /**
   * Execute task in worker pool
   */
  async execute<T = any>(
    type: WorkerTask['type'],
    data: any
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: WorkerTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
      };

      const pending: PendingTask = {
        task,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      this.pendingTasks.set(task.id, pending);

      // Try to assign to available worker
      if (this.availableWorkers.length > 0) {
        this.assignTask(pending);
      } else {
        // Queue task
        this.taskQueue.push(pending);
        this.stats.tasksQueued++;
        this.logger.debug(`Task ${task.id} queued, queue size: ${this.taskQueue.length}`);
      }
    });
  }

  /**
   * Assign task to available worker
   */
  private assignTask(pending: PendingTask): void {
    const workerIndex = this.availableWorkers.shift();
    if (workerIndex === undefined) {
      this.taskQueue.push(pending);
      return;
    }

    const worker = this.workers[workerIndex];
    if (!worker) {
      this.logger.error(`Worker ${workerIndex} not found`);
      this.availableWorkers.push(workerIndex);
      this.taskQueue.push(pending);
      return;
    }

    this.workerTasks.set(workerIndex, pending.task.id);
    worker.postMessage(pending.task);

    this.logger.debug(`Task ${pending.task.id} assigned to worker ${workerIndex}`);
  }

  /**
   * Process next task in queue
   */
  private processNextTask(): void {
    if (this.taskQueue.length === 0) {
      return;
    }

    const pending = this.taskQueue.shift();
    if (pending) {
      this.assignTask(pending);
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      ...this.stats,
      poolSize: this.poolSize,
      availableWorkers: this.availableWorkers.length,
      queuedTasks: this.taskQueue.length,
      pendingTasks: this.pendingTasks.size,
      utilization: ((this.poolSize - this.availableWorkers.length) / this.poolSize) * 100,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      tasksProcessed: 0,
      tasksQueued: 0,
      tasksFailed: 0,
      workersRestarted: 0,
      averageProcessingTime: 0,
    };
  }

  /**
   * Shutdown worker pool
   */
  async shutdown(timeoutMs: number = 5000): Promise<void> {
    this.logger.info('Shutting down worker pool');

    // Stop accepting new tasks
    this.taskQueue = [];

    // Wait for pending tasks to complete
    const startTime = Date.now();
    while (this.pendingTasks.size > 0 && Date.now() - startTime < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Terminate all workers
    const terminatePromises = this.workers.map((worker, index) => {
      return new Promise<void>((resolve) => {
        if (worker) {
          worker.terminate().then(() => {
            this.logger.debug(`Worker ${index} terminated`);
            resolve();
          }).catch((error) => {
            this.logger.error(`Failed to terminate worker ${index}`, error);
            resolve();
          });
        } else {
          resolve();
        }
      });
    });

    await Promise.all(terminatePromises);

    this.workers = [];
    this.availableWorkers = [];
    this.pendingTasks.clear();
    this.workerTasks.clear();

    this.logger.info('Worker pool shut down');
  }
}

export default WorkerPool;

/**
 * Base Agent Class - Template for creating specialized agents
 */

import { AgentMetadata, AgentCapability } from './agent-manager';

export abstract class Agent {
  public metadata: AgentMetadata;

  constructor(type: string, name: string, description: string, config?: any) {
    this.metadata = {
      id: '',
      type,
      name,
      description,
      version: '1.0.0',
      capabilities: [],
      status: 'inactive',
      createdAt: new Date(),
      lastActiveAt: new Date(),
      config: config || {}
    };
  }

  /**
   * Initialize the agent (setup, load resources, etc.)
   */
  public async initialize(): Promise<void> {
    console.log(`🚀 Initializing ${this.metadata.name}...`);
    await this.onInitialize();
    this.metadata.status = 'active';
    console.log(`✅ ${this.metadata.name} initialized`);
  }

  /**
   * Execute a task
   */
  public async execute(task: any): Promise<any> {
    if (this.metadata.status !== 'active') {
      throw new Error(`Agent ${this.metadata.name} is not active`);
    }

    console.log(`🔄 ${this.metadata.name} executing task:`, task);
    const result = await this.onExecute(task);
    this.metadata.lastActiveAt = new Date();
    return result;
  }

  /**
   * Shutdown the agent
   */
  public async shutdown(): Promise<void> {
    console.log(`🛑 Shutting down ${this.metadata.name}...`);
    await this.onShutdown();
    this.metadata.status = 'inactive';
    console.log(`✅ ${this.metadata.name} shutdown complete`);
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    try {
      return await this.onHealthCheck();
    } catch (error) {
      console.error(`❌ Health check failed for ${this.metadata.name}:`, error);
      return false;
    }
  }

  /**
   * Add a capability to this agent
   */
  protected addCapability(capability: AgentCapability): void {
    this.metadata.capabilities.push(capability);
  }

  // Abstract methods to be implemented by specific agents
  protected abstract onInitialize(): Promise<void>;
  protected abstract onExecute(task: any): Promise<any>;
  protected abstract onShutdown(): Promise<void>;
  protected abstract onHealthCheck(): Promise<boolean>;
}

export default Agent;

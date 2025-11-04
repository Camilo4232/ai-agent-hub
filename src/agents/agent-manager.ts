/**
 * Agent Manager - Dynamic agent lifecycle management
 * Allows adding, removing, and managing specialized agents at runtime
 */

import { EventEmitter } from 'events';

export interface AgentCapability {
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface AgentMetadata {
  id: string;
  type: string;
  name: string;
  description: string;
  version: string;
  capabilities: AgentCapability[];
  endpoint?: string;
  status: 'active' | 'inactive' | 'paused' | 'error';
  createdAt: Date;
  lastActiveAt: Date;
  config?: Record<string, any>;
}

export interface BaseAgent {
  metadata: AgentMetadata;
  initialize(): Promise<void>;
  execute(task: any): Promise<any>;
  shutdown(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

class AgentManager extends EventEmitter {
  private static instance: AgentManager;
  private agents: Map<string, BaseAgent> = new Map();
  private agentTypes: Map<string, new (config?: any) => BaseAgent> = new Map();
  private maxAgents: number = 10;

  private constructor() {
    super();
    this.maxAgents = parseInt(process.env.MAX_AGENTS || '10');
  }

  public static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
    }
    return AgentManager.instance;
  }

  /**
   * Register a new agent type (class/constructor)
   */
  public registerAgentType(
    type: string,
    agentClass: new (config?: any) => BaseAgent
  ): void {
    if (this.agentTypes.has(type)) {
      throw new Error(`Agent type ${type} is already registered`);
    }

    this.agentTypes.set(type, agentClass);
    console.log(`✅ Registered agent type: ${type}`);
    this.emit('agent-type-registered', type);
  }

  /**
   * Unregister an agent type
   */
  public unregisterAgentType(type: string): void {
    // First, remove all instances of this type
    const agentsToRemove = Array.from(this.agents.values())
      .filter(agent => agent.metadata.type === type)
      .map(agent => agent.metadata.id);

    for (const agentId of agentsToRemove) {
      this.removeAgent(agentId);
    }

    this.agentTypes.delete(type);
    console.log(`✅ Unregistered agent type: ${type}`);
    this.emit('agent-type-unregistered', type);
  }

  /**
   * Create and add a new agent instance
   */
  public async addAgent(
    type: string,
    config?: any,
    customId?: string
  ): Promise<string> {
    // Check if we've reached max agents
    if (this.agents.size >= this.maxAgents) {
      throw new Error(`Maximum number of agents (${this.maxAgents}) reached`);
    }

    // Get the agent class
    const AgentClass = this.agentTypes.get(type);
    if (!AgentClass) {
      throw new Error(`Agent type ${type} is not registered`);
    }

    // Create the agent instance
    const agent = new AgentClass(config);

    // Use custom ID or generate one
    const agentId = customId || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update metadata with the ID
    agent.metadata.id = agentId;

    try {
      // Initialize the agent
      await agent.initialize();

      // Add to registry
      this.agents.set(agentId, agent);

      console.log(`✅ Added agent: ${agentId} (${type})`);
      this.emit('agent-added', agent.metadata);

      return agentId;
    } catch (error) {
      console.error(`❌ Failed to initialize agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Remove an agent
   */
  public async removeAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    try {
      // Shutdown the agent
      await agent.shutdown();

      // Remove from registry
      this.agents.delete(agentId);

      console.log(`✅ Removed agent: ${agentId}`);
      this.emit('agent-removed', agentId);
    } catch (error) {
      console.error(`❌ Error removing agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get an agent by ID
   */
  public getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  public getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by type
   */
  public getAgentsByType(type: string): BaseAgent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.metadata.type === type
    );
  }

  /**
   * Get agent metadata
   */
  public getAgentMetadata(agentId: string): AgentMetadata | undefined {
    const agent = this.agents.get(agentId);
    return agent?.metadata;
  }

  /**
   * List all registered agent types
   */
  public listAgentTypes(): string[] {
    return Array.from(this.agentTypes.keys());
  }

  /**
   * Execute a task with a specific agent
   */
  public async executeTask(agentId: string, task: any): Promise<any> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (agent.metadata.status !== 'active') {
      throw new Error(`Agent ${agentId} is not active (status: ${agent.metadata.status})`);
    }

    try {
      this.emit('task-started', { agentId, task });
      const result = await agent.execute(task);

      // Update last active time
      agent.metadata.lastActiveAt = new Date();

      this.emit('task-completed', { agentId, task, result });
      return result;
    } catch (error) {
      agent.metadata.status = 'error';
      this.emit('task-failed', { agentId, task, error });
      throw error;
    }
  }

  /**
   * Health check for all agents
   */
  public async healthCheckAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const [agentId, agent] of this.agents) {
      try {
        const healthy = await agent.healthCheck();
        results.set(agentId, healthy);

        if (!healthy) {
          agent.metadata.status = 'error';
        }
      } catch (error) {
        results.set(agentId, false);
        agent.metadata.status = 'error';
      }
    }

    return results;
  }

  /**
   * Pause an agent
   */
  public pauseAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    agent.metadata.status = 'paused';
    this.emit('agent-paused', agentId);
  }

  /**
   * Resume an agent
   */
  public resumeAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    agent.metadata.status = 'active';
    this.emit('agent-resumed', agentId);
  }

  /**
   * Shutdown all agents
   */
  public async shutdownAll(): Promise<void> {
    console.log('🛑 Shutting down all agents...');

    const shutdownPromises = Array.from(this.agents.keys()).map(agentId =>
      this.removeAgent(agentId)
    );

    await Promise.allSettled(shutdownPromises);
    this.agents.clear();

    console.log('✅ All agents shutdown');
    this.emit('all-agents-shutdown');
  }

  /**
   * Get statistics
   */
  public getStats(): {
    totalAgents: number;
    activeAgents: number;
    pausedAgents: number;
    errorAgents: number;
    agentsByType: Record<string, number>;
    registeredTypes: number;
  } {
    const agents = Array.from(this.agents.values());

    const agentsByType: Record<string, number> = {};
    for (const agent of agents) {
      agentsByType[agent.metadata.type] = (agentsByType[agent.metadata.type] || 0) + 1;
    }

    return {
      totalAgents: this.agents.size,
      activeAgents: agents.filter(a => a.metadata.status === 'active').length,
      pausedAgents: agents.filter(a => a.metadata.status === 'paused').length,
      errorAgents: agents.filter(a => a.metadata.status === 'error').length,
      agentsByType,
      registeredTypes: this.agentTypes.size
    };
  }
}

export default AgentManager;
export const agentManager = AgentManager.getInstance();

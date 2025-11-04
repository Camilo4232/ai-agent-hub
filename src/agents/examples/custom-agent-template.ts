/**
 * Custom Agent Template
 * Use this as a template to create your own specialized agents
 */

import { Agent } from '../base-agent';

export interface CustomAgentConfig {
  // Add your custom configuration here
  apiKey?: string;
  endpoint?: string;
  timeout?: number;
}

export class CustomAgent extends Agent {
  private config: CustomAgentConfig;

  constructor(config?: CustomAgentConfig) {
    super(
      'custom',
      'Custom Agent',
      'Template for creating custom specialized agents',
      config
    );

    this.config = config || {};

    // Define agent capabilities
    this.addCapability({
      name: 'custom-task',
      description: 'Performs a custom task',
      parameters: {
        input: 'string',
        options: 'object'
      }
    });
  }

  protected async onInitialize(): Promise<void> {
    // Initialization logic here
    // Example: Connect to external services, load models, etc.
    console.log('Custom agent initializing with config:', this.config);

    // Validate configuration
    if (this.config.apiKey) {
      // Validate API key
    }
  }

  protected async onExecute(task: any): Promise<any> {
    // Task execution logic here
    console.log('Executing custom task:', task);

    // Example task structure:
    const { action, parameters } = task;

    switch (action) {
      case 'custom-task':
        return await this.performCustomTask(parameters);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  protected async onShutdown(): Promise<void> {
    // Cleanup logic here
    // Example: Close connections, save state, etc.
    console.log('Custom agent shutting down');
  }

  protected async onHealthCheck(): Promise<boolean> {
    // Health check logic here
    // Return true if agent is healthy, false otherwise
    return this.metadata.status === 'active';
  }

  // Custom methods
  private async performCustomTask(parameters: any): Promise<any> {
    // Your custom logic here
    return {
      success: true,
      result: `Custom task completed with parameters: ${JSON.stringify(parameters)}`
    };
  }
}

export default CustomAgent;

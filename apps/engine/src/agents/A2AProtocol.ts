/**
 * A2A (Agent-to-Agent) Protocol
 * 
 * Defines the standard communication envelope and response format
 * for all specialized agents in the JOBY platform.
 */

export interface A2AEnvelope<T = any> {
    task_id: string;
    agent_target: string;
    input_payload: T;
    priority: 'low' | 'medium' | 'high';
    deadline?: Date;
    timestamp: Date;
}

export interface AgentResponse<T = any> {
    task_id: string;
    status: 'success' | 'partial' | 'failed' | 'requires_human' | 'skipped';
    output_payload: T;
    error?: string;
    metadata?: Record<string, any>;
}

export type AgentFunction<I = any, O = any> = (envelope: A2AEnvelope<I>) => Promise<AgentResponse<O>>;

export type AgentPermission = "read" | "write" | "delete";

export interface AgentCard {
    id: string;
    agentName: string;
    description: string;
    skills: string[];
    tags?: string[];
    permissions?: AgentPermission[];
    examples?: string[];
}




export type Agent<P = any, T = any> = {
    (props?: P): Promise<T>;
} & AgentCard;
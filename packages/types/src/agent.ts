export type AgentPermission = "read" | "write" | "delete";

export interface AgentCard {
    agentName: string;
    description: string;
    skills: string[];
    permissions?: AgentPermission[];
}


export type AgentComponent<P = any, T = any> = {
    (props?: P): Promise<T>;
} & AgentCard;
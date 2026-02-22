/**
 * Agent 1: AGENT MANAGER (Orchestrator)
 *
 * Role: The supreme coordinator. Manages all agents, delegates tasks, monitors
 *       quality, collects user feedback, and improves agent behavior over time.
 */

import { useShortMemory, useLLModel } from "@repo/framwork";
import { Agent, LLModelType } from "@repo/types";
import { AgentResponse } from "./A2AProtocol.js";
import CVParserAgent from "./CVParserAgent.js";
import JobSearchAgent from "./JobSearchAgent.js";
import CommunicationAgent from "./CommunicationAgent.js";
import { UserSession } from "../user/UserSession.js";

export type SessionState =
    | 'ONBOARDING'
    | 'ANALYSIS'
    | 'SEARCH'
    | 'APPLY'
    | 'REPORT'
    | 'FEEDBACK'
    | 'LEARN';

interface ManagerAgentProps {
    sessionId: string;
    userId: string;
    userInput?: string;
    uploadedFileUri?: string;
    chatBotType?: string;
    isBot?: boolean;
}

interface AgentSessionState {
    state: SessionState;
    history: any[];
    profile: any;
    matches: any[];
    applications: any[];
    reply: string;
}

const ManagerAgent: Agent<ManagerAgentProps, any> = async (props) => {
    if (!props) throw new Error("Props are required for ManagerAgent");

    const memory = useShortMemory();
    const llm = useLLModel(LLModelType.AMAZON_NOVA_LITE);

    // 1. Get user metadata (Long-term)
    const user = await UserSession({
        chatBotType: props.chatBotType || "telegram",
        userId: props.userId,
        isBot: props.isBot || false
    });

    // 2. Get active agent state (Short-term)
    const stateKey = `joby:agent-state:${user.id}`;
    const rawState = await memory.get(stateKey);
    let agentState: AgentSessionState;

    if (rawState) {
        agentState = JSON.parse(rawState);
    } else {
        agentState = {
            state: 'ONBOARDING',
            history: [],
            profile: null,
            matches: [],
            applications: [],
            reply: ""
        };
    }

    // 3. State Machine Logic
    let agentResponse: AgentResponse;
    const task_id = `task-${Date.now()}`;

    if (props.uploadedFileUri) {
        agentState.state = 'ANALYSIS';
    }

    switch (agentState.state) {
        case 'ONBOARDING':
            if (agentState.history.length === 0 && !props.userInput?.includes('/start')) {
                agentResponse = await CommunicationAgent({
                    task_id,
                    agent_target: 'CommunicationAgent',
                    priority: 'high',
                    timestamp: new Date(),
                    input_payload: {
                        type: 'GREETING',
                        payload: { isNew: true }
                    }
                });
                agentState.reply = agentResponse.output_payload.message;
            } else {
                const systemPrompt = `You are JOBY, an intelligent job automation platform powered by a multi-agent system.
                The user is on Telegram and hasn't uploaded their CV yet.
                Your goal: Be friendly, but GUIDE them to upload their CV (PDF/DOCX) DIRECTLY here in this chat using the Telegram "Attach" (paperclip) icon.
                NEVER mention a "dashboard", "website", or "Upload CV button". There is no dashboard. 
                If they ask about finding a job, ask for their CV and preferred location.
                Use the same language that the user uses.
                Session context: ${JSON.stringify({ userId: props.userId, history: agentState.history.slice(-5) })}`;

                agentState.reply = await llm.ask(props.userInput || "Hello", systemPrompt);
            }
            break;

        case 'ANALYSIS':
            if (props.uploadedFileUri) {
                agentResponse = await CVParserAgent({
                    task_id,
                    agent_target: 'CVParserAgent',
                    priority: 'high',
                    timestamp: new Date(),
                    input_payload: {
                        userId: user.id,
                        fileContent: "Extract from " + props.uploadedFileUri,
                        fileName: "CV.pdf"
                    }
                });

                const { candidate_profile, cv_quality_score, suggested_cv_improvements } = agentResponse.output_payload;
                agentState.profile = candidate_profile;

                // Construct the review message
                let reviewMessage = `🚀 **CV Analysis Complete!**\n\n`;
                reviewMessage += `📊 **Quality Score:** ${cv_quality_score}/100\n\n`;

                if (suggested_cv_improvements && suggested_cv_improvements.length > 0) {
                    reviewMessage += `💡 **Suggestions for Improvement:**\n`;
                    suggested_cv_improvements.forEach((s: string) => {
                        reviewMessage += `- ${s}\n`;
                    });
                    reviewMessage += `\n`;
                }

                reviewMessage += `Now, let's find the best jobs for you! 🔎`;

                agentState.reply = reviewMessage;
                agentState.state = 'SEARCH';
            } else {
                agentState.reply = "I'm ready to analyze your CV. Please upload it as a PDF or DOCX file.";
            }
            break;

        case 'SEARCH':
            agentResponse = await JobSearchAgent({
                task_id,
                agent_target: 'JobSearchAgent',
                priority: 'high',
                timestamp: new Date(),
                input_payload: { profile: agentState.profile }
            });
            agentState.matches = agentResponse.output_payload.jobs;
            agentState.state = 'REPORT';
            agentState.reply = `I found ${agentState.matches.length} matches! Here is the top one: ${agentState.matches[0].title} at ${agentState.matches[0].company}.`;
            break;

        case 'REPORT':
            const reportPrompt = `You are JOBY. You just found some jobs for the user.
            Matches: ${JSON.stringify(agentState.matches)}
            Respond to their question about these matches or the next steps.`;
            agentState.reply = await llm.ask(props.userInput || "Explain the matches", reportPrompt);
            break;

        default:
            agentState.reply = "I'm Joby, your job assistant. How can I help you today?";
    }

    if (props.userInput) agentState.history.push({ role: 'user', content: props.userInput });
    if (agentState.reply) agentState.history.push({ role: 'assistant', content: agentState.reply });

    // 4. Save active state back to Redis
    await memory.set(stateKey, JSON.stringify(agentState), 3600 * 24);

    return { ...user, ...agentState };
}

ManagerAgent.agentName = "Agent Manager";
ManagerAgent.description = "Supreme coordinator of the JOBY platform.";
ManagerAgent.skills = [
    "Orchestrate task pipelines",
    "Monitor agent outputs",
    "Enforce quality gates",
    "Log learnings"
];

export default ManagerAgent;
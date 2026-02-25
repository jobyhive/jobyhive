/**
 * Agent 5: COMMUNICATION & REPORTING AGENT
 *
 * Role: The user-facing agent. Translates all agent outputs into clear,
 *       friendly, and actionable messages delivered to the user.
 */

import { useLLModel } from "@repo/framwork";
import { Agent } from "@repo/types";
import { A2AEnvelope, AgentResponse } from "./A2AProtocol.js";

const CommunicationAgent: Agent<A2AEnvelope<any>, AgentResponse<any>> = async (envelope) => {
    if (!envelope) throw new Error("Envelope is required for CommunicationAgent");

    const { type, payload } = envelope.input_payload;
    const llm = useLLModel();
    const userName = payload.firstName || payload.userName || 'Friend';

    let message = "";

    const baseSystemPrompt = `You are Joby, a dedicated one-to-one AI career companion and personal career coach. 
    You are speaking directly with ${userName}. Use their name naturally.`;

    if (type === 'GREETING') {
        const { isNew } = payload;
        const systemPrompt = `${baseSystemPrompt}
        
        Your goal is to welcome them warmly.
        
        Instructions:
        - If new: "Hey ${userName}! I'm Joby. 🚀 I'm here to help you land your dream job. To start, could you send me your current CV?"
        - If returning: "Welcome back, ${userName}! 👋 Ready to see what new opportunities I've found for you today?"
        - Tone: Personal, warm, "I" and "you" focused.
        - Output: ONLY the message text.`;

        message = await llm.ask("Generate a personal greeting", systemPrompt);
    } else if (type === 'REPORT') {
        const systemPrompt = `${baseSystemPrompt}
        You're reporting back to ${userName} one-on-one about their recent application status.
        Payload: ${JSON.stringify(payload)}
        Instructions: Use "I've handled this for you" language. Short, emojis, friendly chat tone.`;

        message = await llm.ask("Generate a personal report", systemPrompt);
    } else if (type === 'CUSTOM') {
        message = payload.message;
    } else {
        message = `Hey ${userName}, I'm Joby! I'm here to help you with your career journey\!`;
    }

    return {
        task_id: envelope.task_id,
        status: 'success',
        output_payload: {
            message
        }
    };
};

CommunicationAgent.id = "communication-agent";
CommunicationAgent.agentName = "Communication & Reporting Agent";
CommunicationAgent.description = "User-facing communication and status reporting agent.";
CommunicationAgent.skills = [
    "Natural language generation",
    "Personalization via session user awareness",
    "Application status reporting"
];

export default CommunicationAgent;

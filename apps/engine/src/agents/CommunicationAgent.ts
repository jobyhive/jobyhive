/**
 * Agent 5: COMMUNICATION & REPORTING AGENT
 *
 * Role: The user-facing agent. Translates all agent outputs into clear,
 *       friendly, and actionable messages delivered to the user.
 */

import { Agent } from "@repo/types";
import { A2AEnvelope, AgentResponse } from "./A2AProtocol.js";

const CommunicationAgent: Agent<A2AEnvelope<any>, AgentResponse<any>> = async (envelope) => {
    if (!envelope) throw new Error("Envelope is required for CommunicationAgent");
    const { type, payload } = envelope.input_payload;

    let message = "";
    if (type === 'GREETING') {
        const { isNew } = payload;
        if (isNew) {
            message = `Hello! 🎯 I'm Joby, your intelligent job automation platform. I me help you find your dream job by analyzing your CV and auto-applying for you.\n\nPlease upload your CV to get started!`;
        } else {
            message = `Welcome back! 🎯 Ready to continue your job search? How can I help you today?`;
        }
    } else if (type === 'REPORT') {
        message = `Hi! 🎯 Here's your Joby application report:\n` +
            `✅ Applied to ${payload.count} jobs today\n` +
            `Your top match today was ${payload.topMatch.title} at ${payload.topMatch.company}.`;
    } else {
        message = "I'm Joby, your assistant. I'm here to help!";
    }

    return {
        task_id: envelope.task_id,
        status: 'success',
        output_payload: {
            message
        }
    };
};

CommunicationAgent.agentName = "Communication & Reporting Agent";
CommunicationAgent.description = "User-facing communication and status reporting agent.";
CommunicationAgent.skills = [
    "Natural language generation",
    "Application status reporting",
    "Feedback collection",
    "Notification handling"
];

export default CommunicationAgent;

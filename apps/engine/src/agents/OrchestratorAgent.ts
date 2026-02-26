/**
 * Agent 1: ORCHESTRATOR AGENT
 *
 * Role: The supreme coordinator. Manages all agents, delegates tasks, monitors
 *       quality, collects user feedback, and improves agent behavior over time.
 */

import { useShortMemory, useLLModel, useLongMemory } from "@repo/framwork";
import { Agent, LLModelType } from "@repo/types";
import { AgentResponse } from "./A2AProtocol.js";
import CVAnalysisAgent from "./CVAnalysisAgent.js";
import JobMatchingAgent from "./JobMatchingAgent.js";
import CommunicationAgent from "./CommunicationAgent.js";
import CVOptimizationAgent from "./CVOptimizationAgent.js";
import AutoApplyAgent from "./AutoApplyAgent.js";
import { UserSession } from "../user/UserSession.js";

export type SessionState =
    | 'ONBOARDING'
    | 'ANALYSIS'
    | 'MATCHING'
    | 'OPTIMIZATION'
    | 'APPLY'
    | 'REPORT'
    | 'FEEDBACK'
    | 'LEARN';

interface OrchestratorAgentProps {
    sessionId: string;
    userId: string;
    userInput?: string;
    uploadedFileUri?: string;
    uploadedFileBytes?: Uint8Array;
    fileFormat?: 'pdf' | 'docx' | 'txt';
    chatBotType?: string;
    isBot?: boolean;
    firstName?: string;
    username?: string;
}

interface AgentSessionState {
    state: SessionState;
    history: any[];
    profile: any;
    matches: any[];
    selectedJobIndex: number;
    optimizedCv: any;
    atsScore: number;
    applications: any[];
    reply: string;
}

const OrchestratorAgent: Agent<OrchestratorAgentProps, any> = async (props) => {
    if (!props) throw new Error("Props are required for OrchestratorAgent");

    const memory = useShortMemory();
    const longMemory = useLongMemory();
    const llm = useLLModel(LLModelType.DEEPSEEK_V3);

    const user = await UserSession({
        chatBotType: props.chatBotType || "telegram",
        userId: props.userId,
        isBot: props.isBot || false,
        firstName: props.firstName,
        username: props.username
    });

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
            selectedJobIndex: 0,
            optimizedCv: null,
            atsScore: 0,
            applications: [],
            reply: ""
        };
    }

    // If profile is missing in short-term memory, try to restore from long-term memory
    if (!agentState.profile) {
        try {
            const historicalRecord = await longMemory.get<any>("joby-candidate-profiles", user.id);
            if (historicalRecord && historicalRecord.profile) {
                agentState.profile = historicalRecord.profile;
                // If we found a profile, we can move out of 'ONBOARDING' if they were there
                if (agentState.state === 'ONBOARDING' && !user.isNew) {
                    agentState.state = 'MATCHING';
                }
            }
        } catch (e) {
            console.error('[OrchestratorAgent] Long-term memory restoration failed:', e);
        }
    }

    let agentResponse: AgentResponse;
    const task_id = `task-${Date.now()}`;

    if (props.userInput == '/start') {
        agentState.state = 'ONBOARDING';
    }

    if (props.uploadedFileUri) {
        agentState.state = 'ANALYSIS';
    }

    const handleChat = async () => {
        const systemPrompt = `You are Joby, a dedicated one-on-one AI career scout and the user's personal career coach.
        You are currently in the '${agentState.state}' phase of the journey.
        
        CONTEXT:
        - Profile: ${agentState.profile ? 'Analyzed' : 'Not yet uploaded'}
        - Candidate Details: ${agentState.profile ? JSON.stringify(agentState.profile) : 'N/A'}
        - Recent Matches: ${agentState.matches.length} found.
        - Recent Applications: ${agentState.applications.length} sent.
        
        INSTRUCTIONS:
        - Respond naturally to the user's message.
        - Since I have the user's analyzed CV (Candidate Details), I can answer specific questions about their skills, experience, or potential career paths.
        - Use a warm, personal, one-to-one tone ("I" and "you").
        - If they ask general questions about the process or their career, give them coach-like advice based on their profile.
        - Gently guide them back to the next step if they seem lost:
            * ONBOARDING -> Upload CV
            * MATCHING/OPTIMIZATION -> Select or optimize a job
            * APPLY -> Submit application
        - Keep it brief (Telegram length).`;

        return await llm.ask(props.userInput || "Hello", agentState.history || [], systemPrompt);
    };

    switch (agentState.state) {
        case 'ONBOARDING':
            if (props.userInput?.includes('/start') || (user.isNew && !props.userInput)) {
                agentResponse = await CommunicationAgent({
                    task_id,
                    agent_target: 'CommunicationAgent',
                    priority: 'high',
                    timestamp: new Date(),
                    input_payload: {
                        type: 'GREETING',
                        payload: { isNew: user.isNew, firstName: props.firstName }
                    }
                });
                agentState.reply = agentResponse.output_payload.message;
            } else {
                agentState.reply = await handleChat();
            }
            break;

        case 'ANALYSIS':
            if (props.uploadedFileUri) {
                const analysisResponse = await CVAnalysisAgent({
                    task_id,
                    agent_target: 'CVAnalysisAgent',
                    priority: 'high',
                    timestamp: new Date(),
                    input_payload: {
                        userId: user.id,
                        cvText: "Extract from " + (props.uploadedFileUri || "memory"),
                        cvFile: props.uploadedFileBytes,
                        format: props.fileFormat,
                        fileName: props.uploadedFileUri?.split('/').pop()?.split('\\').pop()
                    }
                });

                const { candidate_profile, cv_quality_score, user_clarification_question } = analysisResponse.output_payload;
                agentState.profile = candidate_profile;

                if (user_clarification_question) {
                    agentState.reply = user_clarification_question;
                } else if (!agentState.profile) {
                    agentState.reply = "I'm sorry, I couldn't extract enough information from your CV. Could you try uploading it again or providing a more detailed version?";
                    agentState.state = 'ONBOARDING';
                } else {
                    let reviewMessage = `🚀 *I've finished analyzing your CV\!*\n\n`;
                    reviewMessage += `📊 *Quality Score:* ${cv_quality_score.score}/100\n`;
                    reviewMessage += `I've started looking for roles that fit you perfectly. Stand by\! 🔎`;
                    agentState.reply = reviewMessage;
                    agentState.state = 'MATCHING';

                    // Proactively move to matching
                    const matchResponse = await JobMatchingAgent({
                        task_id,
                        agent_target: 'JobMatchingAgent',
                        priority: 'high',
                        timestamp: new Date(),
                        input_payload: { profile: agentState.profile }
                    });
                    agentState.matches = matchResponse.output_payload.jobs;
                    if (agentState.matches.length > 0) {
                        agentState.reply += `\n\nI found ${agentState.matches.length} roles that look great for you\! The top one is *${agentState.matches[0].title}* at *${agentState.matches[0].company}*\. Should I customize your CV specifically for this role?`;
                        agentState.state = 'OPTIMIZATION';
                    } else {
                        agentState.reply += `\n\nI couldn't find any direct matches right now, but I'll keep scouring the web for you\! Try updating your profile or checking back later.`;
                        agentState.state = 'REPORT';
                    }
                }
            } else {
                agentState.reply = await handleChat();
            }
            break;

        case 'MATCHING':
            if (props.userInput?.toLowerCase().includes('search') || props.userInput?.toLowerCase().includes('find')) {
                const searchResponse = await JobMatchingAgent({
                    task_id,
                    agent_target: 'JobMatchingAgent',
                    priority: 'high',
                    timestamp: new Date(),
                    input_payload: { profile: agentState.profile }
                });
                agentState.matches = searchResponse.output_payload.jobs;
                agentState.state = 'OPTIMIZATION';
                agentState.reply = `I found ${agentState.matches.length} roles for you\! The best fit seems to be *${agentState.matches[0].title}* at *${agentState.matches[0].company}*\. Should I customize your CV for this one?`;
            } else {
                agentState.reply = await handleChat();
            }
            break;

        case 'OPTIMIZATION':
            if (props.userInput?.toLowerCase().includes('yes') || props.userInput?.toLowerCase().includes('optimize')) {
                const targetJob = agentState.matches[agentState.selectedJobIndex];
                const optimizeResponse = await CVOptimizationAgent({
                    task_id,
                    agent_target: 'CVOptimizationAgent',
                    priority: 'high',
                    timestamp: new Date(),
                    input_payload: {
                        profile: agentState.profile,
                        targetJob: {
                            job_id: targetJob.job_id,
                            title: targetJob.title,
                            description: targetJob.description || "Refer to title",
                            company: targetJob.company
                        }
                    }
                });

                const { tailoredCv, atsScore, improvementsMade, status } = optimizeResponse.output_payload;
                agentState.optimizedCv = tailoredCv;
                agentState.atsScore = atsScore;

                let optMessage = `✅ *I've finished tailoring your CV for ${targetJob.title}*\n`;
                optMessage += `📈 *ATS Strength:* ${atsScore}/100\n\n`;
                optMessage += `✨ *What I improved:* \n• ${improvementsMade.slice(0, 3).join('\n• ')}\n\n`;

                if (status === 'READY') {
                    optMessage += `Your CV is now highly optimized and ready to go\! Shall I submit it for you?`;
                    agentState.state = 'APPLY';
                } else {
                    optMessage += `The match score is ${atsScore}. I can still try to submit it, or we can look for something else?`;
                    agentState.state = 'APPLY';
                }
                agentState.reply = optMessage;
            } else {
                agentState.reply = await handleChat();
            }
            break;

        case 'APPLY':
            if (props.userInput?.toLowerCase().includes('yes') || props.userInput?.toLowerCase().includes('apply')) {
                const targetJob = agentState.matches[agentState.selectedJobIndex];
                const applyResponse = await AutoApplyAgent({
                    task_id,
                    agent_target: 'AutoApplyAgent',
                    priority: 'high',
                    timestamp: new Date(),
                    input_payload: {
                        job_id: targetJob.job_id,
                        profile: agentState.optimizedCv || agentState.profile
                    }
                });

                const result = applyResponse.output_payload.application_results[0];
                agentState.applications.push(result);
                agentState.reply = `🚀 *I've sent your application\!*\n\nStatus: ${result.status}\nI've applied for the ${targetJob.title} role at ${targetJob.company} on your behalf.`;
                agentState.state = 'REPORT';
            } else if (props.userInput?.toLowerCase().includes('no') || props.userInput?.toLowerCase().includes('cancel')) {
                agentState.reply = "No problem, I've canceled that application. What should we do next? I can show you other roles or start a fresh search.";
                agentState.state = 'REPORT';
            } else {
                agentState.reply = await handleChat();
            }
            break;

        case 'REPORT':
            agentState.reply = await handleChat();
            break;

        default:
            agentState.reply = "I'm Joby, your assistant. How can I help you today?";
    }

    if (props.userInput && props.userInput !== '/start') {
        agentState.history.push({ role: 'user', content: [{ text: props.userInput }] });
    }
    if (agentState.reply) {
        agentState.history.push({ role: 'assistant', content: [{ text: agentState.reply }] });
    }
    if (agentState.history.length > 20) {
        agentState.history = agentState.history.slice(-20);
    }

    await memory.set(stateKey, JSON.stringify(agentState), 3600 * 24);
    return { ...user, ...agentState };
};

OrchestratorAgent.id = "orchestrator-agent";
OrchestratorAgent.agentName = "Orchestrator Agent";
OrchestratorAgent.description = "Supreme coordinator of the JOBY platform.";
OrchestratorAgent.skills = [
    "Orchestrate task pipelines",
    "Monitor agent outputs",
    "Enforce quality gates",
    "Log learnings"
];

export default OrchestratorAgent;
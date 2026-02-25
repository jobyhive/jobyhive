/**
 * Agent 3: CV OPTIMIZATION AGENT
 * 
 * Role: Tailors the candidate's CV for a specific job opportunity using GPT-4.
 * Includes ATS compatibility checking and scoring.
 */

import { useLLModel, useLongMemory } from "@repo/framwork";
import { Agent } from "@repo/types";
import { A2AEnvelope, AgentResponse } from "./A2AProtocol.js";
import { CandidateProfile } from "./CVAnalysisAgent.js";

export interface CVOptimizationInput {
    profile: CandidateProfile;
    targetJob: {
        job_id: string;
        title: string;
        description: string;
        company: string;
    };
}

export interface CVOptimizationOutput {
    tailoredCv: any;
    atsScore: number;
    gapsIdentified: string[];
    improvementsMade: string[];
    status: 'READY' | 'SCORE_TOO_LOW';
}

const CVOptimizationAgent: Agent<A2AEnvelope<CVOptimizationInput>, AgentResponse<CVOptimizationOutput>> = async (envelope) => {
    if (!envelope) throw new Error("Envelope is required for CVOptimizationAgent");

    const { profile, targetJob } = envelope.input_payload;
    const llm = useLLModel();
    const memory = useLongMemory();

    const SYSTEM_PROMPT = `You are an expert ATS optimization specialist and CV writer.
Your task is to tailor a candidate's CV for a specific job description.

🎯 PROCESS:
1. Extract job-specific keywords and required skills.
2. Identify gaps between candidate profile and job requirements.
3. Rewrite experience bullets to mirror job language and emphasize relevant achievements.
4. Reorder skills section to front-load the most relevant skills.
5. Adjust career summary to align perfectly with the target role.

⚠️ ATS COMPATIBILITY RULES:
- No tables, graphics, or columns.
- Standard section headers (Experience, Education, Skills).
- High keyword density for target role.

OUTPUT:
Return a JSON object with:
- tailored_cv (structured exactly like the candidate profile but updated)
- ats_score (0-100)
- gaps_identified (list of strings)
- improvements_made (list of strings)
- career_summary_updated (string)

Be precise and ensure the ATS score is a realistic reflection of the match.`;

    const userPrompt = `
TARGET JOB:
Title: ${targetJob.title}
Company: ${targetJob.company}
Description: ${targetJob.description}

CANDIDATE PROFILE:
${JSON.stringify(profile, null, 2)}
`;

    const response = await llm.ask(userPrompt, SYSTEM_PROMPT);

    // Parsing logic for JSON output
    const extractJson = (text: string) => {
        const match = text.match(/```json\s+([\s\S]*?)\s+```/);
        if (match && match[1]) {
            try {
                return JSON.parse(match[1]);
            } catch (e) {
                return null;
            }
        }
        // Try parsing the whole response if no markdown blocks
        try {
            return JSON.parse(text);
        } catch (e) {
            return null;
        }
    };

    const result = extractJson(response);

    if (!result) {
        throw new Error("Failed to generate tailored CV JSON");
    }

    const atsScore = result.ats_score || 0;
    const status = atsScore >= 75 ? 'READY' : 'SCORE_TOO_LOW';

    // Store tailored CV in "PostgreSQL" (simulated via long memory for now)
    const storeId = `${envelope.input_payload.profile.fullname.replace(/\s+/g, '_')}_${targetJob.job_id}`;
    await memory.index("joby-tailored-cvs", storeId, {
        job_id: targetJob.job_id,
        candidate_name: profile.fullname,
        tailoredCv: result.tailored_cv,
        atsScore,
        improvements: result.improvements_made,
        timestamp: new Date().toISOString()
    });

    return {
        task_id: envelope.task_id,
        status: 'success',
        output_payload: {
            tailoredCv: result.tailored_cv,
            atsScore,
            gapsIdentified: result.gaps_identified,
            improvementsMade: result.improvements_made,
            status
        }
    };
};

CVOptimizationAgent.id = "cv-optimization-agent";
CVOptimizationAgent.agentName = "CV Optimization Agent";
CVOptimizationAgent.description = "Tailors CVs for specific job opportunities to maximize ATS scores.";
CVOptimizationAgent.skills = [
    "ATS Optimization",
    "CV Tailoring",
    "Keyword Analysis",
    "Career Alignment"
];

export default CVOptimizationAgent;

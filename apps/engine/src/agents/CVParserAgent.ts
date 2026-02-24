/**
 * Agent 2: CV PARSER & PROFILER AGENT
 *
 * Role: Extracts and structures all meaningful information from the user's
 *       uploaded CV, then builds a comprehensive user profile.
 */

import { useLLModel, useLongMemory } from "@repo/framwork";
import { Agent } from "@repo/types";
import { A2AEnvelope, AgentResponse } from "./A2AProtocol.js";

export interface CVParserInput {
    userId: string;
    fileContent: string;
    fileName: string;
}

export interface CandidateProfile {
    fullName: string;
    gender?: string;
    contactInfo: {
        email: string;
        phone: string;
        address?: string;
    };
    experience: any[];
    skills: string[];
    languages: string[];
    education: any[];
    seniorityLevel: string;
}

const CVParserAgent: Agent<A2AEnvelope<CVParserInput>, AgentResponse<any>> = async (envelope) => {
    if (!envelope) throw new Error("Envelope is required for CVParserAgent");
    const llm = useLLModel();
    const { fileContent } = envelope.input_payload;

    const SYSTEM_PROMPT = `You are a CV Parser & Career Consultant Agent for JOBY. 
    1. Extract structured data from the provided CV text matching the CandidateProfile interface.
       Ensure you extract:
       - fullname
       - gender
       - email_address (into contactInfo.email)
       - phone_no (into contactInfo.phone)
       - address (into contactInfo.address)
       - expreices (into experience)
       - skilles (into skills)
       - lamgauges (into languages)
    2. Provide a CV quality score (0-100).
    3. Identify missing critical fields.
    4. Provide 3 specific suggestions for improvement.
    
    Return your response EXCLUSIVELY as a JSON object with this structure:
    {
      "profile": <CandidateProfile>,
      "score": number,
      "missing_fields": string[],
      "suggestions": string[]
    }`;

    const response = await llm.ask(fileContent, SYSTEM_PROMPT);

    let parsed;
    try {
        parsed = JSON.parse(response);
    } catch (e) {
        parsed = { profile: { raw: response }, score: 50, missing_fields: [], suggestions: ["Ensure your contact information is clear."] };
    }

    const memory = useLongMemory();
    const knowledgeIndex = "joby-knowledge-profiles";

    // Index the profile as deterministically structured knowledge
    await memory.index(knowledgeIndex, envelope.input_payload.userId, {
        ...parsed.profile,
        lastUpdated: new Date().toISOString(),
        cvQualityScore: parsed.score || 70,
        originalFileName: envelope.input_payload.fileName
    });

    return {
        task_id: envelope.task_id,
        status: 'success',
        output_payload: {
            candidate_profile: parsed.profile,
            cv_quality_score: parsed.score || 70,
            missing_fields: parsed.missing_fields || [],
            clarification_questions: [],
            suggested_cv_improvements: parsed.suggestions || []
        }
    };
};

CVParserAgent.agentName = "CV Parser & Profiler Agent";
CVParserAgent.description = "Extracts and structures meaningful information from CVs.";
CVParserAgent.skills = [
    "PDF/Text parsing",
    "Candidate profiling",
    "CV quality scoring",
    "Improvement suggestions"
];

export default CVParserAgent;

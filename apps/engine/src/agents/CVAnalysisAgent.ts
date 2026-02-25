/**
 * CVAnalysisAgent
 * 
 * Professional CV Parser & Career Consultant AI Agent for JobyHive.
 * Extracts structured data, evaluates CV quality, and provides career advice.
 */

import { useLLModel, useLongMemory } from "@repo/framwork";
import { Agent, LLModelType } from "@repo/types";
import { A2AEnvelope, AgentResponse } from "./A2AProtocol.js";

export interface CVAnalysisInput {
    userId: string;
    cvText?: string;
    cvFile?: Uint8Array;
    format?: 'pdf' | 'docx' | 'txt';
    fileName?: string;
}

export interface CandidateProfile {
    fullname: string;
    contactInfo: {
        email: string | null;
        phone: string | null;
        address: string | null;
    };
    experience: {
        job_title: string;
        company: string;
        duration: string;
        responsibilities: string[];
    }[];
    education: {
        degree: string;
        institution: string;
        graduation_year: string;
    }[];
    skills: string[];
    technical_skills_ranked: string[];
    soft_skills: string[];
    certifications: string[];
    languages: string[];
    career_level: string;
    primary_domain: string;
    secondary_domains: string[];
    inferred_goals: string;
    years_of_experience: number;
    career_trajectory: string;
    career_summary: string;
}

export interface CVAnalysisOutput {
    candidate_profile: CandidateProfile | null;
    cv_quality_score: {
        score: number;
        reasoning: string;
    };
    improvement_suggestions: string[];
    user_clarification_question?: string;
}

const CVAnalysisAgent: Agent<A2AEnvelope<CVAnalysisInput>, AgentResponse<CVAnalysisOutput>> = async (envelope) => {
    if (!envelope) throw new Error("Envelope is required for CVAnalysisAgent");

    const payload = envelope.input_payload;
    if (!payload || !payload.userId || (!payload.cvText && !payload.cvFile)) {
        throw new Error("Invalid input payload: userId and either cvText or cvFile are required.");
    }

    const { userId, cvText, cvFile, format, fileName } = payload;
    const taskId = envelope.task_id;
    const llm = useLLModel();
    const memory = useLongMemory();

    const SYSTEM_PROMPT = `You are an expert HR analyst. Your role is to parse CV documents and extract a deeply structured candidate profile.

🎯 Extraction Requirements:
Extract the following structured data from the candidate's CV text:
- Full name, contact info, location
- Work experience (company, role, duration, responsibilities)
- Education (degree, institution, graduation year)
- Technical skills (ranked by frequency/recency)
- Soft skills
- Certifications and languages
- Career trajectory and seniority level
- Inferred career goals from content patterns

PROMPT TO USE INTERNALLY:
"You are an expert HR analyst. Parse the following CV text and extract a 
structured JSON profile. Include: skills[], technical_skills_ranked[], soft_skills[], experience[], education[], 
career_level, primary_domain, secondary_domains[], inferred_goals, 
years_of_experience, certifications[], languages[], career_trajectory, and a 3-sentence career_summary. Be precise."

Your response MUST follow this structure EXACTLY:

✅ Structured Profile
\`\`\`json
{
  "fullname": "string",
  "contactInfo": { "email": "string | null", "phone": "string | null", "address": "string | null" },
  "experience": [ { "job_title": "string", "company": "string", "duration": "string", "responsibilities": ["string"] } ],
  "education": [ { "degree": "string", "institution": "string", "graduation_year": "string" } ],
  "skills": ["string"],
  "technical_skills_ranked": ["string"],
  "soft_skills": ["string"],
  "certifications": ["string"],
  "languages": ["string"],
  "career_level": "string",
  "primary_domain": "string",
  "secondary_domains": ["string"],
  "inferred_goals": "string",
  "years_of_experience": number,
  "career_trajectory": "string",
  "career_summary": "string"
}
\`\`\`

📊 CV Quality Score
Score: X/100
Reasoning: [Short explanation]

🚀 Improvement Suggestions
1. [Suggestion 1]
2. [Suggestion 2]
3. [Suggestion 3]

❓ Clarification Question
[If information is missing, ask the user clearly here. Otherwise, state "None"]`;

    const response = await llm.ask(
        cvText || "Analyze the attached CV document.",
        SYSTEM_PROMPT,
        undefined,
        LLModelType.AMAZON_NOVA_PRO,
        cvFile ? {
            format: format as any || 'pdf',
            name: fileName || 'cv.pdf',
            source: { bytes: cvFile }
        } : undefined
    );

    // Parsing logic
    const extractJson = (text: string) => {
        const match = text.match(/```json\s+([\s\S]*?)\s+```/);
        if (match && match[1]) {
            try {
                return JSON.parse(match[1]);
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    const extractScore = (text: string) => {
        const match = text.match(/Score:\s+(\d+)\/100/);
        return (match && match[1]) ? parseInt(match[1]) : 70;
    };

    const extractReasoning = (text: string) => {
        const match = text.match(/Reasoning:\s+([\s\S]*?)(?=\n\n|⚠|$)/);
        return (match && match[1]) ? match[1].trim() : "";
    };

    const extractList = (text: string, header: string, endHeader: string) => {
        const escapedHeader = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedEndHeader = endHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`${escapedHeader}\\s+([\\s\\S]*?)(?=\\n\\n|${escapedEndHeader}|$)`, 'i');
        const match = text.match(regex);
        if (match && match[1]) {
            return match[1].trim().split('\n')
                .map(line => line.replace(/^-\s+|\d+\.\s+/, '').trim())
                .filter(line => line && line.toLowerCase() !== 'none');
        }
        return [];
    };

    const extractClarification = (text: string) => {
        const match = text.match(/❓ Clarification Question\s+([\s\S]*?)$/i);
        if (match && match[1]) {
            const q = match[1].trim();
            return q.toLowerCase() === 'none' ? undefined : q;
        }
        return undefined;
    };

    const profile = extractJson(response) as CandidateProfile | null;
    const score = extractScore(response);
    const reasoning = extractReasoning(response);
    const suggestions = extractList(response, '🚀 Improvement Suggestions', '❓ Clarification Question');
    const clarificationQuestion = extractClarification(response);

    // Save to memory if we have a profile and userId
    if (profile && userId) {
        const knowledgeIndex = "joby-candidate-profiles";

        // Structure the document for optimal querying and learning
        const candidateDocument = {
            userId,
            fullName: profile.fullname,
            primaryDomain: profile.primary_domain,
            yearsOfExperience: profile.years_of_experience,
            skills: profile.skills,
            technicalSkills: profile.technical_skills_ranked,
            location: profile.contactInfo?.address,

            // The full structured profile
            profile,

            // Analysis results
            cvAnalysis: {
                score,
                reasoning,
                suggestions,
                clarificationQuestion
            },

            // Metadata
            metadata: {
                fileName: payload.fileName || 'unknown',
                fileFormat: payload.format || 'unknown',
                processedAt: new Date().toISOString(),
                taskId: envelope.task_id
            },

            // Search-optimized fields (optional, but good for BM25)
            searchContent: `${profile.fullname} ${profile.primary_domain} ${profile.skills.join(' ')} ${profile.career_summary}`
        };

        try {
            await memory.index(knowledgeIndex, userId, candidateDocument);
        } catch (e) {
            console.error('[CVAnalysisAgent] Failed to store profile in memory:', e);
        }
    }

    return {
        task_id: taskId,
        status: clarificationQuestion ? 'partial' : 'success',
        output_payload: {
            candidate_profile: profile,
            cv_quality_score: { score, reasoning },
            improvement_suggestions: suggestions,
            user_clarification_question: clarificationQuestion
        }
    };
};

CVAnalysisAgent.id = "cv-analysis-agent";
CVAnalysisAgent.agentName = "CV Analysis Agent";
CVAnalysisAgent.description = "Professional CV Parser & Career Consultant AI Agent for JobyHive.";
CVAnalysisAgent.skills = [
    "Extract structured candidate data",
    "Evaluate CV quality",
    "Detect missing critical information",
    "Provide actionable career suggestions"
];

export default CVAnalysisAgent;
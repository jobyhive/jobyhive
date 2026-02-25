import { useLLModel, useLongMemory } from "@repo/framwork";
import { Agent } from "@repo/types";
import { A2AEnvelope, AgentResponse } from "./A2AProtocol.js";

interface JobMatchingInput {
    profile: any;
}

interface JobMatch {
    job_id: string;
    title: string;
    company: string;
    location: string;
    remote_flag: boolean;
    description: string;
    required_skills: string[];
    salary_range: string;
    experience_level: string;
    posted_date: string;
    apply_url: string;
    source: string;
    match_score: number;
}

const JobMatchingAgent: Agent<A2AEnvelope<JobMatchingInput>, AgentResponse<{ jobs: JobMatch[] }>> = async (envelope) => {
    if (!envelope) throw new Error("Envelope is required for JobMatchingAgent");
    const { profile } = envelope.input_payload;
    if (!profile) {
        return {
            task_id: envelope.task_id,
            status: 'success',
            output_payload: { jobs: [] }
        };
    }
    const memory = useLongMemory();
    const indexName = "joby-job-index";

    /**
     * ELASTICSEARCH QUERY TEMPLATE:
     * Use kNN vector search combined with BM25 multi_match on title, 
     * description, and required_skills. Apply function_score to boost 
     * recently posted jobs (decay function on posted_date).
     */

    // For this implementation, we assume OpenAI embeddings are generated for the profile's summary/skills
    // and compared against the 'vector_field' in Elasticsearch.
    const query = {
        bool: {
            should: [
                {
                    multi_match: {
                        query: `${profile.primary_domain} ${profile.skills.join(' ')}`,
                        fields: ["title^3", "description", "required_skills^2"],
                        boost: 0.4 // BM25 weight
                    }
                },
                {
                    // Placeholder for kNN vector search bootstrap
                    // In a real scenario, this would be a knn query block
                    match_all: {}
                }
            ],
            filter: [
                // Filter logic could go here
            ]
        }
    };

    let searchResults: any[] = [];
    try {
        searchResults = await memory.search(indexName, query, { size: 20 });
    } catch (error: any) {
        // If the index doesn't exist yet, just return an empty list instead of crashing
        if (error.meta?.statusCode === 404 || error.name === 'IndexNotFoundException') {
            console.warn(`[JobMatchingAgent] Index ${indexName} not found. Returning empty results.`);
        } else {
            throw error;
        }
    }

    // Simulate scoring and ranking
    const jobs: JobMatch[] = (searchResults || []).map((hit: any) => ({
        ...hit._source,
        job_id: hit._id,
        match_score: Math.round((hit._score || 0) * 10) // Placeholder for hybrid scoring logic
    }));

    return {
        task_id: envelope.task_id,
        status: 'success',
        output_payload: {
            jobs: jobs.sort((a, b) => b.match_score - a.match_score)
        }
    };
};

JobMatchingAgent.id = "job-matching-agent";
JobMatchingAgent.agentName = "Job Matching Agent";
JobMatchingAgent.description = "Discovers and ranks relevant job opportunities using hybrid vector/keyword search.";
JobMatchingAgent.skills = [
    "Elasticsearch Hybrid Search",
    "Vector similarity ranking",
    "BM25 keyword matching",
    "Job source integration"
];

export default JobMatchingAgent;

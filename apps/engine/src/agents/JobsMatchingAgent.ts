/**
 */
import {useLongMemory} from "@repo/framwork";
import {AgentComponent} from "@repo/types";

interface JobsMatchingAgentProps {

}

const JobsMatchingAgent: AgentComponent<JobsMatchingAgentProps, void> = async (props) => {
    const memory = useLongMemory();
}

// Agent Card
JobsMatchingAgent.name = "Agent";
JobsMatchingAgent.description = "";

export default JobsMatchingAgent;
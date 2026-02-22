/**
 */
import {useLongMemory} from "@repo/framwork";
import {AgentComponent} from "@repo/types";

interface JobsApplyingAgentProps {

}

const JobsApplyingAgent: AgentComponent<JobsApplyingAgentProps, void> = async (props) => {
    const memory = useLongMemory();
}

// Agent Card
JobsApplyingAgent.name = "Agent";
JobsApplyingAgent.description = "";

export default JobsApplyingAgent;
/**
 */
import {useLongMemory} from "@repo/framwork";
import {AgentComponent} from "@repo/types";

interface PreferenceLearningAgentProps {

}

const PreferenceLearningAgent: AgentComponent<PreferenceLearningAgentProps, void> = async (props) => {
    const memory = useLongMemory();
}

// Agent Card
PreferenceLearningAgent.name = "Agent";
PreferenceLearningAgent.description = "";

export default PreferenceLearningAgent;
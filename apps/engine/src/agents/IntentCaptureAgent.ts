/**
 */
import {useLongMemory} from "@repo/framwork";
import {AgentComponent} from "@repo/types";

const SYSTEM_PROMPT = `You are an intent extraction engine for a shopping assistant powered by Aurora AI.
Extract the following from the user's shopping request as JSON (no markdown, no explanation):
{
  "query": "<clean product search query optimized for Amazon>",
  "budget": <max price as number in USD OR null if not mentioned>,
  "category": "<broad Amazon category OR null>"
}`;

interface IntentCaptureAgentProps {

}

const IntentCaptureAgent: AgentComponent<IntentCaptureAgentProps, void> = async (props) => {
    const memory = useLongMemory();
}

// Agent Card
IntentCaptureAgent.name = "Manager Agent";
IntentCaptureAgent.description = "";

export default IntentCaptureAgent;
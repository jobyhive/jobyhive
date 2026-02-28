# ADK Agent Development Kit Framework

The **Agent Development Kit (ADK)** is a custom-made framework designed by **Ahmed M. Yassin** to facilitate the creation of reusable services and components. 

## Philosophy

Build complex AI engines like LEGO blocks. The ADK allows you to modularly construct an **Agent** with:
- **Memory**: Both short-term and long-term storage.
- **Model**: Integration with various LLMs (e.g., Amazon Nova).
- **Skills**: Pluggable capabilities for the agent.

## Quick Start

```ts
import { useShortMemory, useModel } from "@repo/framwork";

async function MyAgent() {
    // 1. Initialize Memory
    const shortMemory = useShortMemory();
    await shortMemory.set("session_id", "xyz-789");

    // 2. Load the Language Model
    const llm = useModel("amazon.nova");

    // 3. Generate content
    const response = await llm.generate("Find me job roles matching my CV.");
    console.log("Response:", response);
}
```

## Features

- **Decoupled Architecture**: High-level abstractions for AI components.
- **Pluggable Providers**: Swap models or memory backends easily.
- **Developer Experience**: Fluent APIs for rapid agent development.

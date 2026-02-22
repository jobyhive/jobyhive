# ADK Agent Development Kit Framework

This ADK is custom-made Agent Development Kit Framework by **Ahmed M. Yassin** to help create reusable services and components. It allows building complex engines like LEGO blocks. For example, you can build an **Agent** with memory (short-term and long-term), a model, and skills.

A simple usage could look like this:

```ts
async function Agent1() {
    // Initialize short-term memory
    const shortMemory = useShortMemory();

    // Set a value in memory
    shortMemory.set("key", "value");

    // Retrieve a value from memory
    const value = await shortMemory.get("key");
    console.log("Memory value:", value);

    // Use a language model
    const llm = useModel("amazon.nova");

    // Example: generate a response
    const response = await llm.generate("Hello, how are you?");
    console.log("LLM response:", response);
}
```

there are more othor component and element where can help to build project fast and easy.

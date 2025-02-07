import OpenAI from "openai";
import type { Tool } from "./execution_engine";

const mock_rag_tool: Tool = {
  id: "data_search",
  name: "data_search",
  functions: [
    {
      name: "search_data",
      run: (query: string) => {
        return "we found no data";
      },
      openai_definition: {
        name: "search_data",
        description: "search data in our internal database",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string" },
          },
          required: ["query"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  ],
};

const openai = new OpenAI();

const run_rag_routine = async () => {
  // define tools
  const tools = [mock_rag_tool];

  const openai_tools = [];
  for (const tool of tools) {
    for (const f of tool.functions) {
      openai_tools.push({
        type: "function",
        function: f.openai_definition,
      });
    }
  }

  //
  const messages = [
    {
      role: "user",
      content: "Do we have some data on the term SPCA in our database?",
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    tools: openai_tools,
  });

  messages.push(completion.choices[0].message);
  const tool_calls = completion.choices[0].message.tool_calls;
  console.log(tool_calls);
  console.log(completion.choices[0].message.content);

  // parse tool call
  for (const tool_call of tool_calls) {
    const args = JSON.parse(tool_call.function.arguments);

    const data: string = mock_rag_tool.functions[0].run(args.query);

    const tool_message = {
      role: "tool",
      tool_call_id: tool_call.id,
      content: data,
    };
    messages.push(tool_message);
  }

  const completion_two = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });

  console.log(completion_two.choices[0].message.content);
};

await run_rag_routine();

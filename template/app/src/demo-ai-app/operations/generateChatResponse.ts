import OpenAI from "openai";

type ChatResponse = any

const openAi = setUpOpenAi();
function setUpOpenAi(): OpenAI {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } else {
    throw new Error('OpenAI API key is not set');
  }
}

export async function generateChatResponse(context: any): Promise<ChatResponse | null> {
  console.log("AWT  >>> generateChatResponse >>> context:", context)

    const conversationContext = [
      {
        role: "assistant",
        content: "hello I am here to help you learn more about literacy programs and support in Calgary, how can I help you today"
      },
      {
        role: "user",
        content: "We have recently moved here from Syria. What can we do to support our 10 year old boy learning to read english."
      }
    ]

    const completion = await openAi.chat.completions.create({
        model: "gpt-4o-mini",
      messages: [
        {
          role: 'system',
          content:
            'You are having a conversation with a person looking to learn more about supporting literacy improvements',
        },
        {
          role: 'user',
          content: `respond to the latest response from the user in the following conversation:
          ${JSON.stringify(conversationContext.map(response => `${response.role}: ${response.content}`).join("\n"))}`,
        },
      ],
    // tools: [
    //   {
    //     type: 'function',
    //     function: {
    //       name: 'parseTodaysSchedule',
    //       description: 'parses the days tasks and returns a schedule',
    //       parameters: {
    //         type: 'object',
    //         properties: {
    //           mainTasks: {
    //             type: 'array',
    //             description: 'Name of main tasks provided by user, ordered by priority',
    //             items: {
    //               type: 'object',
    //               properties: {
    //                 name: {
    //                   type: 'string',
    //                   description: 'Name of main task provided by user',
    //                 },
    //                 priority: {
    //                   type: 'string',
    //                   enum: ['low', 'medium', 'high'],
    //                   description: 'task priority',
    //                 },
    //               },
    //             },
    //           },
    //           subtasks: {
    //             type: 'array',
    //             items: {
    //               type: 'object',
    //               properties: {
    //                 description: {
    //                   type: 'string',
    //                   description:
    //                     'detailed breakdown and description of sub-task related to main task. e.g., "Prepare your learning session by first reading through the documentation"',
    //                 },
    //                 time: {
    //                   type: 'number',
    //                   description: 'time allocated for a given subtask in hours, e.g. 0.5',
    //                 },
    //                 mainTaskName: {
    //                   type: 'string',
    //                   description: 'name of main task related to subtask',
    //                 },
    //               },
    //             },
    //           },
    //         },
    //         required: ['mainTasks', 'subtasks', 'time', 'priority'],
    //       },
    //     },
    //   },
    // ],
    // tool_choice: {
    //   type: 'function',
    //   function: {
    //     name: 'parseTodaysSchedule',
    //   },
    // },
    temperature: 1,
  });

  
  console.log("AWT  >>> generateChatResponse >>> completion:", completion)
  const assistantResponse = completion?.choices[0]?.message?.content || null
  console.log("AWT  >>> generateChatResponse >>> assistantResponse:", assistantResponse)

  return assistantResponse
}
  
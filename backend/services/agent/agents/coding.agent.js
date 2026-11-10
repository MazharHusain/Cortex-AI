import { checkAgentLimit } from "../config/agentLimit.js"
import { getModel } from "../config/llmModels.js"
import { deductCredits } from "../utils/deductCredits.js"

export const codingAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "coding")
    const intentLlm = await getModel("intent")
    const llm = await getModel("coding")
    const intentRes = await intentLlm.invoke(`You are an intent classifier.

Return ONLY one of these values:
CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

User Request:
${state.prompt}`)

    const intent = intentRes.content.trim()

    if (intent === "CODE_GENERATION") {
      const prompt = `You are Indus GPT Coding Agent.

Generate the requested project.

Default stack:
- HTML
- CSS
- JavaScript

Use React / Next.js / Vue ONLY if explicitly requested.

Rules:
- Responsive
- Modern UI
- CSS Variables
- Flexbox/Grid
- Smooth Scroll
- Hover Effects
- Beautiful spacing
- Single page unless user asks otherwise.

Always use real Unsplash images.
Never use placeholders.
Return ONLY valid JSON.

Schema:
{
  "files":[
    {
      "name":"index.html",
      "content":"..."
    },
    {
      "name":"style.css",
      "content":"..."
    },
    {
      "name":"script.js",
      "content":"..."
    }
  ]
}

Output must start with { and end with }. No markdown, no explanation, no backticks.

User Request:
${state.prompt}`

      const res = await llm.invoke(prompt)
      const data = JSON.parse(res.content)
      await deductCredits(state.userId, "coding")

      return {
        ...state,
        aiResponse: "Code Generated Successfully.",
        artifacts: [
          {
            id: Date.now(),
            type: "Project",
            files: data.files || [],
            title: state.prompt
          }
        ]
      }
    }

    const res = await llm.invoke(`You are Indus GPT, an advanced AI assistant.

CRITICAL LANGUAGE RULE:
You MUST reply in the EXACT SAME language that the user used.
- If the user asks in Hinglish (e.g. "Elon Musk kon hai?"), reply in natural, fluent Hinglish.
- If the user asks in Hindi, reply in Hindi.
- If the user asks in English, reply in English.
- NEVER translate the user's question back to them.

CRITICAL CONTENT RULE:
- Answer the user's question directly, clearly, and concisely in clean Markdown.
- For non-coding or general knowledge questions, answer directly and naturally without code blocks, templates, or technical disclaimers.
- Do NOT output any boilerplate templates, empty code blocks, or N/A disclaimers.

User Intent: ${intent}
User Request: ${state.prompt}`)

    const cleanData = (res.content || "")
      .replace(/(?:#{1,6}\s*)?\**Optimized Code(?:\s*\(if needed\))?\**[:\s]*[\s\S]*?(?=(?:#{1,6}\s|\n\n[A-Z]|$))/gi, "")
      .replace(/Optimized Code[\s\S]*$/gi, "")
      .trim()

    await deductCredits(state.userId, "coding")

    return {
      ...state,
      aiResponse: cleanData,
      artifacts: []
    }
  } catch (error) {
    console.log(error)
    return {
      ...state,
      aiResponse: error?.data?.message || "failed to generate code",
      artifacts: []
    }
  }
}

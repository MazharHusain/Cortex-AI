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

    const intent = intentRes.content.trim().toUpperCase().replace(/[^A-Z_]/g, '')

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

    let res
    try {
      res = await llm.invoke(prompt)
    } catch (llmErr) {
      console.warn("Primary coding LLM failed, using fallback LLM:", llmErr.message)
      const fallbackLlm = await getModel("chat")
      res = await fallbackLlm.invoke(prompt)
    }
      let files = []
      try {
        const rawContent = (res.content || "")
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim()
        const jsonStart = rawContent.indexOf('{')
        const jsonEnd = rawContent.lastIndexOf('}')
        const cleanJson = jsonStart !== -1 && jsonEnd !== -1 ? rawContent.slice(jsonStart, jsonEnd + 1) : rawContent
        const data = JSON.parse(cleanJson)
        files = data.files || []
      } catch (parseErr) {
        console.error("Coding agent JSON parse error:", parseErr.message)
        const contentStr = String(res.content || "")
        const htmlMatch = contentStr.match(/```html\s*([\s\S]*?)```/i) || contentStr.match(/<!DOCTYPE html[\s\S]*?<\/html>/i)
        const cssMatch = contentStr.match(/```css\s*([\s\S]*?)```/i)
        const jsMatch = contentStr.match(/```javascript\s*([\s\S]*?)```/i) || contentStr.match(/```js\s*([\s\S]*?)```/i)
        if (htmlMatch) {
          files.push({ name: "index.html", content: htmlMatch[1] || htmlMatch[0] })
          if (cssMatch) files.push({ name: "style.css", content: cssMatch[1] || cssMatch[0] })
          if (jsMatch) files.push({ name: "script.js", content: jsMatch[1] || jsMatch[0] })
        }
      }
      await deductCredits(state.userId, "coding")

      return {
        ...state,
        aiResponse: files.length > 0 ? "Code Generated Successfully." : (res.content || "Code Generated Successfully."),
        artifacts: files.length > 0 ? [
          {
            id: Date.now(),
            type: "Project",
            files: files,
            title: state.prompt
          }
        ] : []
      }
    }

    let resGeneral
    const generalPrompt = `You are Indus GPT, an advanced AI assistant.

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
User Request: ${state.prompt}`

    try {
      resGeneral = await llm.invoke(generalPrompt)
    } catch (llmErr) {
      console.warn("Primary general LLM failed, using fallback LLM:", llmErr.message)
      const fallbackLlm = await getModel("chat")
      resGeneral = await fallbackLlm.invoke(generalPrompt)
    }

    const cleanData = (resGeneral.content || "")
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
      aiResponse: error?.data?.message || error?.message || "Sorry, I could not generate the code. Please try again with a more specific request.",
      artifacts: []
    }
  }
}

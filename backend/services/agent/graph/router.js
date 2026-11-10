import { getModel } from "../config/llmModels.js"

export const router = async (state) => {
  if (state.agent && state.agent !== "auto") {
    return {
      ...state,
      agent: state.agent
    }
  }

  if (state.file) {
    if (state.file.mimetype === "application/pdf") {
      return {
        ...state,
        agent: "pdfRag"
      }
    }
    if (state.file.mimetype.startsWith("image/")) {
      return {
        ...state,
        agent: "imageAnalyzer"
      }
    }
  }

  const llm = await getModel("router")
  const prompt = `You are an agent router.

Available agents:
- chat
- search
- coding
- pdf
- ppt
- vision

Rules:

chat:
General chit-chat, greetings, advice, opinions, casual creative writing.

search:
People, biographies, celebrities, founders, facts, real-world entities, questions like "who is", "what is", "kon hai", current events, latest news, recent developments, internet queries.

coding:
Write code, fix bugs, scripts, software design, HTML/CSS/JS, algorithms, API design.

pdf:
Generate PDF documents or PDF file requests.

ppt:
Generate presentations or PPT slide decks.

vision:
Generate or create images.

Return ONLY one word:
chat
search
coding
pdf
ppt
vision

User Query:
${state.prompt}`

  const response = await llm.invoke(prompt)

  return {
    ...state,
    agent: response.content.trim().toLowerCase()
  }
}

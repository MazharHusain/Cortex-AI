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

  const query = String(state.prompt || "")
  if (/\b(ppt|slides|presentation)\b/i.test(query)) {
    return { ...state, agent: "ppt" }
  }
  if (/\bpdf\b/i.test(query) && /\b(generate|create|make|banao|bana)\b/i.test(query)) {
    return { ...state, agent: "pdf" }
  }
  if (/\b(generate|create|draw|banao)\b/i.test(query) && /\b(image|picture|photo|logo)\b/i.test(query)) {
    return { ...state, agent: "vision" }
  }
  if (/\b(code|function|bug|html|css|javascript|python|api|script)\b/i.test(query)) {
    return { ...state, agent: "coding" }
  }
  if (/\b(who is|what is|kon hai|kya hai|latest|news|weather|price|ceo|founder|when was|where is|search)\b/i.test(query)) {
    return { ...state, agent: "search" }
  }
  return {
    ...state,
    agent: "chat"
  }
}

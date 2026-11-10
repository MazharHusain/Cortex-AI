import { checkAgentLimit } from "../config/agentLimit.js"
import { getModel } from "../config/llmModels.js"
import { deductCredits } from "../utils/deductCredits.js"

export const codingAgent=async (state) => {
try {
   await checkAgentLimit(state.userId,"coding")
   const intentLlm=await getModel("intent")
   const llm=await getModel("coding")
   const intentRes=await intentLlm.invoke(`
    You are an intent classifier.

Return ONLY one of these values.

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

User Request:
${state.prompt}
    `)
    const intent=intentRes.content
    if(intent=="CODE_GENERATION"){
        const prompt=`
        You are Indus GPT Coding Agent.

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

IMAGES
=========================

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

Rules:

- Output must start with {
- Output must end with }
- No markdown
- No explanation
- No extra text
- No \`\`\`
- Never mention intent

User Request:
${state.prompt}
        ` 
        const res=await llm.invoke(prompt)
        console.log(res)
        const data=JSON.parse(res.content)
        await deductCredits(state.userId,"coding")
        
        return {
            ...state,
            aiResponse:"Code Generated Successfully.",
            artifacts:[
                {
                    id:Date.now(),
                    type:"Project",
                    files:data.files || [],
                    title:state.prompt
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
- NEVER output sections like "Optimized Code (if needed): N/A" or boilerplate headings like "Problems", "Improvements" unless the user explicitly requested code optimization, debugging, or code review.
- If the user asked a general knowledge, biographical, or non-coding question, answer it directly and naturally without any coding template.

User Intent: ${intent}
User Request: ${state.prompt}
    `)

   const data=res.content   
   await deductCredits(state.userId,"coding")
   
   return {
    ...state,
    aiResponse:data,
    artifacts:[]
   }  
} catch (error) {
   console.log(error)
         return {
            ...state,
            aiResponse:error?.data?.message || "failed to generate code",
            artifacts:[]
        }
}
  
}
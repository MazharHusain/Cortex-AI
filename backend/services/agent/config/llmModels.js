import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, "../.env") })
dotenv.config({ path: path.resolve(__dirname, "../../../.env") })
dotenv.config()
import { ChatGroq } from "@langchain/groq"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatOpenRouter } from "@langchain/openrouter";
const groq=new ChatGroq({
    model:"openai/gpt-oss-120b",
    temperature:0.3
})

const gemini=new ChatGoogleGenerativeAI({
    model:"gemini-3.8-flash"
})

const openrouter=new ChatOpenRouter({
    model:"deepseek/deepseek-chat",
    temperature:0,
    maxTokens:2500
})


export const getModel=async (agent)=>{
    switch (agent) {
        case "chat":
            return groq;
        case "search" :    
           return groq;
        case "coding": 
           return openrouter; 
        case "imageAnalyzer": 
           return gemini;   
    
        default:
            return groq;
    }
}


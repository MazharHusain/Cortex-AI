import axios from "axios"

export const getMessages=async (conversationId)=>{
    try {
       const {data}=await axios.get(`${process.env.CHAT_SERVICE}/get-messages/${conversationId}`, { timeout: 4000 })
       return Array.isArray(data) ? data : []
    } catch (error) {
        console.warn(`conversation history unavailable: ${error.message}`)
        return []
    }
}

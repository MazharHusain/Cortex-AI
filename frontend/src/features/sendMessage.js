import api from '../../utils/axios'

async function sendMessage(payload) {
    try {
        const { data } = await api.post("/api/agent/chat", payload)
        return data
    } catch (error) {
        const body = error.response?.data
        return {
            error: true,
            code: body?.code || "",
            answer: body?.message || ""
        }
    }
}

export default sendMessage

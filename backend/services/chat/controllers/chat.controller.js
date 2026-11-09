import Conversation from "../models/coversation.model.js"
import Message from "../models/message.model.js"

// In-memory fallback stores when MongoDB Atlas is offline or paused
const memoryConversations = new Map()
const memoryMessages = new Map()

export const createConversation=async (req,res) => {
  try {
    const userId=req.headers["x-user-id"] || "anonymous"
    console.log("createConversation for userId:", userId)

    try {
        const conversation=await Conversation.create({
            userId:userId
        })
        return res.status(200).json(conversation)
    } catch (dbErr) {
        console.error("DB offline, creating in-memory conversation:", dbErr.message)
        const id = "conv_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7)
        const fallbackConv = {
            _id: id,
            userId: userId,
            title: "New Chat",
            createdAt: new Date(),
            updatedAt: new Date()
        }
        memoryConversations.set(id, fallbackConv)
        return res.status(200).json(fallbackConv)
    }
  } catch (error) {
     return res.status(500).json({message:`create conversation error ${error}`})
  }
}

export const getConversations=async (req,res) => {
  try {
    const userId=req.headers["x-user-id"] || "anonymous"

    try {
        const conversations=await Conversation.find({
            userId:userId
        }).sort({updatedAt:-1})
        return res.status(200).json(conversations)
    } catch (dbErr) {
        console.error("DB offline, fetching in-memory conversations:", dbErr.message)
        const userConvs = Array.from(memoryConversations.values())
            .filter(c => c.userId === userId)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        return res.status(200).json(userConvs)
    }
  } catch (error) {
     return res.status(500).json({message:`get conversation error ${error}`})
  }
}

export const updateConversation=async (req,res) => {
  try {
    const {id,title}=req.body

    try {
        const conversation=await Conversation.findByIdAndUpdate(id,{
            title
        }, { new: true })
        if (conversation) return res.status(200).json(conversation)
    } catch (dbErr) {
        console.error("DB offline, updating in-memory conversation:", dbErr.message)
    }

    if (memoryConversations.has(id)) {
        const c = memoryConversations.get(id)
        c.title = title
        c.updatedAt = new Date()
        memoryConversations.set(id, c)
        return res.status(200).json(c)
    }

    return res.status(200).json({ _id: id, title })
  } catch (error) {
     return res.status(500).json({message:`update conversation error ${error}`})
  }
}

export const saveMessage=async (req,res) => {
    try {
        const {conversationId,role,content,images,artifacts}=req.body

        try {
            const message=await Message.create({
                conversationId,
                content,
                role,
                images,
                artifacts
            })
            return res.status(200).json(message)
        } catch (dbErr) {
            console.error("DB offline, saving in-memory message:", dbErr.message)
            const id = "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7)
            const fallbackMsg = {
                _id: id,
                conversationId,
                role,
                content,
                images: images || [],
                artifacts: artifacts || [],
                createdAt: new Date()
            }
            if (!memoryMessages.has(conversationId)) {
                memoryMessages.set(conversationId, [])
            }
            memoryMessages.get(conversationId).push(fallbackMsg)
            return res.status(200).json(fallbackMsg)
        }
    } catch (error) {
        return res.status(500).json({message:`save message error ${error}`})
    }
}

export const getMessages=async (req,res) => {
    try {
        const { conversationId } = req.params

        try {
            const messages=await Message.find({
                conversationId
            })
            return res.status(200).json(messages)
        } catch (dbErr) {
            console.error("DB offline, getting in-memory messages:", dbErr.message)
            const list = memoryMessages.get(conversationId) || []
            return res.status(200).json(list)
        }
    } catch (error) {
        return res.status(500).json({message:`get messages error ${error}`})
    }
}



import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    conversations: [],
    selectedConversation: null,
    selectedModel: typeof window !== "undefined" ? (localStorage.getItem("indus_selected_model") || "4o") : "4o"
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload
    },
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload)
    },
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload
    },
    setSelectedModel: (state, action) => {
      state.selectedModel = action.payload
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("indus_selected_model", action.payload)
        } catch (e) {}
      }
    },
    setConvTitle: (state, action) => {
      const { title, conversationId } = action.payload
      state.conversations = state.conversations.map((conv) => (
        conv._id === conversationId ? { ...conv, title } : conv
      ))

      if (state.selectedConversation?._id === conversationId) {
        state.selectedConversation = { ...state.selectedConversation, title }
      }
    }
  }
})

export const { setConversations, addConversation, setSelectedConversation, setSelectedModel, setConvTitle } = conversationSlice.actions
export default conversationSlice.reducer

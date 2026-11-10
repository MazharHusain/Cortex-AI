import { ArrowUp, Code2, FileText, ImageIcon, MessageSquare, Mic, MicOff, Plus, Presentation, Search, X, Zap } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import sendMessage from '../features/sendMessage'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, setArtifacts, setIsLoading, setMessages } from '../redux/messageSlice'
import { createConversation } from '../features/createConversation'
import { addConversation, setConvTitle, setSelectedConversation } from '../redux/conversationSlice'
import { updateConversation } from '../features/updateConversation'
import { useTheme } from '../context/ThemeContext'

function ChatInput({ onLoginClick, initialPrompt, onClearInitialPrompt }) {
  const [value, setValue] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("Auto")
  const { selectedConversation, selectedModel } = useSelector(state => state.conversation)
  const { isLoading } = useSelector(state => state.message)
  const { userData } = useSelector(state => state.user)
  const [selectedFile, setSelectedFile] = useState(null)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const fileRef = useRef(null)
  const textareaRef = useRef(null)
  const dispatch = useDispatch()
  const { theme } = useTheme()

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.setAttribute("spellcheck", "false")
      textareaRef.current.setAttribute("autocorrect", "off")
      textareaRef.current.setAttribute("autocapitalize", "off")
      textareaRef.current.spellcheck = false
    }
  }, [])

  useEffect(() => {
    if (initialPrompt) {
      setValue(initialPrompt)
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
      if (onClearInitialPrompt) onClearInitialPrompt()
    }
  }, [initialPrompt])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true
    recognition.continuous = true

    recognition.onresult = (event) => {
      let transcript = ""
      for (let index = event.resultIndex; index < event.results.length; index++) {
        transcript += event.results[index][0].transcript
      }
      setValue(transcript)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
  }, [])

  const handleFileAttachClick = () => {
    if (!userData) {
      if (onLoginClick) onLoginClick("attach")
      return
    }
    if (fileRef.current) fileRef.current.click()
  }

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.")
      return
    }
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      recognitionRef.current.start()
      setListening(true)
    }
  }

  const handleInputChange = (e) => {
    setValue(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
    }
  }

  const handleSendMessage = async () => {
    const guestUsed = Number(localStorage.getItem("indus_guest_chats") || 0)
    if (!userData && guestUsed >= 10) {
      if (onLoginClick) onLoginClick("limit")
      return
    }
    const trimmedVal = value.trim()
    if (!trimmedVal || isLoading) return

    const promptText = trimmedVal
    const attachedFile = selectedFile
    setValue("")
    setSelectedFile(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    dispatch(addMessage({ role: "user", content: promptText }))
    dispatch(setIsLoading(true))

    try {
      let conversation = selectedConversation
      if (userData && !conversation) {
        try {
          const conv = await Promise.race([
            createConversation(),
            new Promise(res => setTimeout(() => res(null), 2500))
          ])
          if (conv && conv._id) {
            dispatch(setSelectedConversation(conv))
            dispatch(addConversation(conv))
            conversation = conv
          }
        } catch (_) {}
      }

      if (userData && conversation?.title === "New Chat") {
        updateConversation({ id: conversation?._id, title: promptText }).catch(() => {})
        dispatch(setConvTitle({ conversationId: conversation?._id, title: promptText.slice(0, 40) }))
      }

      const formData = new FormData()
      formData.append("prompt", promptText)
      if (conversation?._id) {
        formData.append("conversationId", conversation._id)
      }

      let effectiveAgent = selectedAgent.toLowerCase()
      const isSearchQuery = /who is|what is|kon hai|kya hai|latest|news|weather|price|ceo|founder|history|biography|when was|where is|tell me about|search/i.test(promptText)

      if (attachedFile) {
        effectiveAgent = "auto"
      } else if (effectiveAgent === "search" || isSearchQuery) {
        effectiveAgent = "search"
      } else if (effectiveAgent === "auto") {
        if (selectedModel === "coding") {
          effectiveAgent = "coding"
        } else if (selectedModel === "reasoning") {
          effectiveAgent = "search"
        } else {
          effectiveAgent = "chat"
        }
      }
      formData.append("agent", effectiveAgent)
      if (attachedFile) {
        formData.append("file", attachedFile)
      }

      const data = await sendMessage(formData)

      if (data?.code === "GUEST_LIMIT") {
        localStorage.setItem("indus_guest_chats", "10")
        dispatch(addMessage({
          role: "assistant",
          content: "Please sign up or log in to continue chatting."
        }))
        if (onLoginClick) onLoginClick("limit")
        return
      }

      if (!userData && data && !data.error) {
        localStorage.setItem("indus_guest_chats", String(guestUsed + 1))
      }

      if (data && !data.error) {
        dispatch(setArtifacts(data.artifacts || []))
        dispatch(addMessage({
          role: "assistant",
          content: data.answer || "No response generated.",
          images: data.images || [],
          sources: data.sources || []
        }))
      } else {
        dispatch(addMessage({
          role: "assistant",
          content: data?.answer || "Sorry, I could not connect to the agent service. Please try again."
        }))
      }
    } catch (err) {
      console.error("send message failed:", err)
      dispatch(addMessage({
        role: "assistant",
        content: "An unexpected error occurred. Please try again."
      }))
    } finally {
      dispatch(setIsLoading(false))
    }
  }

  const agents = [
    { id: "auto", icon: Zap, label: "Auto" },
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "coding", icon: Code2, label: "Coding" },
    { id: "pdf", icon: FileText, label: "PDF" },
    { id: "ppt", icon: Presentation, label: "PPT" },
    { id: "vision", icon: ImageIcon, label: "Vision" },
    { id: "search", icon: Search, label: "Search" }
  ]

  const hasContent = Boolean(value.trim() || selectedFile)

  return (
    <div className='w-full px-3 sm:px-4 pb-3 pt-1 select-none transition-colors' style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className='max-w-3xl mx-auto'>
        <div
          className='rounded-[26px] border shadow-xl p-2.5 px-4 transition-all focus-within:border-purple-400/50 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.25)]'
          style={{
            backgroundColor: 'var(--bg-input)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          {selectedFile && (
            <div className='mb-2 pt-1'>
              <div className='inline-flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-400/30 px-3 py-1.5 shadow-[0_0_12px_rgba(168,85,247,0.2)]'>
                {selectedFile.type === "application/pdf" ? (
                  <FileText size={16} className="text-red-400 shrink-0" />
                ) : (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="h-8 w-8 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className='min-w-0 max-w-[180px]'>
                  <p className='text-xs text-purple-100 truncate font-medium'>{selectedFile.name}</p>
                  <p className='text-[10px] text-purple-300/70'>{Math.ceil(selectedFile.size / 1024)} KB</p>
                </div>
                <button
                  type="button"
                  className='icon-pop ml-1 text-purple-300 hover:text-white cursor-pointer border-none bg-transparent'
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileRef.current) fileRef.current.value = ""
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <textarea
            id="chat-prompt-input"
            name="prompt"
            ref={textareaRef}
            placeholder='Ask Indus GPT'
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            value={value}
            rows={1}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            className={`w-full bg-transparent outline-none resize-none text-[15px] leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-h-[180px] pt-1 ${
              theme === 'dark' ? 'placeholder:text-white caret-white' : 'placeholder:text-black caret-black'
            }`}
            style={{
              color: theme === 'dark' ? '#FFFFFF' : '#000000',
              caretColor: theme === 'dark' ? '#FFFFFF' : '#000000'
            }}
          />

          <div className='flex items-center justify-between pt-1 gap-2'>
            <div className='flex items-center gap-2 flex-1 min-w-0 py-1'>
              <input
                type="file"
                accept='.pdf,image/*'
                hidden
                ref={fileRef}
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) setSelectedFile(file)
                }}
              />

              <button
                type="button"
                onClick={handleFileAttachClick}
                title="Attach files (PDF, image)"
                className='icon-pop flex items-center justify-center w-8 h-8 rounded-full border border-transparent hover:border-purple-400/40 cursor-pointer bg-transparent shrink-0'
                style={{
                  color: theme === 'dark' ? '#FFFFFF' : '#000000'
                }}
              >
                <Plus size={18} color={theme === 'dark' ? '#FFFFFF' : '#000000'} />
              </button>

              <div className='flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 px-1 flex-1 min-w-0'>
                {agents.map((agent) => {
                  const isActive = selectedAgent === agent.label
                  const Icon = agent.icon
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => setSelectedAgent(agent.label)}
                      className={`icon-pop flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border shrink-0 ${
                        isActive
                          ? "bg-purple-600/30 border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                          : "bg-purple-500/5 border-purple-500/15 hover:bg-purple-600/15 hover:border-purple-400/40"
                      }`}
                      style={{
                        color: theme === 'dark' ? '#FFFFFF' : '#000000'
                      }}
                    >
                      <Icon size={14} color={theme === 'dark' ? '#FFFFFF' : '#000000'} />
                      <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>{agent.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className='flex items-center gap-2 shrink-0 py-1 pl-1'>
              <button
                type="button"
                onClick={toggleMic}
                title={listening ? "Stop listening" : "Voice input"}
                className={`icon-pop flex items-center justify-center w-8 h-8 rounded-full cursor-pointer border-none ${
                  listening
                    ? "bg-red-500 text-white animate-pulse shadow-[0_0_14px_rgba(239,68,68,0.6)]"
                    : "bg-transparent"
                }`}
                style={{
                  color: listening ? '#FFFFFF' : (theme === 'dark' ? '#FFFFFF' : '#000000')
                }}
              >
                {listening ? <Mic size={16} /> : <MicOff size={16} color={theme === 'dark' ? '#FFFFFF' : '#000000'} />}
              </button>

              <button
                type="button"
                disabled={!hasContent || isLoading}
                onClick={handleSendMessage}
                title="Send message"
                className={`icon-pop flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer ${
                  hasContent && !isLoading
                    ? "btn-fancy-purple text-white shadow-[0_0_16px_rgba(168,85,247,0.5)]"
                    : "bg-white/[0.08] cursor-not-allowed opacity-50"
                }`}
                style={{
                  color: theme === 'dark' ? '#FFFFFF' : '#000000'
                }}
              >
                <ArrowUp
                  size={16}
                  strokeWidth={2.6}
                  color={theme === 'dark' ? '#FFFFFF' : (hasContent && !isLoading ? '#FFFFFF' : '#000000')}
                />
              </button>
            </div>
          </div>
        </div>

        <p className='text-[11px] text-center mt-2 select-none font-medium' style={{ color: theme === 'light' ? '#000000' : '#FFFFFF' }}>
          © Developed by Mazhar Husain
        </p>
      </div>
    </div>
  )
}

export default ChatInput

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
  const { selectedConversation } = useSelector(state => state.conversation)
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
    if (!userData) {
      if (onLoginClick) onLoginClick()
      return
    }
    const trimmedVal = value.trim()
    if (!trimmedVal || isLoading) return

    dispatch(setIsLoading(true))
    let conversation = selectedConversation
    if (!conversation) {
      dispatch(setMessages([]))
      const conv = await createConversation()
      if (conv && conv._id) {
        dispatch(setSelectedConversation(conv))
        dispatch(addConversation(conv))
        conversation = conv
      }
    }

    if (conversation?.title === "New Chat") {
      await updateConversation({ id: conversation?._id, title: trimmedVal })
      dispatch(setConvTitle({ conversationId: conversation?._id, title: trimmedVal.slice(0, 40) }))
    }

    const formData = new FormData()
    formData.append("prompt", trimmedVal)
    if (conversation?._id) {
      formData.append("conversationId", conversation._id)
    }
    formData.append("agent", selectedAgent.toLowerCase())
    if (selectedFile) {
      formData.append("file", selectedFile)
    }

    dispatch(addMessage({ role: "user", content: trimmedVal }))
    setValue("")
    setSelectedFile(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    const data = await sendMessage(formData)
    dispatch(setIsLoading(false))
    if (data) {
      dispatch(setArtifacts(data.artifacts || []))
      dispatch(addMessage({
        role: "assistant",
        content: data.answer || "No response generated.",
        images: data.images || []
      }))
    } else {
      dispatch(addMessage({
        role: "assistant",
        content: "Sorry, I could not connect to the agent service. Please try again."
      }))
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
    <div className='w-full px-4 pb-3 pt-1 select-none transition-colors' style={{ backgroundColor: 'var(--bg-main)' }}>
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
            className={`w-full bg-transparent outline-none resize-none text-[15px] caret-purple-400 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-h-[180px] pt-1 ${
              theme === 'dark' ? 'placeholder:text-white' : 'placeholder:text-black'
            }`}
            style={{
              color: theme === 'dark' ? '#c084fc' : '#7e22ce'
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
                onClick={() => fileRef.current && fileRef.current.click()}
                title="Attach files (PDF, image)"
                className='icon-pop flex items-center justify-center w-8 h-8 rounded-full border border-transparent hover:border-purple-400/40 cursor-pointer bg-transparent shrink-0'
                style={{
                  color: theme === 'dark' ? '#FFFFFF' : '#000000'
                }}
              >
                <Plus size={18} color={theme === 'dark' ? '#FFFFFF' : '#000000'} />
              </button>

              <div className='flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2 px-1 flex-1 min-w-0'>
                {agents.map((agent) => {
                  const isActive = selectedAgent === agent.label
                  const Icon = agent.icon
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => setSelectedAgent(agent.label)}
                      className={`icon-pop flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer border shrink-0 ${
                        isActive
                          ? "bg-purple-600/30 border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                          : "bg-purple-500/5 border-purple-500/15 hover:bg-purple-600/15 hover:border-purple-400/40"
                      }`}
                      style={{
                        color: theme === 'dark' ? '#FFFFFF' : '#000000'
                      }}
                    >
                      <Icon size={12} color={theme === 'dark' ? '#FFFFFF' : '#000000'} />
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

        <p className='text-[11.5px] text-center mt-2 select-none' style={{ color: 'var(--text-muted)' }}>
          Indus GPT can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  )
}

export default ChatInput

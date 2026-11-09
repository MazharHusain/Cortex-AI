import React, { useEffect, useState } from 'react'
import Nav from './Nav'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import BillingDrawer from './BillingDrawer'
import { useDispatch, useSelector } from 'react-redux'
import getMessages from '../features/getMessages'
import { setArtifacts, setMessages } from '../redux/messageSlice'

function ChatArea({ onLoginClick, onToggleSidebar }) {
  const { selectedConversation } = useSelector(state => state.conversation)
  const dispatch = useDispatch()
  const [initialPrompt, setInitialPrompt] = useState("")
  const [showBilling, setShowBilling] = useState(false)

  useEffect(() => {
    const getMesg = async () => {
      if (selectedConversation) {
        if (selectedConversation.title === "New Chat") return
        const data = await getMessages(selectedConversation?._id)
        dispatch(setMessages(data || []))
        const latestArtifactMessage = [...(data || [])].reverse().find(msg => msg.artifacts && msg.artifacts.length > 0)
        dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
      }
    }
    getMesg()
  }, [selectedConversation?._id])

  return (
    <div className='flex-1 flex flex-col min-w-0 h-screen bg-[#212121]'>
      <Nav
        onToggleSidebar={onToggleSidebar}
        onLoginClick={onLoginClick}
        onOpenBilling={() => setShowBilling(true)}
      />
      
      <MessageList
        onSelectPrompt={(text) => setInitialPrompt(text)}
      />

      <ChatInput
        onLoginClick={onLoginClick}
        initialPrompt={initialPrompt}
        onClearInitialPrompt={() => setInitialPrompt("")}
      />

      <BillingDrawer
        open={showBilling}
        onClose={() => setShowBilling(false)}
      />
    </div>
  )
}

export default ChatArea

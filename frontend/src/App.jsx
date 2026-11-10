import React, { useEffect } from 'react'
import Home from './pages/Home'
import getCurrentUser from './features/getCurrentUser'
import { useDispatch } from 'react-redux'
import { setUserdata } from './redux/userSlice'
import { ThemeProvider } from './context/ThemeContext'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../utils/firebase'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    let active = true
    let sessionUser = null
    let firebaseUser = null

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      firebaseUser = user
      if (active && sessionUser && !sessionUser.avatar && user?.photoURL) {
        sessionUser = { ...sessionUser, avatar: user.photoURL }
        dispatch(setUserdata(sessionUser))
      }
    })

    getCurrentUser().then((data) => {
      if (!active) return
      sessionUser = data ? {
        ...data,
        avatar: data.avatar || firebaseUser?.photoURL || ""
      } : null
      dispatch(setUserdata(sessionUser))
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [dispatch])

  return (
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  )
}

export default App

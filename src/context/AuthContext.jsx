import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) setProfile(snap.data())
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) await fetchProfile(firebaseUser.uid)
      else setProfile(null)
      setLoading(false)
    })
    return unsub
  }, [])

  async function register(email, password, displayName, avatarSeed) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const seed = avatarSeed || displayName
    const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=c8102e&textColor=ffffff`
    await updateProfile(cred.user, { displayName, photoURL: avatarUrl })
    const profileData = {
      uid: cred.user.uid,
      email,
      displayName,
      isAdmin: false,
      totalPoints: 0,
      avatar: avatarUrl,
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'users', cred.user.uid), profileData)
    setProfile(profileData)
    return cred.user
  }

  async function login(email, password, remember = true) {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    await signOut(auth)
    setProfile(null)
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.uid)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
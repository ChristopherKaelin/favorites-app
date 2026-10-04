import { useState } from 'react'
import { PublicFavorites } from './components/PublicFavorites'
import { SignIn } from './components/SignIn'
import { UserFavorites } from './components/UserFavorites'
import { AdminClickCounts } from './components/AdminClickCounts'
import { useAuth } from './context/AuthContext'
import { supabase } from './lib/supabase'
import './App.css'

const CHRIS_UID = 'b306f163-3eeb-458d-b9f3-a41b786a6de5'

function App() {
  const { session, loading } = useAuth()
  const [showAdmin, setShowAdmin] = useState(false)
  const isChris = session?.user.id === CHRIS_UID

  return (
    <>
      {loading ? (
        <p>Loading session...</p>
      ) : session ? (
        <div>
          <div className="account-bar">
            <p className="welcome-text">Welcome {session.user.user_metadata.display_name}</p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {isChris && (
                <button type="button" onClick={() => setShowAdmin((prev) => !prev)}>
                  {showAdmin ? 'Back to Favorites' : 'Click Stats'}
                </button>
              )}
              <button type="button" onClick={() => supabase.auth.signOut()}>
                Sign out
              </button>
            </div>
          </div>
          {showAdmin && isChris ? <AdminClickCounts /> : <UserFavorites />}
        </div>
      ) : (
        <>
          <PublicFavorites />
          <SignIn />
        </>
      )}
    </>
  )
}

export default App

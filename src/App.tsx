import { PublicFavorites } from './components/PublicFavorites'
import { SignIn } from './components/SignIn'
import { UserFavorites } from './components/UserFavorites'
import { useAuth } from './context/AuthContext'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const { session, loading } = useAuth()

  return (
    <>
      {loading ? (
        <p>Loading session...</p>
      ) : session ? (
        <div>
          <div className="account-bar">
            <p className="welcome-text">Welcome {session.user.user_metadata.display_name}</p>
            <button type="button" onClick={() => supabase.auth.signOut()}>
              Sign out
            </button>
          </div>
          <UserFavorites />
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

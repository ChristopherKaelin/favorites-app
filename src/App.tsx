import { PublicFavorites } from './components/PublicFavorites'
import { SignIn } from './components/SignIn'
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
          <p>Signed in as {session.user.email}</p>
          <button type="button" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
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

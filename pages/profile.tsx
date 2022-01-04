import { useSession } from '@lib/session'
import { Layout } from '@components/layouts'

const Profile = () => {
  const session = useSession({ redirectTo: '/login' })
  if (!session) return (<></>)



  return (
    <Layout>
      <h1>Profile</h1>
      {session && (
        <>
          <p>Your session:</p>
          <pre>{JSON.stringify(session, null, 2)}</pre>
        </>
      )}

      <style jsx>{`
        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      `}</style>
    </Layout>
  )
}

export default Profile

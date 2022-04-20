import { MouseEventHandler } from 'react'
import { useRouter } from 'next/router'
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { LoginForm } from '@components/forms/auth'
import { LoginPageQuery, useLoginPageQuery } from '@graphql/generated/react-apollo'
import { ToastContainer, toast } from 'react-toastify'

const Login = () => {
  const session = useSession({ redirectTo: '/', redirectIfFound: true })
  const router = useRouter()

  const { data, loading } = useLoginPageQuery()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const body = {
      username: e.target.email.value,
      password: e.target.password.value,
    }

    if (!body.username) {
      toast.error('ユーザー名が入力されていません')
      return
    }
    if (!body.password) {
      toast.error('パスワードが入力されていません')
      return
    }

    try {
      const res = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 200) {
        router.push('/')
      } else {
        throw new Error(await res.text())
      }
    } catch (error) {
      console.error('An unexpected error happened occurred:', error)
    }
  }

  async function handleSaml(e) {
    const uuid = e?.currentTarget?.value
    if (uuid) {
      location.assign('/api/auth/user/saml/idps/' + uuid + '/callback')
      //router.push('/api/auth/user/saml/idps/' + uuid + '/callback')
    }
  }

  if (!router.isReady) return <></>
  if (loading) return <></>

  return (
    <Layout>
      <ToastContainer pauseOnFocusLoss={false} pauseOnHover={false} autoClose={5000} />
      <div className="mx-auto my-20 flex max-w-4xl justify-center bg-white">
        <div className="mx-3 w-96">
          <LoginForm onSubmit={handleSubmit} />
        </div>
        {data?.samls?.length ? (
          <div className="mx-3 w-96">
            <SamlLoginButtons idps={data?.samls} onClick={handleSaml} />
          </div>
        ) : (
          <></>
        )}
      </div>
    </Layout>
  )
}

export const SamlLoginButtons = ({ idps, onClick }: { idps: LoginPageQuery['samls']; onClick: MouseEventHandler }) => (
  <>
    {idps && (
      <>
        {idps.map((idp) => (
          <div key={'SamlLoginButtons-' + idp.id}>
            <button
              type="button"
              className="m-1 rounded-lg bg-indigo-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2  focus:ring-offset-indigo-200 "
              key={idp.id}
              name={idp.name}
              value={idp.id}
              onClick={onClick}
            >
              Login with {idp.name}
            </button>
          </div>
        ))}
      </>
    )}
  </>
)

export default Login

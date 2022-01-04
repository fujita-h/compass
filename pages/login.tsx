import { MouseEventHandler, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from '@lib/session'
import { Layout } from '@components/layouts'
import { LoginForm } from '@components/forms/auth'
import { LoginPageQuery, useLoginPageQuery } from '@graphql/generated/react-apollo'

const Login = () => {
  const session = useSession({ redirectTo: '/', redirectIfFound: true })
  const router = useRouter()

  const { data, loading } = useLoginPageQuery({ fetchPolicy: 'cache-and-network' })

  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    if (errorMsg) setErrorMsg('')

    const body = {
      username: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
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
      setErrorMsg(error.message)
    }
  }

  async function handleSaml(e) {
    const uuid = e?.currentTarget?.value
    if (uuid) {
      location.assign('/api/auth/user/saml/idps/' + uuid + '/callback')
      //router.push('/api/auth/user/saml/idps/' + uuid + '/callback')
    }
  }

  if (!router.isReady) return (<></>)
  if (loading) return (<></>)

  return (
    <Layout>
      <div className="max-w-4xl mx-auto flex">
        <div className="w-96 mx-3">
          <LoginForm errorMessage={errorMsg} onSubmit={handleSubmit} />
        </div>
        <div className="w-96 mx-3">
          <SamlLoginButtons idps={data?.samls} onClick={handleSaml} />
        </div>

      </div>
    </Layout>
  )
}


export const SamlLoginButtons = ({ idps, onClick }: { idps: LoginPageQuery['samls'], onClick: MouseEventHandler }) => (<>
  {idps && <>{idps.map(idp =>
    <div key={'SamlLoginButtons-' + idp.id}>
      <button type="button"
        className="py-2 px-4 m-1 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
        key={idp.id} name={idp.name} value={idp.id} onClick={onClick}>Login with {idp.name}</button>
    </div>)}</>}
</>)


export default Login


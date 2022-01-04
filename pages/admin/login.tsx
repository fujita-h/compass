import { useState } from 'react'
import Router from 'next/router'
import { useAdminSession } from '@lib/session'
import { AdminLayout } from '@components/layouts'
import { useSessionQuery } from '@graphql/generated/react-apollo'

const Login = () => {
  
  const session = useAdminSession({ redirectTo: '/admin', redirectIfFound: true })

  async function handleSubmit(e) {
    e.preventDefault()

    if (errorMsg) setErrorMsg('')

    const body = {
      password: e.currentTarget.password.value,
    }

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 200) {
        console.log('router_push')
        Router.push('/admin')
      } else {
        throw new Error(await res.text())
      }

    } catch (error) {
      console.error('An unexpected error happened occurred:', error)
      setErrorMsg(error.message)
    }
  }
  const [errorMsg, setErrorMsg] = useState('')

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit}>
        <input type="text" name="password" className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" placeholder="Admin Password" />
        <button type="submit" className="py-2 px-4  bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">Login</button>
      </form>
      {errorMsg && <div className="mt-2"><p className="text-danger">{errorMsg}</p></div>}
    </AdminLayout>
  )
}

export default Login

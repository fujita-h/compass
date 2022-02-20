import { useState } from 'react'
import Router from 'next/router'
import { useAdminSession } from '@lib/hooks'
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
        <input
          type="text"
          name="password"
          className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="Admin Password"
        />
        <button
          type="submit"
          className="w-full rounded-lg  bg-indigo-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2  focus:ring-offset-indigo-200 "
        >
          Login
        </button>
      </form>
      {errorMsg && (
        <div className="mt-2">
          <p className="text-danger">{errorMsg}</p>
        </div>
      )}
    </AdminLayout>
  )
}

export default Login

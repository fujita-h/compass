import { useRef, useState } from 'react'
import Router from 'next/router'
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { SignupForm } from '@components/forms/auth'
import { ToastContainer, toast } from 'react-toastify';

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

const Signup = () => {
  useSession({ redirectTo: '/', redirectIfFound: true })
  const processing = useRef(false);

  async function handleSubmit(e) {
    e.preventDefault()
    console.log(processing.current)
    if(processing.current) return

    const body = {
      username: e.target.username.value,
      email: e.target.email.value,
      password: e.target.password.value,
    }

    if (!body.username) {
      toast('Username が入力されていません')
      return
    }
    if (!body.email) {
      toast.error('Email が入力されていません')
      return
    }
    if (body.password !== e.currentTarget.rpassword.value) {
      toast.error('パスワードが一致していません')
      return
    }
    
    processing.current = true
    try {
      const res = await fetch('/api/auth/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 200) {
        const result = await res.json()
        if (!result.done) {
          toast.error(result.error || '不明なエラー')
          return
        }
        toast.success('アカウントが作成されました', { autoClose: 3000 })
        await sleep(3000)
        Router.push('/login')
      } else {
        throw new Error(await res.text())
      }
    } catch (error) {
      toast.error(error || '不明なエラー')
      console.error('An unexpected error happened occurred:', error)
    } finally {
      processing.current = false
    }
  }

  return (
    <Layout>
      <ToastContainer pauseOnFocusLoss={false} pauseOnHover={false} autoClose={5000} />
      <div className="w-96 mx-auto my-16">
        <SignupForm onSubmit={handleSubmit} />
      </div>
    </Layout>
  )
}

export default Signup

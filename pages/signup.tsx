import { useState } from 'react'
import Router from 'next/router'
import { useSession } from '@lib/session'
import { Layout } from '@components/layouts'
import { SignupForm } from '@components/forms/auth'

const Signup = () => {
    useSession({ redirectTo: '/', redirectIfFound: true })

    const [errorMsg, setErrorMsg] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()

        if (errorMsg) setErrorMsg('')

        const body = {
            username: e.currentTarget.username.value,
            email: e.currentTarget.email.value,
            password: e.currentTarget.password.value,
        }

        if (body.password !== e.currentTarget.rpassword.value) {
            setErrorMsg(`The passwords don't match`)
            return
        }

        try {
            const res = await fetch('/api/auth/user/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            if (res.status === 200) {
                Router.push('/login')
            } else {
                throw new Error(await res.text())
            }
        } catch (error) {
            console.error('An unexpected error happened occurred:', error)
            setErrorMsg(error.message)
        }
    }

    return (
        <Layout>
            <div className="w-96 mx-auto">
                <SignupForm errorMessage={errorMsg} onSubmit={handleSubmit} />
            </div>
        </Layout>
    )
}

export default Signup

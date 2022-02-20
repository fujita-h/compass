import { Layout } from '@components/layouts'
import { useRouter } from 'next/router'
import SimpleAlertModal from '@components/modals/simpleAlert'
import { useState } from 'react'

export default function Logout() {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/user/logout', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.status === 200) {
        router.push('/')
      } else {
        throw new Error(await res.json())
      }
    } catch (error) {
      console.error('An unexpected error happened occurred:', error)
    }
  }
  const handleCancel = async () => {
    router.back()
  }

  return (
    <Layout>
      <SimpleAlertModal
        open={open}
        setOpen={setOpen}
        title="ログアウト"
        message="ログアウトしますか?"
        buttonLabel="ログアウト"
        cancelLabel="キャンセル"
        buttonFunc={handleLogout}
        cancelFunc={handleCancel}
      />
    </Layout>
  )
}

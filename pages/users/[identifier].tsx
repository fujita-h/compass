import { useRouter } from 'next/router'
import { useSession } from '@lib/session'
import { Layout } from '@components/layouts'

export default function Page(props) {
    const session = useSession({ redirectTo: "/login" })
    const router = useRouter()
    
    if (!session?.id) return (<></>)

    const { identifier } = router.query

    return (<Layout>
        <div>{identifier}</div>
        <div>{identifier == session.id && 'Your Page'}</div>
    </Layout>)
}
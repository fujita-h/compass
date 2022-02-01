import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { EditorForm, SubmitButtonSetting } from '@components/editors'
import { useGroupQuery } from '@graphql/generated/react-apollo'
import { getAsString } from '@lib/utils'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const groupName = getAsString(router.query?.groupName)

  if (!session?.id) return (<></>)
  if (!groupName) return (<></>)
  return (<InnerPage userId={session.id} groupName={groupName} />)
}

const InnerPage = ({ userId, groupName }: { userId: string, groupName: string }) => {

  const { data, loading } = useGroupQuery({ variables: { auth: 'user', name: groupName } })
  const groupId = useMemo(() => data?.group?.id, [data])

  const submitButtonMap: Array<SubmitButtonSetting> = [{ key: 'publish', label: '全体に公開' }, { key: 'draft', label: '下書きに保存' }]

  if (loading) {
    return (<Layout>
      <EditorForm data={{ title: '', body: '', tags: [], }} meta={{ groupId }} submitButtonMap={submitButtonMap} submitType='groupNew' loading={true} />
    </Layout>)
  }

  if (!data?.group) {
    return (<Layout>
      <div>Group Not Found</div>
    </Layout>)
  }

  return (
    <Layout>
      <EditorForm data={{ title: '', body: '', tags: [], }} meta={{ groupId }} submitButtonMap={submitButtonMap} submitType='groupNew' />
    </Layout>
  )
}

import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { EditorForm, SubmitButtonSetting } from '@components/editors'
import { useGroupQuery, useUserTemplateQuery, useUserTemplatesQuery } from '@graphql/generated/react-apollo'
import { getAsString } from '@lib/utils'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const groupName = getAsString(router.query?.groupName)
  const userTemplateId = getAsString(router.query?.ut)

  if (!session?.id) return <></>
  if (!groupName) return <></>
  return <InnerPage userId={session.id} groupName={groupName} userTemplateId={userTemplateId} />
}

const InnerPage = ({ userId, groupName, userTemplateId }: { userId: string; groupName: string, userTemplateId: string }) => {
  const { data, loading } = useGroupQuery({ variables: { auth: 'user', name: groupName } })
  const groupId = useMemo(() => data?.group?.id, [data])

  const submitButtonMap: Array<SubmitButtonSetting> = [
    { key: 'publish', label: '全体に公開' },
    { key: 'draft', label: '下書きに保存' },
  ]

  if (loading) {
    return (
      <Layout showFooter={false}>
        <BlankEditForm groupId={undefined} submitButtonMap={submitButtonMap} />
      </Layout>
    )
  }

  if (!data?.group) {
    return (
      <Layout>
        <div>Group Not Found</div>
      </Layout>
    )
  }

  if (userTemplateId) {
    return (
      <Layout showFooter={false}>
        <UserTemplateEditForm groupId={groupId} submitButtonMap={submitButtonMap} userTemplateId={userTemplateId} />
      </Layout>
    )
  }

  return (
    <Layout showFooter={false}>
      <BlankEditForm groupId={groupId} submitButtonMap={submitButtonMap} />
    </Layout>
  )
}

const BlankEditForm = ({ groupId, submitButtonMap }: { groupId: string, submitButtonMap: Array<SubmitButtonSetting> }) => {
  return (
    <EditorForm
      data={{ title: '', body: '', tags: [] }}
      meta={{ groupId }}
      submitButtonMap={submitButtonMap}
      submitType="new"
      autoSaveDelay={3}
    />
  )
}

const UserTemplateEditForm = ({ groupId, submitButtonMap, userTemplateId }: { groupId: string, submitButtonMap: Array<SubmitButtonSetting>, userTemplateId: string }) => {
  const { data, loading } = useUserTemplateQuery({ variables: { auth: 'user', id: userTemplateId } })
  if (loading) return (<BlankEditForm groupId={groupId} submitButtonMap={submitButtonMap} />)
  if (!data) return (<BlankEditForm groupId={groupId} submitButtonMap={submitButtonMap} />)
  return (
    <EditorForm
      data={{ title: data.userTemplate.title, body: data.userTemplate.body, tags: data.userTemplate.tags.split(',').filter((tag) => tag !== '') }}
      meta={{ groupId }}
      submitButtonMap={submitButtonMap}
      submitType="new"
      autoSaveDelay={3}
    />
  )
}
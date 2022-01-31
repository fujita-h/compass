import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { DocumentData, DocumentEditorForm, SubmitButtonSetting } from '@components/editors'
import { Auth, useCreateDraftMutation, useGroupQuery } from '@graphql/generated/react-apollo'
import { getAsString } from '@lib/utils'
import router, { useRouter } from 'next/router'
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

  const [createDraft, { data: createDraftResult }] = useCreateDraftMutation({
    onCompleted: (data) => {
      if (data?.createPaper?.documentIdLazy && data?.createPaper?.isPosted) {
        router.push('/docs/' + data.createPaper.documentIdLazy)
      } else {
        router.push('/drafts/' + data.createPaper.id)
      }
    },
    onError: (error) => { console.error(error) }
  })

  const handleSubmit = (submitType, data: DocumentData) => {
    if (submitType == 'publish') {
      createDraft({
        variables: {
          auth: 'user',
          userId, groupId,
          title: data.title,
          body: data.body,
          tags: data.tags.join(','),
          isPosted: 1
        }
      })

    } else { // submitType == 'draft' || submitType == null
      createDraft({
        variables: {
          auth: 'user',
          userId, groupId,
          title: data.title,
          body: data.body,
          tags: data.tags.join(','),
        }
      })
    }
  }

  const submitButtonMap: Array<SubmitButtonSetting> = [{ key: 'publish', label: '全体に公開' }, { key: 'draft', label: '下書きに保存' }]

  if (loading) {
    return (<Layout>
      <DocumentEditorForm initDocData={{ title: '', body: '', tags: [], }} submitButtonMap={submitButtonMap} onSubmit={handleSubmit} loading={true} />
    </Layout>)
  }

  if(!data?.group) {
    return (<Layout>
      <div>Group Not Found</div>
    </Layout>)
  }

  return (
    <Layout>
      <DocumentEditorForm initDocData={{ title: '', body: '', tags: [], }} submitButtonMap={submitButtonMap} onSubmit={handleSubmit} />
    </Layout>
  )
}

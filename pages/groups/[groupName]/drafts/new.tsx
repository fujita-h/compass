import { useSession } from '@lib/session'
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

  const handleSubmit = (submitType, data: { title: string, body: string }) => {
    console.log(submitType, data)
    if (submitType == 'publish') {
      createDraft({
        variables: {
          auth: 'user',
          userId, groupId,
          title: data.title,
          body: data.body,
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
        }
      })
    }
  }

  const initDocData: DocumentData = {
    title: '',
    body: ''
  }
  const submitButtonMap: Array<SubmitButtonSetting> = [{ key: 'publish', label: '全体に公開' }, { key: 'draft', label: '下書きに保存' }]

  if (loading || !data) return (<Layout></Layout>)

  return (
    <Layout>
      <DocumentEditorForm initDocData={initDocData} submitButtonMap={submitButtonMap} onSubmit={handleSubmit} />
    </Layout>
  )
}

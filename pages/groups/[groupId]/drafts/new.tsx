import { useSession } from '@lib/session'
import { Layout } from '@components/layouts'
import { DocumentData, DocumentEditorForm, SubmitButtonSetting } from '@components/editors'
import { Auth, useCreateDraftMutation } from '@graphql/generated/react-apollo'
import { getAsString } from '@lib/utils'
import router, { useRouter } from 'next/router'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const groupId = getAsString(router.query?.groupId)

  if (!session?.id) return (<></>)
  if (!groupId) return (<></>)
  return (<InnerPage userId={session.id} groupId={groupId} />)
}

const InnerPage = ({ userId, groupId }: { userId: string, groupId: string }) => {

  const [createDraft, { data, loading, error, client }] = useCreateDraftMutation({
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
          auth: Auth.User,
          userId, groupId,
          title: data.title,
          body: data.body,
          isPosted: 1
        }
      })

    } else { // submitType == 'draft' || submitType == null
      createDraft({
        variables: {
          auth: Auth.User,
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



  return (
    <Layout>
      <DocumentEditorForm initDocData={initDocData} submitButtonMap={submitButtonMap} onSubmit={handleSubmit} />
    </Layout>
  )
}

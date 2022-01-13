import router, { useRouter } from 'next/router'
import { useSession } from '@lib/session'
import { Layout } from '@components/layouts'
import { getAsString } from '@lib/utils'
import { DocumentEditorForm, SubmitButtonSetting } from '@components/editors'
import { Auth, useDraftPageQuery, useUpdateDraftMutation } from '@graphql/generated/react-apollo'

export default function Page() {
  const session = useSession({ redirectTo: "/login" })
  const router = useRouter()
  const paperId = getAsString(router.query?.paperId)

  if (!session?.id) return (<></>)
  if (!paperId) return (<></>)
  return (<InnerPage paperId={paperId} />)
}

const InnerPage = ({ paperId }: { paperId: string }) => {
  console.log('test innnerPage render')
  const { data, loading } = useDraftPageQuery({ variables: { paperId } })

  const [updateDraft, { data: updateDraftData, loading: updateDraftLoading, error: updateDraftError, client }] = useUpdateDraftMutation({
    onCompleted: (data) => {
      if (data?.updatePaper?.documentIdLazy && data?.updatePaper?.isPosted) {
        router.push(`/docs/${encodeURIComponent(data.updatePaper.documentIdLazy.toLowerCase())}`)
      }
    }
  })

  const handleSubmit = (submitType, data: { title: string, body: string }) => {
    console.log(submitType, data)
    if (submitType == 'publish') {
      updateDraft({
        variables: {
          auth: 'user',
          paperId,
          title: data.title,
          body: data.body,
          isPosted: 1
        }
      })
    } else { // submitType == 'draft' || submitType == null
      updateDraft({
        variables: {
          auth: 'user',
          paperId,
          title: data.title,
          body: data.body,
        }
      })
    }

  }

  const submitButtonMap: Array<SubmitButtonSetting> = [{ key: 'publish', label: data?.draft?.documentIdLazy ? 'ドキュメントを更新': '全体に公開' }, { key: 'draft', label: '下書きに保存' }]

  if (loading) return (<Layout></Layout>)
  if (!data.draft) return (<div>404</div>)

  return (
    <Layout>
      <DocumentEditorForm initDocData={data.draft} submitButtonMap={submitButtonMap} onSubmit={handleSubmit} />
    </Layout>
  )
}

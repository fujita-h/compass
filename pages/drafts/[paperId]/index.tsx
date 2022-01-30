import router, { useRouter } from 'next/router'
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { getAsString } from '@lib/utils'
import { DocumentData, DocumentEditorForm, SubmitButtonSetting } from '@components/editors'
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
  const { data, loading } = useDraftPageQuery({ variables: { paperId }, fetchPolicy: 'network-only' })
  const [updateDraft, { data: updateDraftData, loading: updateDraftLoading, error: updateDraftError, client }] = useUpdateDraftMutation({
    onCompleted: (data) => {
      if (data?.updatePaper?.documentIdLazy && data?.updatePaper?.isPosted) {
        router.push(`/docs/${encodeURIComponent(data.updatePaper.documentIdLazy.toLowerCase())}`)
      }
    }
  })

  const handleSubmit = (submitType, data: DocumentData) => {
    if (submitType == 'publish') {
      updateDraft({
        variables: {
          auth: 'user',
          paperId,
          title: data.title,
          body: data.body,
          tags: data.tags,
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
          tags: data.tags,
        }
      })
    }
  }

  const submitButtonMap: Array<SubmitButtonSetting> = [{ key: 'publish', label: data?.draft?.documentIdLazy ? 'ドキュメントを更新' : '全体に公開' }, { key: 'draft', label: '下書きに保存' }]

  if (loading) {
    return (<Layout>
      <DocumentEditorForm initDocData={{ title: '', body: '', tags: [] }} submitButtonMap={submitButtonMap} onSubmit={handleSubmit} loading={true} />
    </Layout>)
  }

  if (!data.draft) {
    return (<Layout><div>Not Found</div></Layout>)
  }

  return (
    <Layout>
      <DocumentEditorForm initDocData={{ title: data.draft.title, body: data.draft.body, tags: data.draft.paper_tag_map.map((x) => x.tag.text) }} submitButtonMap={submitButtonMap} autoSaveDelay={3} onSubmit={handleSubmit} />
    </Layout>
  )
}

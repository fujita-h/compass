import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { DocumentData, DocumentEditorForm, SubmitButtonSetting } from '@components/editors'
import { Auth, useCreateDraftMutation, useDocumentEditPageQuery } from '@graphql/generated/react-apollo'
import { getAsString } from '@lib/utils'
import router, { useRouter } from 'next/router'
import Link from 'next/link'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const documentId = getAsString(router.query?.documentId)


  if (!session?.id) return (<Layout></Layout>)
  if (!documentId) return (<Layout></Layout>)
  return (<Layout><InnerPage userId={session.id} documentId={documentId} /></Layout>)
}

const InnerPage = ({ userId, documentId }: { userId: string, documentId: string }) => {

  const { data: document, loading: loadingDocument } = useDocumentEditPageQuery({ variables: { documentId } })

  const [createDraft, { data, loading, error, client }] = useCreateDraftMutation({
    onCompleted: (data) => {
      if (data?.createPaper?.documentIdLazy && data?.createPaper?.isPosted) {
        router.push(`/docs/${encodeURIComponent(data.createPaper.documentIdLazy.toLowerCase())}`)
      } else {
        router.push(`/drafts/${encodeURIComponent(data.createPaper.id.toLowerCase())}`)
      }
    },
    onError: (error) => { console.error(error) }
  })


  const handleSubmit = (submitType, data: DocumentData) => {
    console.log(data.tags)
    if (submitType == 'publish') {
      createDraft({
        variables: {
          auth: 'user',
          userId: document.document.paper.user.id,
          groupId: document.document.paper.group.id,
          documentId: document.document.id,
          title: data.title,
          body: data.body,
          tags: data.tags,
          isPosted: 1
        }
      })

    } else { // submitType == 'draft' || submitType == null
      createDraft({
        variables: {
          auth: 'user',
          userId: document.document.paper.user.id,
          groupId: document.document.paper.group.id,
          documentId: document.document.id,
          title: data.title,
          tags: data.tags,
          body: data.body,
        }
      })
    }
  }

  if (loadingDocument) { return <></> }
  if (!document) { return <></> }

  if (document.drafts && document.drafts.length > 0) {
    return (<div className='max-w-7xl mx-auto mt-5'>
      <div className='text-xl border-b-1 border-gray-300'>同じドキュメントの下書きがあるため、このドキュメントを編集できません。以下の下書きから編集を再開して下さい。</div>
      <div className='mt-4 ml-4 text-lg'>
        {document.drafts.map((draft) =>
          <div key={`draft-ref-${draft.id}`}><Link href={`/drafts/${encodeURIComponent(draft.id.toLowerCase())}`} passHref><a>{draft.title}</a></Link></div>
        )}
      </div>
    </div>)
  }

  if (userId !== document.document.paper.user.id) { return <div> Permission Denied.</div> }

  const initDocData: DocumentData =
  {
    title: document.document.paper.title,
    body: document.document.paper.body,
    tags: document.document.paper.paper_tag_map.map((x) => x.tag.text)
  }
  const submitButtonMap: Array<SubmitButtonSetting> = [{ key: 'publish', label: 'ドキュメントを更新' }, { key: 'draft', label: '下書きに保存' }]

  return (
    <DocumentEditorForm initDocData={initDocData} submitButtonMap={submitButtonMap} onSubmit={handleSubmit} />
  )
}

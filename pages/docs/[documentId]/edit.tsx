import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { EditorForm, SubmitButtonSetting } from '@components/editors'
import { useDocumentEditPageQuery } from '@graphql/generated/react-apollo'
import { getAsString } from '@lib/utils'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const documentId = getAsString(router.query?.documentId)

  if (!session?.id) return (<Layout showFooter={false}></Layout>)
  if (!documentId) return (<Layout showFooter={false}></Layout>)
  return (<Layout showFooter={false}><InnerPage userId={session.id} documentId={documentId} /></Layout>)
}

const InnerPage = ({ userId, documentId }: { userId: string, documentId: string }) => {

  const { data: document, loading: loadingDocument } = useDocumentEditPageQuery({ variables: { documentId } })

  const submitButtonMap: Array<SubmitButtonSetting> = [{ key: 'publish', label: 'ドキュメントを更新' }, { key: 'draft', label: '下書きに保存' }]

  if (loadingDocument) { return <EditorForm data={{ title: '', body: '', tags: [] }} meta={{}} submitButtonMap={submitButtonMap} submitType='dummy' loading={true} /> }
  if (userId !== document.document.paper.user.id) { return <div> Permission Denied.</div> }
  if (!document?.document) { return <div>Not Found</div> }

  if (document.drafts && document.drafts.length > 0) {
    return (<div className='max-w-7xl mx-auto mt-5'>
      <div className='text-xl border-b-1 border-gray-300'>同じドキュメントの下書きがあるため、このドキュメントを編集できません。以下の下書きから編集を再開して下さい。</div>
      <div className='mt-4 ml-4 text-lg'>
        {document.drafts.map((draft) =>
          <div key={`draft-ref-${draft.id}`}><Link href={`/drafts/${encodeURIComponent(draft.id.toLowerCase())}/edit`} passHref><a>{draft.title}</a></Link></div>
        )}
      </div>
    </div>)
  }

  return (
    <EditorForm
      data={{ title: document.document.paper.title, body: document.document.paper.body, tags: document.document.paper.tags.split(',').filter((tag) => tag !== '') }}
      meta={{ groupId: document.document.paper.group.id, documentId: document.document.id }}
      submitButtonMap={submitButtonMap} submitType='new' autoSaveDelay={3} />
  )
}

import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { EditorForm, SubmitButtonSetting } from '@components/editors'
import { useDraftPageQuery } from '@graphql/generated/react-apollo'
import { getAsString } from '@lib/utils'
import { useRouter } from 'next/router'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const paperId = getAsString(router.query?.paperId)

  if (!session?.id) return <></>
  if (!paperId) return <></>
  return <InnerPage paperId={paperId} />
}

const InnerPage = ({ paperId }: { paperId: string }) => {
  const { data, loading } = useDraftPageQuery({ variables: { paperId } })

  const submitButtonMap: Array<SubmitButtonSetting> = [
    { key: 'publish', label: data?.draft?.documentIdLazy ? 'ドキュメントを更新' : '全体に公開' },
    { key: 'draft', label: '下書きに保存' },
  ]

  if (loading) {
    return (
      <Layout showFooter={false}>
        <EditorForm
          data={{ title: '', body: '', tags: [] }}
          meta={{ paperId }}
          submitButtonMap={submitButtonMap}
          submitType="draft"
          loading={true}
        />
      </Layout>
    )
  }

  if (!data.draft) {
    return (
      <Layout>
        <div>Not Found</div>
      </Layout>
    )
  }

  return (
    <Layout showFooter={false}>
      <EditorForm
        data={{ title: data.draft.title, body: data.draft.body, tags: data.draft.tags.split(',').filter((tag) => tag !== '') }}
        meta={{ paperId }}
        submitButtonMap={submitButtonMap}
        submitType="draft"
        autoSaveDelay={3}
      />
    </Layout>
  )
}

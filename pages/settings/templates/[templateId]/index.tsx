import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { EditorForm, SubmitButtonSetting } from '@components/editors'
import { useDraftPageQuery, useUserTemplateQuery } from '@graphql/generated/react-apollo'
import { getAsString } from '@lib/utils'
import { useRouter } from 'next/router'

export default function Page() {
  const session = useSession({ redirectTo: "/login" })
  const router = useRouter()
  const templateId = getAsString(router.query?.templateId)

  if (!session?.id) return (<></>)
  if (!templateId) return (<></>)
  return (<InnerPage templateId={templateId} />)
}

const InnerPage = ({ templateId }: { templateId: string }) => {
  const { data, loading } = useUserTemplateQuery({ variables: { auth: 'user', id: templateId }, fetchPolicy: 'network-only' })

  const submitButtonMap: Array<SubmitButtonSetting> = [ { key: 'save', label: 'テンプレートを保存' }]

  if (loading) {
    return (<Layout showFooter={false}>
      <EditorForm data={{ title: '', body: '', tags: [] }} meta={{ userTemplateId: templateId }} submitButtonMap={submitButtonMap} submitType='save' loading={true} />
    </Layout>)
  }

  if (!data.userTemplate) {
    return (<Layout><div>Not Found</div></Layout>)
  }

  return (
    <Layout showFooter={false}>
      <EditorForm data={{ title: data.userTemplate.title, body: data.userTemplate.body, tags: data.userTemplate.tags.split(',').filter((tag) => tag !== '') }} meta={{ userTemplateId: templateId }} submitButtonMap={submitButtonMap} submitType='save' autoSaveDelay={3} />
    </Layout>
  )
}

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSession } from '@lib/hooks'
import { UserSettingLayout } from '@components/layouts'
import {
  useCreateUserTemplateMutation,
  useDeleteUserTemplateMutation,
  UserTemplatesDocument,
  useUpdateUserTemplateMutation,
  useUserTemplatesQuery,
} from '@graphql/generated/react-apollo'
import { doNothing } from '@lib/utils'

const SimpleAlertModal = dynamic(() => import('@components/modals/simpleAlert'))

export default function Page() {
  const session = useSession({ redirectTo: '/login' })

  const { data, loading } = useUserTemplatesQuery({ variables: { auth: 'user' } })
  const [createUserTemplate] = useCreateUserTemplateMutation()

  if (!session) return <></>
  if (loading) return <UserSettingLayout></UserSettingLayout>

  return (
    <UserSettingLayout>
      <div className="bg-white p-4">
        <div>
          <button
            className="rounded-md border bg-blue-200 p-2"
            onClick={() => {
              createUserTemplate({ variables: { auth: 'user' }, refetchQueries: [UserTemplatesDocument] })
            }}
          >
            新しいテンプレートを作成
          </button>
        </div>
        <div className="px-10">
          {data.userTemplates.map((template) => (
            <div key={`template-${template.id}`}>
              <TemplateItem id={template.id} name={template.name} title={template.title} />
            </div>
          ))}
        </div>
      </div>
    </UserSettingLayout>
  )
}

const TemplateItem = ({ id, name, title }: { id: string; name: string; title: string }) => {
  const [open, setOpen] = useState(false)
  const [editNameMode, setEditNameMode] = useState(false)
  const [newName, setNewName] = useState(name)
  const [updateUserTemplate] = useUpdateUserTemplateMutation()
  const [deleteUserTemplate] = useDeleteUserTemplateMutation()

  const handleDelete = (e) => {
    e.stopPropagation()
    setOpen(true)
  }

  return (
    <div className="m-2 border p-4">
      <div className="flex justify-between">
        <div className="h-12">
          {editNameMode ? (
            <div className="flex">
              <input
                type="text"
                name="name"
                className="form-input inline-block rounded-md border-gray-300 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={name}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button
                type="button"
                className="ml-1 inline-block items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => {
                  updateUserTemplate({ variables: { auth: 'user', id, name: newName }, refetchQueries: [UserTemplatesDocument] })
                }}
              >
                保存
              </button>
            </div>
          ) : (
            <div>
              <span className="text-xl">
                <Link href={`/settings/templates/${id.toLowerCase()}`} passHref>
                  <a className="hover:underline">{name}</a>
                </Link>
              </span>
              <span
                className="ml-3 text-xs text-gray-500 hover:cursor-pointer hover:underline"
                onClick={() => {
                  setEditNameMode(true)
                }}
              >
                名前を変更する
              </span>
            </div>
          )}

          <div className="ml-3 h-4 text-sm text-gray-500">{title}</div>
        </div>
        <div>
          <span className="text-red-600 hover:cursor-pointer hover:underline" onClick={handleDelete}>
            削除する
          </span>
        </div>
      </div>
      <SimpleAlertModal
        open={open}
        setOpen={setOpen}
        title={`テンプレート ${name} の削除`}
        message={`このテンプレートを削除してよろしいですか?`}
        buttonLabel="削除する"
        cancelLabel="キャンセル"
        buttonFunc={() => {
          deleteUserTemplate({ variables: { auth: 'user', id }, refetchQueries: [UserTemplatesDocument] })
        }}
        cancelFunc={doNothing}
      />
    </div>
  )
}

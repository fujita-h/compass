
import { UserSettingLayout } from '@components/layouts'
import { useCreateUserTemplateMutation, useDeleteUserTemplateMutation, UserTemplatesDocument, useUpdateUserTemplateMutation, useUserTemplatesQuery } from '@graphql/generated/react-apollo'
import { useSession } from '@lib/hooks'
import Link from 'next/link'
import { SimpleAlertModal } from '@components/modals/simpleAlert'
import { useState } from 'react'
import { PencilIcon } from '@heroicons/react/outline'

export default function Page() {
  const session = useSession({ redirectTo: "/login" })

  const { data, loading } = useUserTemplatesQuery({ variables: { auth: 'user' } })
  const [createUserTemplate, { }] = useCreateUserTemplateMutation({})

  if (!session) return (<></>)
  if (loading) return (<UserSettingLayout></UserSettingLayout>)

  return (
    <UserSettingLayout>
      <div className='bg-white p-4'>
        <div>
          <button className='border rounded-md p-2 bg-blue-200'
            onClick={() => { createUserTemplate({ variables: { auth: 'user' }, refetchQueries: [UserTemplatesDocument] }) }}>新しいテンプレートを作成</button>
        </div>
        <div className='px-10'>
          {data.userTemplates.map((template) =>
            <div key={`template-${template.id}`}>
              <TemplateItem id={template.id} name={template.name} title={template.title} />
            </div>
          )}
        </div>
      </div>
    </UserSettingLayout >)
}

const TemplateItem = ({ id, name, title }: { id: string, name: string, title: string }) => {

  const [open, setOpen] = useState(false)
  const [editNameMode, setEditNameMode] = useState(false)
  const [newName, setNewName] = useState(name)
  const [updateUserTemplate, { }] = useUpdateUserTemplateMutation()
  const [deleteUserTemplate, { }] = useDeleteUserTemplateMutation()

  const handleDelete = (e) => {
    e.stopPropagation()
    setOpen(true)
  }

  return (
    <div className='m-2 p-4 border'>

      <div className='flex justify-between'>
        <div className='h-12'>
          {editNameMode ?
            <div className='flex'>
              <input
                type="text"
                name="name"
                className="inline-block shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-1 sm:text-sm border-gray-300 rounded-md"
                defaultValue={name} onChange={(e) => setNewName(e.target.value)}
              />
              <button type="button"
                className="inline-block ml-1 items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  updateUserTemplate({ variables: { auth: 'user', id, name: newName }, refetchQueries: [UserTemplatesDocument] })
                }}
              >
                保存
              </button>
            </div>
            :
            <div>
              <span className='text-xl'>
                <Link href={`/settings/templates/${id.toLowerCase()}`} passHref>
                  <a className='hover:underline'>{name}</a>
                </Link>
              </span>
              <span className='text-xs text-gray-500 ml-3 hover:underline hover:cursor-pointer' onClick={() => { setEditNameMode(true) }}>
                名前を変更する
              </span>
            </div>
          }

          <div className='h-4 ml-3 text-sm text-gray-500'>
            {title}
          </div>
        </div>
        <div>
          <span className='text-red-600 hover:underline hover:cursor-pointer' onClick={handleDelete}>削除する</span>
        </div>
      </div>
      <SimpleAlertModal
        open={open}
        setOpen={setOpen}
        title={`テンプレート ${name} の削除`}
        message={`このテンプレートを削除してよろしいですか?`}
        buttonLabel='削除する'
        cancelLabel='キャンセル'
        buttonFunc={() => { deleteUserTemplate({ variables: { auth: 'user', id }, refetchQueries: [UserTemplatesDocument] }) }}
        cancelFunc={() => { }}
      />
    </div>
  )
}


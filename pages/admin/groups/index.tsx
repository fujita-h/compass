import { AdminLayout } from '@components/layouts'
import { useAdminSession } from '@lib/hooks'
import { useState } from 'react'
import Link from 'next/link'
import { MyModal } from 'components/modals'
import { Auth, useAdminGroupsIndexPageQuery, useCreateGroupMutation, AdminGroupsIndexPageDocument } from '@graphql/generated/react-apollo'

export default function Page() {
  const session = useAdminSession({ redirectTo: '/admin/login' })
  const [createModalState, setCreateModalState] = useState({ show: false, groupData: null })

  const { data, loading, refetch } = useAdminGroupsIndexPageQuery()

  if (!session) return <AdminLayout />
  if (loading) return <AdminLayout />

  const showCreateModal = (e) => {
    setCreateModalState({ show: true, groupData: null })
  }

  if (session?.admin) {
    return (
      <AdminLayout withMenu>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Dispay Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.groups.map((group) => (
              <tr key={group.id}>
                <td className="whitespace-nowrap px-6 py-4">{group.name}</td>
                <td className="whitespace-nowrap px-6 py-4">{group.displayName}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Link href={`groups/${encodeURIComponent(String(group.id))}`} passHref>
                    <a>
                      {' '}
                      <div className="w-full rounded-lg  bg-blue-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2  focus:ring-offset-blue-200 ">
                        編集
                      </div>
                    </a>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          className="w-full rounded-lg  bg-indigo-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2  focus:ring-offset-indigo-200 "
          onClick={showCreateModal}
        >
          グループの新規作成
        </button>

        <CreateGroupModal state={createModalState} setState={setCreateModalState} />
      </AdminLayout>
    )
  } else {
    return (
      <AdminLayout>
        <p>Admin Page Not Logged in</p>
      </AdminLayout>
    )
  }
}

const CreateGroupModal = ({ state, setState }) => {
  const [formState, setFormState] = useState({ name: '' })

  const [createGroup, { data, loading, error }] = useCreateGroupMutation({
    refetchQueries: [AdminGroupsIndexPageDocument],
    onCompleted: (data) => {
      closeModal()
    },
    onError: (error) => {
      console.error(error.message)
    },
  })

  const handleSetFormValue = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value })
  }
  const handleSubmit = async (e) => {
    createGroup({ variables: { auth: 'admin', name: formState.name } })
  }

  const closeModal = () => {
    setState({ ...state, show: false })
    setFormState({ ...formState, name: '' })
  }

  return (
    <MyModal show={state.show} close={closeModal} title="グループの作成">
      <div className="mt-2">
        <p className="text-sm text-gray-500">作成するグループ名を入力してください。そのほかの設定は作成後に設定できます。</p>
      </div>

      <div className="relative mt-2 ">
        <input
          type="text"
          name="name"
          value={formState.name || ''}
          onChange={handleSetFormValue}
          className="w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="Group Name"
        />
      </div>

      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex justify-center rounded-lg bg-indigo-600  py-2 px-4 text-center text-base font-semibold
            text-white shadow-md transition duration-200 ease-in hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2  focus:ring-offset-indigo-200"
        >
          Create
        </button>
        <button
          type="button"
          onClick={closeModal}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 
          hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </MyModal>
  )
}

import { AdminLayout } from '@components/layouts'
import { useAdminSession } from '@lib/session'
import { useState } from 'react'
import Link from 'next/link'
import { MyModal } from 'components/modals'
import { Auth, useAdminGroupsIndexPageQuery, useCreateGroupMutation, AdminGroupsIndexPageDocument } from '@graphql/generated/react-apollo'

export default function Page() {

  const session = useAdminSession({ redirectTo: '/admin/login' })
  const [createModalState, setCreateModalState] = useState({ show: false, groupData: null });

  const { data, loading, refetch } = useAdminGroupsIndexPageQuery()

  if (!session) return (<AdminLayout />)
  if (loading) return (<AdminLayout />)

  const showCreateModal = (e) => {
    setCreateModalState({ show: true, groupData: null })
  }

  if (session?.admin) {
    return (
      <AdminLayout withMenu>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispay Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.groups.map(group => (<tr key={group.id}>
              <td className="px-6 py-4 whitespace-nowrap">{group.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{group.displayName}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`groups/${encodeURIComponent(String(group.id))}`} passHref><a> <div className="py-2 px-4  bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">編集</div></a></Link>
              </td>
            </tr>))}
          </tbody>
        </table>
        <button type="button" className="py-2 px-4  bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg " onClick={showCreateModal}>グループの新規作成</button>

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
    onCompleted: (data) => { closeModal() },
    onError: (error) => { console.error(error.message) }
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
        <p className="text-sm text-gray-500">
          作成するグループ名を入力してください。そのほかの設定は作成後に設定できます。
        </p>
      </div>

      <div className="mt-2 relative ">
        <input type="text" name="name" value={formState.name || ''} onChange={handleSetFormValue}
          className="rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" placeholder="Group Name" />
      </div>

      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex justify-center py-2 px-4  bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white
            transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg">
          Create
        </button>
        <button
          type="button" onClick={closeModal}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md 
          hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
          Cancel
        </button>
      </div>
    </MyModal>
  )
}

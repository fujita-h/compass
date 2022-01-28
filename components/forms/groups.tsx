import { useState, useEffect, useRef, ChangeEvent, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Toggle, Pagination } from '@components/elements';
import { MyModal } from '@components/modals'
import Image from 'next/image'


import {
  Auth,
  useGroupQuery, GroupDocument,
  useUpdateGroupMutation,
  useUpdateGroupMemberMutation,
  useGetGroupWithMembersQuery, GetGroupWithMembersDocument, GetGroupWithMembersQuery,
  useDeleteGroupMemberMutation,
  useDeleteGroupMutation,
  useGetUsersQuery,
  useCreateGroupMemberMutation
} from '@graphql/generated/react-apollo'
import { InternalRefetchQueriesInclude } from '@apollo/client';

const uploadGroupIcon = async (files, groupId) => {
  const body = new FormData()
  body.append('groupId', groupId)
  files.map((file) => { body.append('file', file) })
  const res = await fetch("/api/files/groupicons", { method: "POST", body })
  return res.json()
}

export const EditGroupForm = ({ auth, groupId, refetchQueries }: { auth: Auth, groupId: string, refetchQueries?:InternalRefetchQueriesInclude }) => {

  const { data, loading, refetch } = useGroupQuery({ variables: { auth, id: groupId } })

  useEffect(() => {
    if (!data?.group) return
    setFormState(data?.group)
  }, [data])

  const [formState, setFormState] = useState(data?.group)
  const imageSelectForm = useRef(null);
  const [iconFile, setIconFile] = useState(null)
  const [iconImage, setIconImage] = useState(null)
  const [updateGroup, { }] = useUpdateGroupMutation({
    //refetchさせる必要があるか。updateに失敗した場合の処理があれば不要なはず
    //refetchQueries: [GetGroupDocument]
    refetchQueries: refetchQueries
  })
  const handleSubmit = async () => {

    if (iconFile) {
      uploadGroupIcon([iconFile], groupId)
        .then((res) => {
          setIconImage(null)
          imageSelectForm.current.value = ''
        }).catch((error) => {
          console.error(error)
        })
    }

    updateGroup({
      variables: {
        auth,
        id: groupId,
        ...formState,
      }
    })
  }
  const handleFormValueChanged = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value })
  }
  const handleFormBooleanChanged = (e) => {
    if (typeof formState[e.target.name] == 'number') { setFormState({ ...formState, [e.target.name]: Number(!Boolean(formState[e.target.name])) }) }
    else if (typeof formState[e.target.name] == 'boolean') { setFormState({ ...formState, [e.target.name]: !Boolean(formState[e.target.name]) }) }
    else { throw 'Unknown Type' }
  }

  const handleImageSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files === null || files.length === 0) {
      setIconFile(null)
      setIconImage(null)
      return;
    }
    const file = files[0]
    setIconFile(file)
    const reader = new FileReader()
    reader.onload = (readerEvent) => {
      setIconImage(readerEvent.target.result)
    }
    reader.readAsDataURL(file)
  }

  const rand = useMemo(() => Date.now().toString(),[data])
  const iconLoader = ({ src, width, quality }) => {
    return `/api/files/groupicons/${src}?rand=${rand}`
  }

  if (loading) return (<></>)
  if (!data) return (<></>)

  return (
    <div>

      <h2 className='text-md'>アイコン</h2>
      <div className='mt-4 ml-4 mb-8 flex'>
        <div className='w-60'>
          <div>現在のアイコン</div>
          <div className='inline-block'>
            <Image loader={iconLoader} src={encodeURIComponent(data.group.id)}
              width={128} height={128} alt={data.group.name} className='object-cover h-32 w-32' />
          </div>
        </div>
        <div>
          <div>
            <div>新しいアイコン</div>
            <div className='border inline-block'>
              {iconImage ?
                <img src={iconImage} alt="new-icon" className='object-cover h-32 w-32' /> :
                <svg viewBox="0 0 128 128" width="128" height="128" />}
            </div>
          </div>
          <input type="file" accept='image/jpg, image/png' onChange={handleImageSelected} ref={imageSelectForm}></input>
        </div>
      </div>

      <div className="relative">
        <label className="text-gray-700">id</label>
        <div className="py-2 px-4 text-gray-700 border-gray-300 rounded-lg  border hover:cursor-not-allowed">{formState?.id}</div>
      </div>

      <div className="relative">
        <label className="text-gray-700">Name</label>
        <input type="text" name="name" placeholder="Name"
          defaultValue={formState?.name || ''} onChange={handleFormValueChanged}
          className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" />
      </div>

      <div className="relative">
        <label className="text-gray-700">Dispaly Name</label>
        <input type="text" name="displayName" placeholder="Dispaly Name"
          defaultValue={formState?.displayName || ''} onChange={handleFormValueChanged}
          className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" />
      </div>

      <div>
        <label className="text-gray-700">Description</label>
        <textarea placeholder="Description" name="description" defaultValue={formState?.description || ''} onChange={handleFormValueChanged}
          className="flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" />
      </div>

      <div>
        <label className="text-gray-700">Type</label>
        <div className='mt-4'>
          <select name="type" defaultValue={data.group.type} onChange={handleFormValueChanged} className='border px-2 py-1 rounded-lg'>
          <option value={'public'}>パブリックグループ</option>
          <option value={'normal'}>標準グループ</option>
          <option value={'private'}>プライベートグループ</option>
          </select>
        </div>
      </div>

      <div className='mt-4'>
        <button type="button" onClick={handleSubmit}
          className="py-2 px-4  bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">
          <span>更新</span>
        </button>
      </div>
    </div>
  )
}


export const EditGroupMemberTable = ({ auth, groupId }: { auth: Auth, groupId: string }) => {

  const { data, loading, refetch } = useGetGroupWithMembersQuery({ variables: { auth, id: groupId }, fetchPolicy: 'network-only' })

  const [deleteModalState, setDeleteModalState] = useState({ show: false, group: undefined, user: undefined })
  const [addModalState, setAddModalState] = useState({ show: false })

  const [updateMember, { }] = useUpdateGroupMemberMutation({
    refetchQueries: [GetGroupWithMembersDocument]
  })

  const handleUpdateGroupMember = async (e) => {
    const userId = e.target.getAttribute('data-userid')
    const isAdmin = e.target.checked ? 1 : 0
    updateMember({ variables: { auth, userId, groupId, isAdmin } })
  }

  if (loading) return (<></>)
  if (!data) return (<></>)
  if (!data.group) return (<></>)

  const group = data.group

  return (<>
    <div className="mb-2 text-end">
      <button onClick={() => setAddModalState({ ...addModalState, show: true })}
        className="py-2 px-4  bg-pink-600 hover:bg-pink-700 focus:ring-pink-500 focus:ring-offset-pink-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-full">メンバーを追加</button>
    </div>
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">username</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-end">{group?.user_group_map.length} 人のメンバー</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {group?.user_group_map.map((user) => (
          <tr key={user.userId}>
            <td className="px-6 py-2 whitespace-nowrap">{user.user.username}</td>
            <td className="px-6 py-2 whitespace-nowrap">
              <input type="checkbox"
                data-userid={user.userId}
                name="isAdmin"
                checked={Boolean(user.isAdmin)}
                onChange={handleUpdateGroupMember} />
            </td>
            <td className="px-6 py-2 whitespace-nowrap">
              <button className="py-1 px-4 bg-red-600 hover:bg-red-700 focus:ring-red-500 focus:ring-offset-red-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                onClick={() => setDeleteModalState({ show: true, group, user })}>削除</button></td>
          </tr>
        ))}
      </tbody>
    </table>
    <AddUserModal auth={auth} state={addModalState} setState={setAddModalState} group={group} />
    <DeleteUserModal auth={auth} state={deleteModalState} setState={setDeleteModalState} />
  </>)

}

export const DangerZoneForm = ({ auth, groupId }: { auth: Auth, groupId: string }) => {

  const { data, loading, refetch } = useGroupQuery({ variables: { auth, id: groupId }, fetchPolicy: 'network-only' })

  const [deleteModalState, setDeleteModalState] = useState({ show: false })

  if (loading) return (<></>)
  if (!data.group) return (<></>)

  return (<>
    <div className="text-right">
      <button onClick={() => { setDeleteModalState({ ...deleteModalState, show: true }) }}
        className="py-2 px-4  bg-red-600 hover:bg-red-700 focus:ring-red-500 focus:ring-offset-red-200 text-white 
        w-48 transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg">
        <span>グループを削除</span>
      </button>
    </div>
    <DeleteGroupModal auth={auth} group={data.group} state={deleteModalState} setState={setDeleteModalState} onExited={() => { }} />
  </>)
}

const AddUserModal = ({ auth, state, setState, group }: { auth: Auth, state, setState, group: GetGroupWithMembersQuery["group"] }) => {

  return (
    <MyModal show={state.show} close={() => setState({ ...state, show: false })} title="メンバーの追加">
      <SearchUserForm auth={auth} state={state} setState={setState} groupId={group.id} currentMembers={group?.user_group_map} />
    </MyModal>
  )

}

const DeleteUserModal = ({ auth, state, setState }) => {

  const [deleteMember, { }] = useDeleteGroupMemberMutation({
    refetchQueries: [GetGroupWithMembersDocument],
    onCompleted: (data) => { closeModal() }
  })

  const handleSubmit = () => {
    deleteMember({ variables: { auth, groupId: state.group.id, userId: state.user.userId } })
  }

  const closeModal = () => {
    setState({ show: false, group: undefined, user: undefined })
  }

  return (
    <MyModal show={state.show} close={closeModal} title="メンバーの削除">
      <div className="mt-2">
        <p className="text-sm text-gray-500">
          以下を確認してください。
        </p>
        <ul className="text-sm text-gray-500">
          <li>ユーザー {state.user?.User?.username} を グループ {state.group?.name} から削除しようといています</li>
          <li>ユーザー {state.user?.User?.username} が グループ {state.group?.name} に作成した記事は削除されず残ります</li>
        </ul>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex justify-center py-2 px-4 w-full bg-red-600 hover:bg-red-700 focus:ring-red-500 focus:ring-offset-red-200 text-white
                        transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
        >
          {state.user?.User?.username} を削除します
        </button>
      </div>
    </MyModal>
  )
}

const DeleteGroupModal = ({ auth, group, state, setState, onExited }: {
  auth: Auth,
  group: { id: string; name: string; },
  state: { show: boolean },
  setState: Function, onExited: any
}) => {

  const router = useRouter()

  const [deleteGroup, { client }] = useDeleteGroupMutation({
    onCompleted: () => {
      /*
      リストのページに遷移した際に、キャッシュが残っていると、
      ここで削除したグループが一覧ページに残ってしまうので、
      ApolloClientのgroupsキャッシュをリセットする。
      */
      //client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'groups' })
      router.push('./')
    }
  })

  const closeModal = () => {
    setState({ ...state, show: false })
    setFormState('')
    onExited()
  }

  const [formState, setFormState] = useState('')
  const handleFormChanged = (e) => {
    setFormState(e.target.value)
  }

  const deleteSubmit = () => {
    deleteGroup({ variables: { auth, id: group.id } })
  }


  const isButtonDisabled = group?.name ? formState !== group?.name : true

  if (!router.isReady) return (<></>)


  return (
    <MyModal show={state.show} close={closeModal} title="グループの削除">
      <div>
        <p>グループ <span className="font-bold">{group?.name}</span> を削除しようとしています。</p>
        <ul className="list-disc mx-8">
          <li>グループに属しているメンバーは自動的にメンバーから削除されます</li>
          <li>グループに投稿された全ての記事は削除されます</li>
        </ul>
      </div>
      <div>
        <input type="text" name="verify" value={formState} onChange={handleFormChanged}
          className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" />
        <button
          className="mt-2 inline-flex justify-center py-2 px-4 w-full bg-red-600 disabled:bg-red-300 hover:bg-red-700 focus:ring-red-500 focus:ring-offset-red-200 text-white
          transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg disabled:opacity-50"
          type="button"
          disabled={isButtonDisabled}
          onClick={deleteSubmit}
        ><span>グループ <span className="font-bold">{group?.name}</span> を削除</span></button>
      </div>
    </MyModal>
  )
}

const SearchUserForm = ({ auth, state, setState, groupId, currentMembers }: { auth: Auth, state, setState, groupId: string, currentMembers: any[] }) => {
  const ITEMS_PER_PAGE = 10
  const [pageIndex, setPageIndex] = useState(0)
  const [selectedUsers, setSelectedUsers] = useState({})
  const { data, loading, error } = useGetUsersQuery({ variables: { auth: auth, offset: pageIndex * ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE } })
  const [createGroupMember, { }] = useCreateGroupMemberMutation({ refetchQueries: [GetGroupWithMembersDocument] })
  const handlePaginationChanged = (index) => {
    setPageIndex(index)
  }

  if (loading) return (<></>)
  if (!data?.users) return (<></>)

  const countUsers = data?.countUsers
  const users = data?.users

  const handleCeckboxChanged = (e) => {
    setSelectedUsers({ ...selectedUsers, [e.target.value]: e.target.checked })
  }

  const handleAddMember = (e) => {
    Object.keys(selectedUsers).forEach(key => {
      if (selectedUsers[key]) {
        createGroupMember({ variables: { auth, groupId, userId: key, isAdmin: 0 } })
      }
    })
    setState({ ...state, show: false })
  }

  return (
    <div>
      <div className="mb-2 text-end"><button className="px-2 py-1 rounded-md border border-gray-500 bg-blue-200" onClick={handleAddMember}>選択したユーザーを追加</button></div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">username</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map(user => {
            const isCurrent = currentMembers.find(x => x.userId == user.id)
            const checked = isCurrent ? true : selectedUsers[user.id] ?? false
            const onChange = isCurrent ? () => { } : handleCeckboxChanged
            return (
              <tr key={user.id}>
                <td className="px-6 py-1 whitespace-nowrap">
                  <input type="checkbox" value={user.id}
                    checked={checked}
                    onChange={onChange}
                    disabled={isCurrent}>
                  </input>
                </td>
                <td className="px-6 py-1 whitespace-nowrap">{user.username}</td>
              </tr>)
          })}
        </tbody>
      </table>
      <div className="mt-4 flex justify-center">
        <Pagination
          maxCount={countUsers}
          pageCount={ITEMS_PER_PAGE}
          pageIndex={pageIndex}
          onPageIndexChangedHookAsync={handlePaginationChanged} />
      </div>
    </div>
  )

}



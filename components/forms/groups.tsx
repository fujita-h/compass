import { useState, useEffect, useRef, ChangeEvent, useMemo } from 'react'
import { useRouter } from 'next/router'
import { Toggle, Pagination } from '@components/elements'
import { MyModal } from '@components/modals'
import Image from 'next/image'
import { doNothing } from '@lib/utils'
import {
  Auth,
  useGroupQuery,
  GroupDocument,
  useUpdateGroupMutation,
  useUpdateGroupMemberMutation,
  useGetGroupWithMembersQuery,
  GetGroupWithMembersDocument,
  GetGroupWithMembersQuery,
  useDeleteGroupMemberMutation,
  useDeleteGroupMutation,
  useUsersQuery,
  useCreateGroupMemberMutation,
} from '@graphql/generated/react-apollo'
import { InternalRefetchQueriesInclude } from '@apollo/client'

const uploadGroupIcon = async (files, groupId) => {
  const body = new FormData()
  body.append('groupId', groupId)
  files.map((file) => {
    body.append('file', file)
  })
  const res = await fetch('/api/files/groupicons', { method: 'POST', body })
  return res.json()
}

export const EditGroupForm = ({
  auth,
  groupId,
  refetchQueries,
  restrictTypeChange = false,
}: {
  auth: Auth
  groupId: string
  refetchQueries?: InternalRefetchQueriesInclude
  restrictTypeChange?: boolean
}) => {
  const { data, loading, refetch } = useGroupQuery({ variables: { auth, id: groupId } })

  useEffect(() => {
    if (!data?.group) return
    setFormState(data?.group)
  }, [data])

  const [formState, setFormState] = useState(data?.group)
  const imageSelectForm = useRef(null)
  const [iconFile, setIconFile] = useState(null)
  const [iconImage, setIconImage] = useState(null)
  const [updateGroup] = useUpdateGroupMutation({
    refetchQueries: refetchQueries,
  })
  const handleSubmit = async () => {
    if (iconFile) {
      uploadGroupIcon([iconFile], groupId)
        .then((res) => {
          setIconImage(null)
          imageSelectForm.current.value = ''
        })
        .catch((error) => {
          console.error(error)
        })
    }

    updateGroup({
      variables: {
        auth,
        id: groupId,
        ...formState,
      },
    })
  }
  const handleFormValueChanged = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value })
  }
  const handleFormBooleanChanged = (e) => {
    if (typeof formState[e.target.name] == 'number') {
      setFormState({ ...formState, [e.target.name]: Number(!Boolean(formState[e.target.name])) })
    } else if (typeof formState[e.target.name] == 'boolean') {
      setFormState({ ...formState, [e.target.name]: !Boolean(formState[e.target.name]) })
    } else {
      throw 'Unknown Type'
    }
  }

  const handleImageSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files === null || files.length === 0) {
      setIconFile(null)
      setIconImage(null)
      return
    }
    const file = files[0]
    setIconFile(file)
    const reader = new FileReader()
    reader.onload = (readerEvent) => {
      setIconImage(readerEvent.target.result)
    }
    reader.readAsDataURL(file)
  }

  const rand = useMemo(() => Date.now().toString(), [data])

  if (loading) return <></>
  if (!data) return <></>

  return (
    <div>
      <h2 className="text-md">????????????</h2>
      <div className="mt-4 ml-4 mb-8 flex">
        <div className="w-60">
          <div>?????????????????????</div>
          <div className="inline-block">
            <Image
              src={`/api/files/groupicons/${encodeURIComponent(data.group.id.toLowerCase())}?rand=${rand}`}
              width={128}
              height={128}
              alt={data.group.name}
              className="h-32 w-32 object-cover"
            />
          </div>
        </div>
        <div>
          <div>
            <div>?????????????????????</div>
            <div className="inline-block border">
              {iconImage ? (
                <img src={iconImage} alt="new-icon" className="h-32 w-32 object-cover" />
              ) : (
                <svg viewBox="0 0 128 128" width="128" height="128" />
              )}
            </div>
          </div>
          <input type="file" accept="image/jpg, image/png" onChange={handleImageSelected} ref={imageSelectForm}></input>
        </div>
      </div>

      <div className="relative">
        <label className="text-gray-700">id</label>
        <div className="rounded-lg border border-gray-300 py-2 px-4  text-gray-700 hover:cursor-not-allowed">{formState?.id}</div>
      </div>

      <div className="relative">
        <label className="text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          placeholder="Name"
          defaultValue={formState?.name || ''}
          onChange={handleFormValueChanged}
          className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      <div className="relative">
        <label className="text-gray-700">Dispaly Name</label>
        <input
          type="text"
          name="displayName"
          placeholder="Dispaly Name"
          defaultValue={formState?.displayName || ''}
          onChange={handleFormValueChanged}
          className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      <div>
        <label className="text-gray-700">Description</label>
        <textarea
          placeholder="Description"
          name="description"
          defaultValue={formState?.description || ''}
          onChange={handleFormValueChanged}
          className="w-full flex-1 appearance-none rounded-lg border border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      <div className="mt-2">
        <label className="text-gray-700">??????????????????</label>
        <div className="ml-4">
          <select
            name="type"
            defaultValue={data.group.type}
            disabled={restrictTypeChange}
            onChange={handleFormValueChanged}
            className="rounded-lg border border-gray-300 px-2 py-1"
          >
            <option value={'public'}>???????????????????????????</option>
            <option value={'normal'}>??????????????????</option>
            <option value={'private'}>??????????????????????????????</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-lg  bg-indigo-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2  focus:ring-offset-indigo-200 "
        >
          <span>??????</span>
        </button>
      </div>
    </div>
  )
}

export const EditGroupMemberTable = ({ auth, groupId }: { auth: Auth; groupId: string }) => {
  const { data, loading, refetch } = useGetGroupWithMembersQuery({ variables: { auth, id: groupId } })

  const [deleteModalState, setDeleteModalState] = useState({ show: false, group: undefined, user: undefined })
  const [addModalState, setAddModalState] = useState({ show: false })

  const [updateMember] = useUpdateGroupMemberMutation({
    refetchQueries: [GetGroupWithMembersDocument],
  })

  const handleUpdateGroupMember = async (e) => {
    const userId = e.target.getAttribute('data-userid')
    const isAdmin = e.target.checked ? 1 : 0
    updateMember({ variables: { auth, userId, groupId, isAdmin } })
  }

  if (loading) return <></>
  if (!data) return <></>
  if (!data.group) return <></>

  const group = data.group

  return (
    <>
      <div className="text-end mb-2">
        <button
          onClick={() => setAddModalState({ ...addModalState, show: true })}
          className="w-full rounded-full  bg-pink-600 py-2 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2  focus:ring-offset-pink-200"
        >
          ?????????????????????
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              username
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Admin
            </th>
            <th scope="col" className="text-end px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {group?.user_group_map.length} ??????????????????
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {group?.user_group_map.map((user) => (
            <tr key={user.userId}>
              <td className="whitespace-nowrap px-6 py-2">{user.user.username}</td>
              <td className="whitespace-nowrap px-6 py-2">
                <input
                  type="checkbox"
                  data-userid={user.userId}
                  name="isAdmin"
                  checked={Boolean(user.isAdmin)}
                  onChange={handleUpdateGroupMember}
                />
              </td>
              <td className="whitespace-nowrap px-6 py-2">
                <button
                  className="rounded-lg bg-red-600 py-1 px-4 text-center text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2  focus:ring-offset-red-200 "
                  onClick={() => setDeleteModalState({ show: true, group, user })}
                >
                  ??????
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AddUserModal auth={auth} state={addModalState} setState={setAddModalState} group={group} />
      <DeleteUserModal auth={auth} state={deleteModalState} setState={setDeleteModalState} />
    </>
  )
}

export const DangerZoneForm = ({ auth, groupId }: { auth: Auth; groupId: string }) => {
  const { data, loading, refetch } = useGroupQuery({ variables: { auth, id: groupId } })

  const [deleteModalState, setDeleteModalState] = useState({ show: false })

  if (loading) return <></>
  if (!data.group) return <></>

  return (
    <>
      <div className="text-right">
        <button
          onClick={() => {
            setDeleteModalState({ ...deleteModalState, show: true })
          }}
          className="w-48 rounded-lg  bg-red-600 py-2 px-4 text-center text-base 
        font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2  focus:ring-offset-red-200"
        >
          <span>?????????????????????</span>
        </button>
      </div>
      <DeleteGroupModal auth={auth} group={data.group} state={deleteModalState} setState={setDeleteModalState} onExited={doNothing} />
    </>
  )
}

const AddUserModal = ({ auth, state, setState, group }: { auth: Auth; state; setState; group: GetGroupWithMembersQuery['group'] }) => {
  return (
    <MyModal show={state.show} close={() => setState({ ...state, show: false })} title="?????????????????????">
      <SearchUserForm auth={auth} state={state} setState={setState} groupId={group.id} currentMembers={group?.user_group_map} />
    </MyModal>
  )
}

const DeleteUserModal = ({ auth, state, setState }) => {
  const [deleteMember] = useDeleteGroupMemberMutation({
    refetchQueries: [GetGroupWithMembersDocument],
    onCompleted: (data) => {
      closeModal()
    },
  })

  const handleSubmit = () => {
    deleteMember({ variables: { auth, groupId: state.group.id, userId: state.user.userId } })
  }

  const closeModal = () => {
    setState({ show: false, group: undefined, user: undefined })
  }

  return (
    <MyModal show={state.show} close={closeModal} title="?????????????????????">
      <div className="mt-2">
        <p className="text-sm text-gray-500">????????????????????????????????????</p>
        <ul className="text-sm text-gray-500">
          <li>
            ???????????? {state.user?.User?.username} ??? ???????????? {state.group?.name} ???????????????????????????????????????
          </li>
          <li>
            ???????????? {state.user?.User?.username} ??? ???????????? {state.group?.name} ???????????????????????????????????????????????????
          </li>
        </ul>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex w-full justify-center rounded-lg bg-red-600 py-2 px-4 text-center text-base font-semibold
                        text-white shadow-md transition duration-200 ease-in hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2  focus:ring-offset-red-200 "
        >
          {state.user?.User?.username} ??????????????????
        </button>
      </div>
    </MyModal>
  )
}

const DeleteGroupModal = ({
  auth,
  group,
  state,
  setState,
  onExited,
}: {
  auth: Auth
  group: { id: string; name: string }
  state: { show: boolean }
  setState: Function
  onExited: any
}) => {
  const router = useRouter()

  const [deleteGroup, { client }] = useDeleteGroupMutation({
    onCompleted: () => {
      /*
      ????????????????????????????????????????????????????????????????????????????????????
      ?????????????????????????????????????????????????????????????????????????????????
      ApolloClient???groups???????????????????????????????????????
      */
      //client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'groups' })
      router.push('./')
    },
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

  if (!router.isReady) return <></>

  return (
    <MyModal show={state.show} close={closeModal} title="?????????????????????">
      <div>
        <p>
          ???????????? <span className="font-meduim">{group?.name}</span> ???????????????????????????????????????
        </p>
        <ul className="mx-8 list-disc">
          <li>?????????????????????????????????????????????????????????????????????????????????????????????</li>
          <li>??????????????????????????????????????????????????????????????????</li>
        </ul>
      </div>
      <div>
        <input
          type="text"
          name="verify"
          value={formState}
          onChange={handleFormChanged}
          className=" w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <button
          className="mt-2 inline-flex w-full justify-center rounded-lg bg-red-600 py-2 px-4 text-center text-base font-semibold text-white
          shadow-md transition duration-200 ease-in hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-red-200 disabled:bg-red-300 disabled:opacity-50"
          type="button"
          disabled={isButtonDisabled}
          onClick={deleteSubmit}
        >
          <span>
            ???????????? <span className="font-meduim">{group?.name}</span> ?????????
          </span>
        </button>
      </div>
    </MyModal>
  )
}

const SearchUserForm = ({
  auth,
  state,
  setState,
  groupId,
  currentMembers,
}: {
  auth: Auth
  state
  setState
  groupId: string
  currentMembers: any[]
}) => {
  const ITEMS_PER_PAGE = 10
  const [pageIndex, setPageIndex] = useState(0)
  const [selectedUsers, setSelectedUsers] = useState({})
  const { data, loading, error } = useUsersQuery({
    variables: { auth: auth, offset: pageIndex * ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE },
  })
  const [createGroupMember] = useCreateGroupMemberMutation({ refetchQueries: [GetGroupWithMembersDocument] })
  const handlePaginationChanged = (index) => {
    setPageIndex(index)
  }

  if (loading) return <></>
  if (!data?.users) return <></>

  const countUsers = data?.countUsers
  const users = data?.users

  const handleCeckboxChanged = (e) => {
    setSelectedUsers({ ...selectedUsers, [e.target.value]: e.target.checked })
  }

  const handleAddMember = (e) => {
    Object.keys(selectedUsers).forEach((key) => {
      if (selectedUsers[key]) {
        createGroupMember({ variables: { auth, groupId, userId: key, isAdmin: 0 } })
      }
    })
    setState({ ...state, show: false })
  }

  return (
    <div>
      <div className="text-end mb-2">
        <button className="rounded-md border border-gray-500 bg-blue-200 px-2 py-1" onClick={handleAddMember}>
          ?????????????????????????????????
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"></th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              username
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.map((user) => {
            const isCurrent = currentMembers.find((x) => x.userId == user.id)
            const checked = isCurrent ? true : selectedUsers[user.id] ?? false
            const onChange = isCurrent ? doNothing : handleCeckboxChanged
            return (
              <tr key={user.id}>
                <td className="whitespace-nowrap px-6 py-1">
                  <input type="checkbox" value={user.id} checked={checked} onChange={onChange} disabled={isCurrent}></input>
                </td>
                <td className="whitespace-nowrap px-6 py-1">{user.username}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="mt-4 flex justify-center">
        <Pagination
          maxCount={countUsers}
          pageCount={ITEMS_PER_PAGE}
          pageIndex={pageIndex}
          onPageIndexChangedHookAsync={handlePaginationChanged}
        />
      </div>
    </div>
  )
}

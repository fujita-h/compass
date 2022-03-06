import { Dispatch, SetStateAction, useState } from 'react'
import { Layout } from '@components/layouts'
import { MyModal } from '@components/modals'
import { GroupType, useCreateGroupMutation } from '@graphql/generated/react-apollo'
import Router from 'next/router'

type CreateGroupModalStateType = {
  show: boolean
  type: GroupType
}

export default function Page() {
  const initModalState: CreateGroupModalStateType = { show: false, type: 'public' }

  const [createGroupModalState, setCreateGroupModalState] = useState(initModalState)
  const showCreatePublicGroupModal = (e) => {
    setCreateGroupModalState({ show: true, type: 'public' })
  }
  const showCreateNormalGroupModal = (e) => {
    setCreateGroupModalState({ show: true, type: 'normal' })
  }
  const showCreatePrivateGroupModal = (e) => {
    setCreateGroupModalState({ show: true, type: 'private' })
  }

  return (
    <Layout>
      <div className="mx-auto mt-5 max-w-6xl bg-white p-5">
        <div>
          <h1 className="text-2xl">Create New Group</h1>
          <span className="text-base">新しいグループを作成します。</span>
        </div>
        <div className="mt-4 rounded-md border bg-white p-3 text-sm">
          <span>
            グループは、ある特定の目的を達成するために情報を共有する人々の集まりです。作成するドキュメントは必ずいずれかのグループに属している必要があります。
          </span>
        </div>
        <div className="mt-5 flex content-between">
          <div className="mr-5 flex w-full flex-col rounded-lg border p-3">
            <div className="flex-grow">
              <h2 className="border-b-1 text-xl">パブリックグループ</h2>
              <div>パブリックグループは全てのユーザーが投稿・閲覧できるグループです。</div>
            </div>
            <div className="mt-3 flex-none">
              <button
                type="button"
                className="w-full rounded-lg bg-teal-600 py-2  px-4 
             text-center text-base font-semibold text-white shadow-md transition duration-200
            ease-in hover:bg-teal-700 focus:outline-none 
            focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-teal-200"
                onClick={showCreatePublicGroupModal}
              >
                <span>パブリックグループの新規作成</span>
              </button>
            </div>
          </div>

          <div className="mr-5 flex w-full flex-col rounded-lg border p-3">
            <div className="flex-grow">
              <h2 className="border-b-1 text-xl">標準グループ</h2>
              <div>
                標準グループは、メンバーが投稿でき、全ての登録ユーザーが閲覧できるグループです。メンバーはグループ管理者によって管理されます。
              </div>
            </div>
            <div className="mt-3 flex-none">
              <button
                type="button"
                className="w-full rounded-lg bg-amber-600 py-2  px-4 
             text-center text-base font-semibold text-white shadow-md transition duration-200
            ease-in hover:bg-amber-700 focus:outline-none 
            focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-amber-200"
                onClick={showCreateNormalGroupModal}
              >
                <span>標準グループの新規作成</span>
              </button>
            </div>
          </div>

          <div className="ml-5 flex w-full flex-col rounded-lg border p-3">
            <div className="flex-grow">
              <h2 className="border-b-1 text-xl">プライベートグループ</h2>
              <div>
                プライベートグループは、メンバー内のみで投稿・閲覧が出来るグループです。メンバー以外からは内容を確認することは出来ません。メンバーはグループ管理者によって管理されます。
              </div>
            </div>
            <div className="mt-3 flex-none">
              <button
                type="button"
                className="w-full rounded-lg bg-rose-600 py-2  px-4
             text-center text-base font-semibold text-white shadow-md transition duration-200
            ease-in hover:bg-rose-700 focus:outline-none 
            focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-rose-200"
                onClick={showCreatePrivateGroupModal}
              >
                <span>プライベートグループの新規作成</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <CreateGroupModal state={createGroupModalState} setState={setCreateGroupModalState} />
    </Layout>
  )
}

const CreateGroupModal = ({
  state,
  setState,
}: {
  state: CreateGroupModalStateType
  setState: Dispatch<SetStateAction<CreateGroupModalStateType>>
}) => {
  const [formState, setFormState] = useState({ name: '' })

  const [createGroup, { data, loading, error }] = useCreateGroupMutation({
    onCompleted: (data) => {
      closeModal()
      Router.push('/groups/' + data.createGroup.name)
    },
    onError: (error) => {
      console.error(error.message)
    },
  })

  const handleSetFormValue = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    createGroup({ variables: { auth: 'user', name: formState.name, type: state.type } })
  }

  const closeModal = () => {
    setState({ ...state, show: false })
    setFormState({ ...formState, name: '' })
  }
  return (
    <MyModal show={state.show} close={closeModal} title="グループの作成">
      <div className="mt-2">
        <p className="text-sm text-gray-500">
          {state.type === 'public'
            ? '作成するパブリックグループの名称を入力してください。そのほかの設定は作成後に設定できます。'
            : state.type === 'normal'
            ? '作成する標準グループの名称を入力してください。そのほかの設定は作成後に設定できます。'
            : state.type === 'private'
            ? '作成するプライベートグループの名称を入力してください。そのほかの設定は作成後に設定できます。'
            : ''}
        </p>
      </div>

      <div className="relative mt-2 ">
        <input
          type="text"
          name="name"
          value={formState.name || ''}
          onChange={handleSetFormValue}
          className="w-full flex-1 appearance-none rounded-lg border border-transparent border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Group Name"
        />
      </div>

      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={handleSubmit}
          className={
            state.type === 'public'
              ? 'inline-flex justify-center rounded-lg bg-teal-600 py-2 px-4 text-center  text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2  focus:ring-offset-teal-200'
              : state.type === 'normal'
              ? 'inline-flex justify-center rounded-lg bg-amber-600 py-2 px-4 text-center  text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2  focus:ring-offset-amber-200'
              : state.type === 'private'
              ? 'inline-flex justify-center rounded-lg bg-rose-600 py-2 px-4 text-center  text-base font-semibold text-white shadow-md transition duration-200 ease-in hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2  focus:ring-offset-rose-200'
              : ''
          }
        >
          <span>
            {state.type === 'public'
              ? 'パブリックグループの作成'
              : state.type === 'normal'
              ? '標準グループの作成'
              : state.type === 'private'
              ? 'プライベートグループの作成'
              : ''}
          </span>
        </button>
        <button
          type="button"
          onClick={closeModal}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 
          hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <span>キャンセル</span>
        </button>
      </div>
    </MyModal>
  )
}

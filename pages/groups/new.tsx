import { useState } from 'react'
import { Layout } from '@components/layouts'
import { MyModal } from '@components/modals'
import { Auth, useCreateGroupMutation } from '@graphql/generated/react-apollo';
import Router from 'next/router';

export default function Page() {

  const [createGroupModalState, setCreateGroupModalState] = useState({ show: false, isPrivate: 0 });
  const showCreatePublicGroupModal = (e) => { setCreateGroupModalState({ show: true, isPrivate: 0 }) }
  const showCreatePrivateGroupModal = (e) => { setCreateGroupModalState({ show: true, isPrivate: 1 }) }

  return (<Layout>
    <div className='w-full'>
      <h1 className='text-2xl font-bold'>Create New Group</h1>
      <div>新しいグループを作成します。</div>
      <div className='flex content-between mt-5'>
        <div className='flex flex-col w-full mr-5 border rounded-lg p-3'>
          <div className='flex-grow'>
            <h2 className='text-xl border-b-1'>パブリックグループ</h2>
            <div>パブリックグループは全ての登録ユーザーが投稿・閲覧できるグループです。</div>
          </div>
          <div className='flex-none mt-3'>
            <button type="button"
              className="py-2 px-4 w-full shadow-md  rounded-lg 
             bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 focus:ring-offset-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            transition ease-in duration-200 
            text-white text-center text-base font-semibold"
              onClick={showCreatePublicGroupModal}>
              <span>パブリックグループの新規作成</span>
            </button>
          </div>
        </div>
        <div className='flex flex-col w-full ml-5 border rounded-lg p-3'>
          <div className='flex-grow'>
            <h2 className='text-xl border-b-1'>プライベートグループ</h2>
            <div>プライベートグループは、特定のメンバー内のみで投稿・閲覧が出来るグループです。メンバー以外からは内容を確認することは出来ません。メンバーはグループ管理者によって管理されます。</div>
          </div>
          <div className='flex-none mt-3'>
            <button type="button"
              className="py-2 px-4 w-full shadow-md  rounded-lg
             bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 focus:ring-offset-rose-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            transition ease-in duration-200 
            text-white text-center text-base font-semibold"
              onClick={showCreatePrivateGroupModal}>
              <span>プライベートグループの新規作成</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <CreateGroupModal state={createGroupModalState} setState={setCreateGroupModalState} />
  </Layout>)
}


const CreateGroupModal = ({ state, setState }) => {
  const [formState, setFormState] = useState({ name: '' })

  const [createGroup, { data, loading, error }] = useCreateGroupMutation({
    onCompleted: (data) => {
      closeModal()
      Router.push('/groups/' + data.createGroup.id)
    },
    onError: (error) => { console.error(error.message) }
  })


  const handleSetFormValue = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    createGroup({ variables: { auth: Auth.User, name: formState.name, isPrivate: state.isPrivate } })
  }

  const closeModal = () => {
    setState({ ...state, show: false })
    setFormState({ ...formState, name: '' })
  }
  return (
    <MyModal show={state.show} close={closeModal} title="グループの作成">
      <div className="mt-2">
        <p className="text-sm text-gray-500">
          {state.isPrivate ?
            '作成するプライベートグループの名称を入力してください。そのほかの設定は作成後に設定できます。' :
            '作成するパブリックグループの名称を入力してください。そのほかの設定は作成後に設定できます。'}
        </p>
      </div>

      <div className="mt-2 relative ">
        <input type="text" name="name" value={formState.name || ''} onChange={handleSetFormValue}
          className="rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" placeholder="Group Name" />
      </div>

      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={handleSubmit}
          className={state.isPrivate ?
            "inline-flex justify-center py-2 px-4 bg-rose-600 hover:bg-rose-700 focus:ring-rose-500  focus:ring-offset-rose-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg" :
            "inline-flex justify-center py-2 px-4 bg-teal-600 hover:bg-teal-700 focus:ring-teal-500  focus:ring-offset-teal-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg"}>
          <span>{state.isPrivate ? 'プライベートグループの作成' : 'パブリックグループの作成'}</span>
        </button>
        <button
          type="button" onClick={closeModal}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md 
          hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
          <span>キャンセル</span>
        </button>
      </div>
    </MyModal>
  )
}
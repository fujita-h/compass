import { useRouter } from 'next/router'
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { getAsString, classNames } from '@lib/utils'
import GroupPageLayout from '@components/layouts/groupPageLayout'
import { GroupMembersDocument, useGroupMembersQuery } from '@graphql/generated/react-apollo'
import { EditGroupForm } from '@components/forms/groups'

export default function Page(props) {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const groupName = getAsString(router.query?.groupName)

  if (!session?.id) return <Layout></Layout>
  if (!groupName) return <Layout></Layout>
  return (
    <Layout>
      <InnerPage userId={session.id.toUpperCase()} groupName={groupName} />
    </Layout>
  )
}

const InnerPage = ({ userId, groupName }: { userId: string; groupName: string }) => {
  const { data, loading } = useGroupMembersQuery({ variables: { auth: 'user', name: groupName } })

  if (loading) return <GroupPageLayout currentUrl="/members" userId={userId} groupName={groupName} />
  if (!data)
    return (
      <GroupPageLayout currentUrl="/members" userId={userId} groupName={groupName}>
        <div>Group Not Found.</div>
      </GroupPageLayout>
    )

  return (
    <GroupPageLayout currentUrl="/settings" userId={userId} groupName={groupName}>
      <div className="ml-8 mr-4">
        <div>
          <div className="space-y-8 divide-y divide-gray-200">
            <div>
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">全般設定</h3>
                <p className="mt-1 text-sm text-gray-500">グループに関する情報を設定します。</p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    グループ名
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="off"
                      defaultValue={data.group.name}
                      className="form-input block w-full min-w-0 flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    グループ名はアルファベット、数字、ハイフン、アンダースコアのみが使用できます。
                    <br />
                    <span className="text-red-500">グループ名を変更するとグループのURLが変更されます。</span>
                  </p>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    表示名
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="displayName"
                      id="displayName"
                      autoComplete="off"
                      defaultValue={data.group.displayName}
                      className="form-input block w-full min-w-0 flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                    グループの説明
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="about"
                      name="about"
                      rows={3}
                      className="form-input block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={data.group.description}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">このグループについて簡単に説明して下さい。</p>
                </div>
              </div>
            </div>
            <div className="pt-8">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">イメージ設定</h3>
                <p className="mt-1 text-sm text-gray-500">グループのアイコン、カバー写真の設定を行います。</p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                    グループ画像
                  </label>
                  <div className="mt-1 flex items-center">
                    <span className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                      <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </span>
                    <button
                      type="button"
                      className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="cover-photo" className="block text-sm font-medium text-gray-700">
                    カバー写真
                  </label>
                  <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">その他の設定</h3>
                <p className="mt-1 text-sm text-gray-500">その他の設定を行います。</p>
              </div>
              <div className="mt-6">
                <fieldset disabled>
                  <div>
                    <legend className="text-base font-medium text-gray-900">グループタイプ</legend>
                    <p className="text-sm text-gray-500">現在、グループタイプの設定は変更できません。</p>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="type-public"
                        name="type"
                        type="radio"
                        defaultChecked={data.group.type === 'public'}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="type-public" className="ml-3 block text-sm font-medium text-gray-700">
                        公開グループ
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="type-normal"
                        name="type"
                        type="radio"
                        defaultChecked={data.group.type === 'normal'}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="type-normal" className="ml-3 block text-sm font-medium text-gray-700">
                        標準グループ
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="type-private"
                        name="type"
                        type="radio"
                        defaultChecked={data.group.type === 'private'}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="type-private" className="ml-3 block text-sm font-medium text-gray-700">
                        非公開グループ
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </GroupPageLayout>
  )
}

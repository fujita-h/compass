import { useState, useEffect, ChangeEvent } from 'react'
import { Layout } from '@components/layouts'
import { MyProfileDocument, useMyProfileQuery, useUpdateMyProfileMutation } from '@graphql/generated/react-apollo'
import { UserSettingsPageLayout } from '@components/layouts/userSettingsPageLayout'
import { classNames } from '@lib/utils'
import { useDropzone } from 'react-dropzone'
import ProfileHeader from '@components/profileHeader'
import { useSession } from '@lib/hooks'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  return (
    <Layout>
      <InnerPage />
    </Layout>
  )
}

const InnerPage = () => {
  const { data, loading } = useMyProfileQuery()
  const [formState, setFormState] = useState(data?.myProfile)
  const [icon, setIcon] = useState({ file: null, image: null })
  const [cover, setCover] = useState({ file: null, image: null })
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setCoverFiles(acceptedFiles)
    },
  })
  const [updateMyProfile] = useUpdateMyProfileMutation()
  const [ts, setTs] = useState(Date.now())

  const uploadUserFile = async (files, path) => {
    const body = new FormData()
    files.map((file) => {
      body.append('file', file)
    })
    const res = await fetch(path, { method: 'POST', body })
    return res.json()
  }

  useEffect(() => {
    if (!data?.myProfile) return
    setFormState(data?.myProfile)
  }, [data])

  const handleFormValueChanged = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value })
  }

  const handleIconChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files === null || files.length === 0) {
      setIcon({ file: null, image: null })
      return
    }
    const reader = new FileReader()
    reader.onload = (readerEvent) => {
      setIcon({ file: files[0], image: readerEvent.target.result })
    }
    reader.readAsDataURL(files[0])
  }

  const handleCoverChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setCoverFiles(e.target.files)
  }

  const setCoverFiles = (files) => {
    if (files === null || files.length === 0) {
      setCover({ file: null, image: null })
      return
    }
    const reader = new FileReader()
    reader.onload = (readerEvent) => {
      setCover({ file: files[0], image: readerEvent.target.result })
    }
    reader.readAsDataURL(files[0])
  }

  const handleSubmit = async () => {
    if (icon.file) {
      uploadUserFile([icon.file], '/api/files/usericons').then((res) => {
        setIcon({ file: null, image: null })
      })
    }

    if (cover.file) {
      uploadUserFile([cover.file], '/api/files/usercovers').then((res) => {
        setCover({ file: null, image: null })
      })
    }

    updateMyProfile({
      variables: { auth: 'user', ...formState },
      refetchQueries: [MyProfileDocument],
      onCompleted: (val) => {
        setTs(Date.now())
      },
    })
  }

  if (loading) return <UserSettingsPageLayout currentUrl="/profile" />
  if (!data)
    return (
      <UserSettingsPageLayout currentUrl="/profile">
        <div>Profile Not Found.</div>
      </UserSettingsPageLayout>
    )

  return (
    <UserSettingsPageLayout currentUrl="/profile">
      <div className="mb-4 rounded-lg bg-white p-2 shadow-lg">
        <ProfileHeader
          coverSrc={`/api/files/usercovers/${encodeURIComponent(data.myProfile.id.toLowerCase())}?ts=${ts}`}
          iconSrc={`/api/files/usericons/${encodeURIComponent(data.myProfile.id.toLowerCase())}?ts=${ts}`}
          name={data.myProfile.username}
          displayName={data.myProfile.displayName || ''}
          directImageLoading={true}
          iconRounded={true}
        />

        <div className="ml-8 mr-4 mt-10 border-t-1 border-gray-300 pt-6 pb-10">
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
                      ユーザー名
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="username"
                        id="username"
                        autoComplete="off"
                        defaultValue={data.myProfile.username}
                        onChange={handleFormValueChanged}
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
                        defaultValue={data.myProfile.displayName}
                        onChange={handleFormValueChanged}
                        className="form-input block w-full min-w-0 flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      グループの説明
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        className="form-input block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        defaultValue={data.myProfile.description}
                        onChange={handleFormValueChanged}
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
                  <p className="mt-1 text-sm text-gray-500">画像の変更は、全体に反映されるまで時間がかかります。</p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-y-8 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                      ユーザー画像
                    </label>
                    <div className="mt-2 flex items-center">
                      <span className="h-16 w-16 overflow-hidden rounded-full bg-gray-100">
                        {icon.image ? (
                          <img src={icon.image} alt="new-icon" className="h-16 w-16 object-cover" />
                        ) : (
                          <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                      </span>
                      <label
                        htmlFor="icon-upload"
                        className="ml-5 cursor-pointer rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        <span>Upload</span>
                        <input id="icon-upload" name="icon-upload" type="file" className="sr-only" onChange={handleIconChanged} />
                      </label>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="cover-photo" className="block text-sm font-medium text-gray-700">
                      カバー写真
                    </label>
                    <div
                      className={classNames(
                        isDragActive ? 'border-indigo-500' : 'border-gray-300',
                        'mt-2 flex justify-center rounded-md border-2 border-dashed  px-6 pt-5 pb-6'
                      )}
                      {...getRootProps({
                        onClick: (e) => {
                          e.stopPropagation()
                        },
                      })}
                    >
                      <div className="space-y-1 text-center">
                        {cover.image ? (
                          <img src={cover.image} alt="new-icon" className="max-h-64 max-w-full object-cover" />
                        ) : (
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
                        )}
                        <div className="flex justify-center text-sm text-gray-600">
                          <label
                            htmlFor="cover-upload"
                            className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                          >
                            <span>Upload a file</span>
                            <input id="cover-upload" name="cover-upload" type="file" className="sr-only" onChange={handleCoverChanged} />
                            <input {...getInputProps()} />
                          </label>
                          <p className="pl-1"> or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>
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
                  type="button"
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={handleSubmit}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserSettingsPageLayout>
  )
}

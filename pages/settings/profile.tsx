import { useState, useEffect, useRef, ChangeEvent, useMemo } from 'react';
import Image from 'next/image'
import { UserSettingLayout } from '@components/layouts'
import { FullCard } from '@components/elements'
import { Auth, useMyProfileQuery, useUpdateMyProfileMutation } from '@graphql/generated/react-apollo'

const uploadUserIcon = async (files) => {
  const body = new FormData()
  files.map((file) => { body.append('file', file) })
  const res = await fetch("/api/files/usericons", { method: "POST", body })
  return res.json()
}

export default function Page() {

  const { data, loading } = useMyProfileQuery({ fetchPolicy: "network-only" })
  const imageSelectForm = useRef(null);
  const [iconFile, setIconFile] = useState(null)
  const [iconImage, setIconImage] = useState(null)
  const [formState, setFormState] = useState(data?.myProfile)
  const [updateMyProfile, { }] = useUpdateMyProfileMutation({})

  useEffect(() => {
    if (!data?.myProfile) return
    setFormState(data?.myProfile)
  }, [data])

  const handleSubmit = async () => {

    if (iconFile) {
      uploadUserIcon([iconFile])
        .then((res) => {
          setIconImage(null)
          imageSelectForm.current.value = ''
        }).catch((error) => {
          console.error(error)
        })
    }

    updateMyProfile({
      variables: {
        auth: 'user',
        ...formState,
      }
    }).then((res) => {
      setFormState(res.data.updateMyProfile)
    })
  }

  const handleFormValueChanged = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value })
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

  const rand = useMemo(() => Date.now().toString(), [data])
  const iconLoader = ({ src, width, quality }) => {
    return `/api/files/usericons/${src}?rand=${rand}`
  }

  if (loading) return (<UserSettingLayout></UserSettingLayout>)

  return (<UserSettingLayout>
    <div>


      <FullCard>
        <h2 className='text-lg font-bold'>アイコン</h2>
        <div className='mt-4 ml-4 mb-8 flex'>
          <div className='w-60'>
            <div>現在のアイコン</div>
            <div className='inline-block'>
              <Image loader={iconLoader}
                src={encodeURIComponent(data.myProfile.id)}
                width={128} height={128} alt={data.myProfile.username} className='object-cover h-32 w-32 rounded-full' />
            </div>
          </div>
          <div>
            <div>
              <div>新しいアイコン</div>
              <div className='border inline-block'>
                {iconImage ?
                  <img src={iconImage} alt="new-icon" className='object-cover h-32 w-32 rounded-full' /> :
                  <svg viewBox="0 0 128 128" width="128" height="128" />}
              </div>
            </div>
            <input type="file" accept='image/jpg, image/png' onChange={handleImageSelected} ref={imageSelectForm}></input>
          </div>
        </div>

        <h2 className='text-lg font-bold'>ユーザー設定</h2>
        <div className='ml-4'>
          <div className="relative">
            <label className="text-gray-700">id</label>
            <div className="py-2 px-4 text-gray-700 border-gray-300 rounded-lg  border hover:cursor-not-allowed">{data.myProfile.id}</div>
          </div>
          <div className="relative">
            <label className="text-gray-700">username</label>
            <div className="py-2 px-4 text-gray-700 border-gray-300 rounded-lg  border hover:cursor-not-allowed">{data.myProfile.username}</div>
          </div>
          <div className="relative">
            <label className="text-gray-700">displayName</label>
            <input type="text" name="displayName" placeholder="Dispaly Name"
              defaultValue={formState?.displayName || ''} onChange={handleFormValueChanged}
              className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" />
          </div>
          <div>
            <div className="text-gray-700">自己紹介</div>
            <textarea name="description" placeholder='所属や自己紹介、アピールポイント'
              className='border border-gray-300 rounded-lg p-2 w-full' 
              defaultValue={formState?.description} onChange={handleFormValueChanged} />
          </div>

          <div className='mt-2'>
            <button className='border rounded-md h-10 w-40 bg-blue-100' onClick={handleSubmit}>
              <span>更新</span></button>
          </div>
        </div>
      </FullCard>
    </div>

  </UserSettingLayout>)
}
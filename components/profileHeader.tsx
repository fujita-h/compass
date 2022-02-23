import Image, { ImageLoader } from 'next/image'

type Props = {
  coverImageUrl: string
  iconSrc: string
  name: string
  displayName: string
  children?: JSX.Element // Button Items
}

export default function ProfileHeader(props: Props) {
  return (
    <div>
      <div>
        <img className="h-32 w-full object-cover lg:h-48" src={props.coverImageUrl} alt="" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
          <div className="flex">
            <div className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32">
              <Image src={props.iconSrc} width={128} height={128} alt={props.name} className="rounded-full bg-white" />
            </div>
          </div>
          <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="mt-6 min-w-0 flex-1 sm:hidden">
              <h1 className="font-meduim truncate text-2xl text-gray-900">{props.displayName}</h1>
              <h2 className="font-meduim truncate text-base text-gray-400">{props.name}</h2>
            </div>
            <div className="justify-stretch mt-6 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              {/* Button Items Area */}
              {props.children}
              {/* -- SAMPLE --
               * <button
               *   type="button"
               *   className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
               * >
               *   <MailIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
               *   <span>Message</span>
               * </button>
               */}
            </div>
          </div>
        </div>
        <div className="mt-6 hidden min-w-0 flex-1 sm:block">
          <h1 className="font-meduim truncate text-2xl text-gray-900">{props.displayName}</h1>
          <h2 className="font-meduim truncate text-base text-gray-400">{props.name}</h2>
        </div>
      </div>
    </div>
  )
}

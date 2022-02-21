import { RiCompasses2Line } from 'react-icons/ri'

export const Footer = () => {
  return (
    <div className=" border-t-1 border-gray-300 text-gray-500">
      <div className="flex items-center justify-between py-8 px-8">
        <div>
          <div>
            <RiCompasses2Line className="inline-block h-8 w-8" />
            <span className="ml-1 align-middle text-lg font-normal">Compass</span>
          </div>
        </div>
        <div className="px-8 text-base font-light">
          <a href="https://github.com/fujita-h/compass" target="_blank">
            Project hosted on <span className="font-medium">GitHub</span>
          </a>
        </div>
      </div>
    </div>
  )
}

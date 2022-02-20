import { RiCompasses2Line } from 'react-icons/ri'

export const Footer = () => {
  return (
    <div className="bg-zinc-800 text-white">
      <div className="flex items-center justify-between py-4 px-8">
        <div>
          <div>
            <RiCompasses2Line className="inline-block h-12 w-12" />
            <span className="align-middle text-2xl font-bold">Compass</span>
          </div>
        </div>
        <div className="px-8">
          <a href="https://github.com/fujita-h/compass" target="_blank">
            Project hosted on <span className="font-bold">GitHub</span>
          </a>
        </div>
      </div>
    </div>
  )
}

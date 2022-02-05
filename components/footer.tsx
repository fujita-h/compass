import { RiCompasses2Line } from "react-icons/ri"

export const Footer = () => {
  return (
    <div className="bg-zinc-800 text-white">
      <div className="flex justify-between items-center py-4 px-8">
        <div>
          <div><RiCompasses2Line className='w-12 h-12 inline-block' /><span className='text-2xl font-bold align-middle'>Compass</span></div>
        </div>
        <div className="px-8">
            <a href="https://github.com/fujita-h/compass" target="_blank">Project hosted on <span className="font-bold">Github</span></a>
        </div>
      </div>
    </div>
  )
}
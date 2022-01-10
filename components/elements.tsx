import { ChangeEventHandler, MouseEventHandler } from 'react'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/solid'
import { groupIconLoader, userIconLoader } from '@components/imageLoaders'
import Image from 'next/image'
import Link from 'next/link'


export const Toggle = ({ id, name, label, color, checked = false, onChange }: { id: string, name?: string, label?: string, color?: string, checked?: boolean, onChange?: ChangeEventHandler }) => {

  const _name = name ?? id
  const _color = color ?? '#0d6efd'

  return (
    <div>
      <div className="relative inline-block w-8 mr-2 align-middle select-none transition duration-200 ease-in">
        <style jsx>{`.toggle-checkbox:checked {right: 0; border-color: ${_color};} .toggle-checkbox:checked + .toggle-label {background-color: ${_color};}`}</style>
        <input type="checkbox" id={id} name={_name} onChange={onChange} checked={checked} className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 border-gray-300 appearance-none cursor-pointer" />
        <label htmlFor={id} className="toggle-label block overflow-hidden h-4 rounded-full bg-gray-300 cursor-pointer" />
      </div>
      <label htmlFor={id} className="align-middle cursor-pointer" >{label}</label>
    </div>

  )
}

export const FullCard = ({ children }) => (
  <div className="shadow-lg border border-gray-200 rounded-2xl w-full p-4 bg-white relative overflow-hidden">
    {children}
  </div>
)

export const Pagination = ({ maxCount, pageCount, pageIndex, onPageIndexChangedHookAsync }) => {

  const maxPages = Math.ceil(maxCount / pageCount)
  let items = []

  const commonClass = "relative flex justify-center items-center border text-sm font-medium hover:cursor-pointer p-1 h-10 w-10"
  const leftIconClass = "bg-white rounded-l-lg border-gray-300 text-gray-500 hover:bg-gray-50 " + " " + commonClass
  const rightIconClass = "bg-white rounded-r-lg border-gray-300 text-gray-500 hover:bg-gray-50 " + " " + commonClass
  const defaultClass = "bg-white border-gray-300 text-gray-500 hover:bg-gray-50" + " " + commonClass
  const activeClass = "z-10 bg-indigo-50 border-indigo-500 text-indigo-600 " + " " + commonClass


  if (maxPages <= 5) {
    for (let num = 0; num < maxPages; num++) {
      items.push(<div
        key={num}
        className={num === pageIndex ? activeClass : defaultClass}
        onClick={() => onPageIndexChangedHookAsync(num)}
      >
        <span>{num + 1}</span>
      </div>)
    }
  } else {
    const start = pageIndex < 2 ? 0 : pageIndex < maxPages - 2 ? pageIndex - 2 : maxPages - 5

    items.push(<div
      className={leftIconClass}
      onClick={() => onPageIndexChangedHookAsync(0)}
    >
      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
    </div>)
    for (let num = start; num < start + 5; num++) {
      items.push(<div
        key={num}
        className={num === pageIndex ? activeClass : defaultClass}
        onClick={() => onPageIndexChangedHookAsync(num)}
      >
        <span>{num + 1}</span>
      </div>)
    }
    items.push(<div
      className={rightIconClass}
      onClick={() => onPageIndexChangedHookAsync(maxPages - 1)}
    >
      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
    </div>)
  }



  return (
    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
      {items.map(item => item)}
    </nav>
  )
}

export const UserIconNameLinkSmall = ({ userId, userName }: { userId: string, userName: string }) => {
  return (
    <div className='inline-block'>
      <Link href={`/users/${encodeURIComponent(userId.toLowerCase())}`} passHref>
        <div className='group hover:underline font-bold hover:cursor-pointer'>
          <div className='inline-block mr-1 group-hover:brightness-90'>
            <Image loader={userIconLoader} src={userId.toLowerCase()} width={16} height={16} alt={userName} className='rounded-full' />
          </div>
          <span>@{userName}</span>
        </div>
      </Link>
    </div>
  )
}
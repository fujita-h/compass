import { classNames } from '@lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/router'

type tabItem = {
  name: string
  href: string
  count?: string
  current: boolean
}

type Props = {
  tabs: tabItem[]
}

export default function NavTab(props: Props) {
  const router = useRouter()

  const handleSelectChanged = (e) => {
    const href = props.tabs.find((x) => x.name == e.target.value).href
    if (href) {
      router.push(href)
    }
  }

  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="form-select block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          defaultValue={props.tabs.find((tab) => tab.current).name}
          onChange={handleSelectChanged}
        >
          {props.tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 first:pl-6" aria-label="Tabs">
            {props.tabs.map((tab) => (
              <span key={tab.name}>
                <Link href={tab.href} passHref>
                  <a
                    className={classNames(
                      tab.current
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700',
                      'flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                    )}
                    aria-current={tab.current ? 'page' : undefined}
                  >
                    {tab.name}
                    {tab.count ? (
                      <span
                        className={classNames(
                          tab.current ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900',
                          'ml-3 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block'
                        )}
                      >
                        {tab.count}
                      </span>
                    ) : null}
                  </a>
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

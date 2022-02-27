import { Layout } from '@components/layouts'
import { useSession } from '@lib/hooks'
import Link from 'next/link'
import { useGroupsQuery, useStockCategoriesQuery, useStocksAndCategoriesQuery, useStocksQuery } from '@graphql/generated/react-apollo'
import { useState } from 'react'
import { UserIconNameLinkSmall } from '@components/elements'
import { FilterIcon } from '@heroicons/react/solid'
import { classNames } from '@lib/utils'
import { NextLink } from '@components/nextLink'
import { NavStocks } from '@components/navStocks'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  if (!session) return <></>

  return (
    <Layout>
      <div className="mx-auto mt-4 mb-2 w-full max-w-7xl bg-white p-4">
        <div>
          <div className="text-2xl">Stocks</div>
        </div>
        <div className="mt-8">
          <NavStocks current={''} />
        </div>
      </div>
    </Layout>
  )
}

import { useEffect } from 'react'
import Router from 'next/router'
import { useSessionQuery } from '@graphql/generated/react-apollo'

export function useSession(
  { redirectTo, redirectIfFound }: { redirectTo?: string, redirectIfFound?: boolean } = {}
) {

  const { data, error } = useSessionQuery()
  const uuid = data?.session?.userSession?.id || null
  const hasId = Boolean(uuid)
  const finished = Boolean(data)

  useEffect(() => {
    if (!finished) return
    if (!redirectTo) return
    if (!redirectIfFound && !hasId) Router.push(redirectTo)
    if (redirectIfFound && hasId) Router.push(redirectTo)
  }, [redirectTo, redirectIfFound, hasId, finished])

  if (error) return null
  return data?.session?.userSession
}

export function useAdminSession({ redirectTo, redirectIfFound }
  : { redirectTo?: string, redirectIfFound?: boolean } = {}) {

  const { data, error } = useSessionQuery()
  const adminFlag = data?.session?.adminSession?.admin || null
  const hasAdminFlag = Boolean(adminFlag)
  const finished = Boolean(data)

  useEffect(() => {
    if (!finished) return
    if (!redirectTo) return
    if (!redirectIfFound && !hasAdminFlag) Router.push(redirectTo)
    if (redirectIfFound && hasAdminFlag) Router.push(redirectTo)
  }, [redirectTo, redirectIfFound, hasAdminFlag, finished])

  if (error) return null
  return data?.session?.adminSession ?? null
}
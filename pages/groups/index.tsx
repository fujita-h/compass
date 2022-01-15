import { Layout } from "@components/layouts"
import { useSession } from "@lib/session"
import Link from 'next/link'
import { useGroupsPageQuery } from '@graphql/generated/react-apollo'

export default function Page() {

  const session = useSession({ redirectTo: "/login" })
  const { data, loading } = useGroupsPageQuery()

  if (!session) return (<></>)
  if (loading) return (<></>)
  if (!data) return (<></>)

  return (<Layout>
    Group List
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispay Name</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.groups.map(group => (<tr key={group.id}>
          <td className="px-6 py-4 whitespace-nowrap"><Link href={"/groups/" + group.name}>{group.name}</Link></td>
          <td className="px-6 py-4 whitespace-nowrap">{group.displayName}</td>
          <td className="px-6 py-4 whitespace-nowrap">
          </td>
        </tr>))}
      </tbody>
    </table>
  </Layout>)
}
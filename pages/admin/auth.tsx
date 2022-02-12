import { AdminLayout } from '@components/layouts'
import { useAdminSession } from '@lib/hooks'
import { Auth, AdminAuthPageDocument, useAdminAuthPageQuery, useUpdateConfigurationMutation } from '@graphql/generated/react-apollo'
import { Toggle } from '@components/elements'

export default function Page() {
  const session = useAdminSession({ redirectTo: '/admin/login' })
  const { data, loading } = useAdminAuthPageQuery()
  const [setConfiguration, {}] = useUpdateConfigurationMutation({ refetchQueries: [AdminAuthPageDocument] })

  if (loading) return <AdminLayout />
  if (!session) return <AdminLayout />

  const handleChanged = async (e) => {
    if (e.target.type == 'checkbox') {
      setConfiguration({ variables: { auth: 'admin', [e.target.name]: e.target.checked ? 1 : 0 } })
    } else {
      setConfiguration({ variables: { auth: 'admin', [e.target.name]: e.target.value } })
    }
  }

  if (session?.admin) {
    return (
      <AdminLayout withMenu>
        <Toggle
          id="authEnableEmailVerificationForLocalUsers"
          label="ローカルユーザーのメールアドレスを確認する"
          checked={Boolean(data.configuration?.authEnableEmailVerificationForLocalUsers)}
          onChange={handleChanged}
        />
        <Toggle
          id="authEnableSamlLogin"
          label="SAMLログインを使用する"
          checked={Boolean(data.configuration?.authEnableSamlLogin)}
          onChange={handleChanged}
        />

        <div>
          {Boolean(data.configuration?.authEnableSamlLogin) && (
            <div className="ms-5">
              {data.samls.map((idp) => (
                <button
                  key={idp.id}
                  className="m-1 rounded-lg bg-green-600 py-2 px-4 text-center text-base
                                font-semibold text-white shadow-md transition
                                duration-200 ease-in hover:bg-green-700 
                                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-green-200"
                >
                  {idp.name}
                </button>
              ))}
              <div className="mt-2">
                <button
                  className="rounded-lg bg-indigo-600 py-2 px-4 text-center text-base 
                             font-semibold text-white shadow-md transition 
                             duration-200 ease-in hover:bg-indigo-700 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-indigo-200"
                >
                  Add new IDP
                </button>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    )
  } else {
    return (
      <AdminLayout>
        <p>Admin Page Not Logged in</p>
      </AdminLayout>
    )
  }
}

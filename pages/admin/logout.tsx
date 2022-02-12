import { removeAdminSession } from '@lib/session'

export async function getServerSideProps({ res }) {
  await removeAdminSession(res)
  return {
    redirect: { permanent: false, destination: '/admin' },
  }
}

export default function Page(props) {}

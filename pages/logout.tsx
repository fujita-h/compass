import { removeUserSession } from '@lib/session'

export async function getServerSideProps({ res }) {

  await removeUserSession(res)
  return {
    redirect: { permanent: false, destination: '/' }
  }
}

export default function Page(props) { }

import { removeAdminSession } from '@lib/session'

export default async function logout(req, res) {
  removeAdminSession(res)
  res.json({})
}

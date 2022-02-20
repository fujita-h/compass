import { setAdminSession } from '@lib/session'

export default async function login(req, res) {
  if (!req.body?.password) return res.status(401).send({ done: false })
  if (!process.env.ADMIN_SECRET) return res.status(401).send('')

  if (req.body.password == process.env.ADMIN_SECRET) {
    await setAdminSession(res, { admin: true })
    res.status(200).send({ done: true })
  } else {
    res.status(401).send('')
  }
}

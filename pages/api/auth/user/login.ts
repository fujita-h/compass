import passport from 'passport'
import nextConnect from 'next-connect'
import { NextApiRequest, NextApiResponse } from 'next'
import { localStrategy } from '@lib/auth'
//import { setLoginSession } from '@lib/session/loginSession'
import { setUserSession } from '@lib/session'

const authenticate = (method, req, res) =>
  new Promise((resolve, reject) => {
    passport.authenticate(method, { session: false }, (error, token) => {
      if (error) {
        reject(error)
      } else {
        resolve(token)
      }
    })(req, res)
  })



passport.use(localStrategy)

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result: any = await authenticate('local', req, res)

    // session is the payload to save in the token, it may contain basic info about the user
    const session = { method: 'local', provider: '', id:result.id, uuid: result.uuid }
    //await setLoginSession(res, session)
    await setUserSession(res, session)

    res.status(200).send({ done: true })
  } catch (error) {
    console.error(error)
    res.status(401).send(error.message)
  }
}


export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => handler(req, res))

import nextConnect from 'next-connect'
import { NextApiRequest, NextApiResponse } from 'next'
import passport from 'passport'
import { samlStrategy, findUser, createUser, getSamlIdp } from '@lib/auth'
import { setUserSession } from '@lib/session'

passport.use(samlStrategy)

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

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result: any = await authenticate('saml', req, res)
    const { id, profile } = result
    const idp = await getSamlIdp({ id })

    const mappedUser = {
      uuid: idp.attributeMappingForUuid ? profile.attributes[idp.attributeMappingForUuid] : null,
      username: idp.attributeMappingForUsername ? profile.attributes[idp.attributeMappingForUsername] : null,
      email: idp.attributeMappingForEmail ? profile.attributes[idp.attributeMappingForEmail] : null,
    }

    const checkParam = { uuid: null, username: null, email: null }
    if (idp.userMapping == 'uuid' && mappedUser.uuid) checkParam.uuid = mappedUser.uuid
    else if (idp.userMapping == 'username' && mappedUser.username) checkParam.username = mappedUser.username
    else if (idp.userMapping == 'email' && mappedUser.email) checkParam.email = mappedUser.email
    else {
      console.error('SAML Configuration Error.')
      console.error('idp.userMapping:', idp.userMapping)
      console.error('profile.attributes:', profile.attributes)
      console.error('mappedUser:', mappedUser)
      throw 'Inalid SAML Configuration.'
    }
    const authedUser = (await findUser(checkParam)) ?? (await createUser(mappedUser))

    // session is the payload to save in the token, it may contain basic info about the user
    const session = { method: 'saml', provider: id, id: authedUser.id, uuid: authedUser.uuid }
    await setUserSession(res, session)

    res.redirect('/')
    //res.status(200).send({ done: true })
  } catch (error) {
    console.error(error)
    res.status(401).send({ error: error })
  }
}

export default nextConnect()
  .use(passport.initialize())
  .post(async (req: NextApiRequest, res: NextApiResponse) => handler(req, res))
  .get(async (req: NextApiRequest, res: NextApiResponse) => handler(req, res))

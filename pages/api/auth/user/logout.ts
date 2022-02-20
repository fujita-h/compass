import { removeUserSession } from '@lib/session'
import passport from 'passport'
import nextConnect from 'next-connect'
import { NextApiRequest, NextApiResponse } from 'next'
import { samlStrategy, findUser, createUser, getSamlIdp } from '@lib/auth'

//passport.use(samlStrategy)
/*
  samlStrategy は req.param.id を参照するようになっているので、
  これが含まれていないと、どのIDPに対するものかを取得できない。
  SAMLのユーザーだった場合は
  logout も /api/auth/user/saml/idp/[id]/logout にリダイレクトするなりするしかないのでは？
  logout URL?
    https://__host__/simplesaml/module.php/core/authenticate.php?as=example-ldap&logout
*/

async function handler(req, res) {
  removeUserSession(res)
  //samlStrategy.logout(req, (err, url)=>{console.log(err, url)})
  //res.writeHead(302, { Location: '/' })
  //res.end()
  res.status(200).send({ done: true })
}

export default handler

//export default nextConnect()
//  .use(passport.initialize())
//  .post(async (req: NextApiRequest, res: NextApiResponse) => handler(req, res))
//  .get(async (req: NextApiRequest, res: NextApiResponse) => handler(req, res))

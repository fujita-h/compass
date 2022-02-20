import { ApolloServer } from 'apollo-server-micro'
import { resolve } from 'path'
import * as fs from 'fs'
import { makeExecutableSchema } from '@graphql-tools/schema'
import getConfig from 'next/config'
import { NextApiRequest, NextApiResponse } from 'next'
import { validateUserSession, validateAdminSession } from '@lib/session'
import { resolvers } from '@graphql/resolvers'

const typeDefs = fs.readFileSync(resolve(getConfig().serverRuntimeConfig.PROJECT_ROOT, './graphql/schema.graphql'), { encoding: 'utf8' })

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const apolloServer = new ApolloServer({
  schema,
  context: async ({ req, res }: { req: NextApiRequest; res: NextApiResponse }) => {
    const headers = req.headers
    const userSession = await validateUserSession(req, res)
    const adminSession = await validateAdminSession(req, res)
    return { headers, res, userSession, adminSession }
  },
})

const startServer = apolloServer.start()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', 'https://studio.apollographql.com')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  if (req.method === 'OPTIONS') {
    res.end()
    return false
  }

  await startServer
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res)
}

export const config = {
  api: {
    bodyParser: false,
  },
}

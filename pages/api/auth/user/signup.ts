import { createUser } from '@lib/auth'

export default async function signup(req, res) {
    try {
        await createUser(req.body)
        res.status(200).send({ done: true })
    } catch (error) {
        console.error('Error:', error)
        res.status(500).end(error)
    }
}

import express from "express"
import jwt from 'express-jwt'
import Env from "./lib/Env"

export default class ReservedContent {
    static getRouter() {
        const router = express.Router()

        router.use (jwt({
            secret: Env.get('JWT_SECRET'),
            algorithms: ['sha1', 'RS256', 'HS256']
        }))

        router.use((err:any, req:any, res:any, next:any) => {
            if(err.name === 'UnauthorizedError') {
                console.error(err)
                res.status(err.status).send( err.message )
                return
            }
            next()
        })    

        router.get('/reserved', async (req, res) => {
            res.send('reserved content reached!!')
        })

        return router
    }
}
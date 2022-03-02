/***
 * @version 1.4
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
import http from 'http'
import _ from "lodash"
import express from 'express'
import jwt from 'jsonwebtoken'
import path from 'path'
import Env from './Env'
import { Server as IOServer } from "socket.io"

interface Endpoint {
    path: string
    router: express.Router
}

export interface WebServerConfig {
    name: string
    port?: number
    ip?: string
    hasSocket?: boolean
    useEndpoints?: Endpoint[]
}

export default class WebServer {
    name: string
    app:express.Express
    server:http.Server
    ip:string
    port:number
    ioApp?:IOServer

    constructor(inputConfig?:WebServerConfig) {
        const config = _.defaults(inputConfig, {
            port: Env.get('PORT', 8080),
            ip: Env.get('IP', '127.0.0.1'),
            hasSocket: false,
            useEndpoints: [] as Endpoint[]
        })
        this.name = config.name
        this.ip = config.ip
        this.port = config.port

        this.app = express()
        this.app.use( express.json() )

        this.app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*")
            res.header("Access-Control-Allow-Headers", "Version, Access-Control-Allow-Origin, Authorization, Origin, X-Requested-With, Content-Type, Accept, ETag, Cache-Control, If-None-Match")
            res.header("Access-Control-Expose-Headers", "Etag, Authorization, Origin, X-Requested-With, Content-Type, Accept, If-None-Match, Access-Control-Allow-Origin")
            res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS, PATCH")
            next()
        })

        this.app.get('/server', (req, res) => {
            res.send(`${this.name} server up and running!`)
        })

        this.app.post('/login', (req, res) => {
            const pwdHash = req.body.pwdHash
            if (pwdHash === Env.get('PWD_HASH') )
                res.send( jwt.sign({ user: 'admin' }, Env.get('JWT_SECRET')) )
                else res.status(403).send('wrong password')
        })

        config.useEndpoints.map(
            endpoint => {
                this.app.use( endpoint.path, endpoint.router )
            }
        )

        this.server = http.createServer(this.app)
        if (config.hasSocket) {
            this.ioApp = new IOServer(this.server, {
                cors: {
                    origin: true
                }
            })
        }
    }

    getBaseUrl() {
        return `http://${this.ip}:${this.port}`
    }

    mountUi() {
        this.app.use(express.static("ui"))
        this.app.get("/*", (req, res) => {
            res.sendFile(path.normalize(path.join(__dirname, "..", "ui", "index.html")))
        })
    }

    listen() {
        return new Promise<void>( resolve => {
            this.server.listen(this.port, this.ip, () => {
                console.info((new Date()) + ` ${this.name} server is listening at ${ this.ip }:${ this.port }`)
                resolve()
            })
        } )
    }

    close() {
        console.info(`Shutting down ${this.name} server...`)
        return new Promise<void>( (resolve, reject) => {
            this.server.close( (err) => {
                if (!err) resolve()
                    else reject(err)
            })
        })
    }
}
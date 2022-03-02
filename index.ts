import express from "express"
import WebServer from "./lib/WebServer"
import ReservedContent from "./reservedContent"

const webServer = new WebServer({ name: 'JWT demo', useEndpoints: [ 
    { path: '/contents', router: ReservedContent.getRouter() }
] } )
webServer.app.get('/', (req, res) => res.redirect('/ui'))
webServer.app.use('/ui', express.static("ui"))

webServer.app.get('/content', (req, res) => {

})

webServer.listen()
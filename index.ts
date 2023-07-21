import { Server as HttpServer, IncomingMessage } from 'http';
import staticHandler from 'serve-handler';
import ws, { Data, WebSocket, WebSocketServer } from 'ws';
import url from 'url';
import jwt from 'jsonwebtoken';
import 'dotenv/config'

let secret = process.env.SECRET;

const httpServer = new HttpServer((req, res) : any =>  {   // (1)
    return staticHandler(req, res, { public: 'public' })
});

const wss = new WebSocketServer({ server: httpServer }) // (2)

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    let wsUsername: string = "";
    
    if(req.url !== "/" && req.url !== "/undefined") {
        let token: string = url.parse(req.url, true).pathname?.split('/')[1];
        try {
            jwt.verify(token, secret, (err: any, decoded: any) => {
                if (err) {
                    wss.close();
                } else {
                    wsUsername = decoded;
                }
            })
        } catch (err) {
            console.log(err);
        }
    }

    ws.on('message', (msg: Data) => {    // (3)
        console.log(`Message:${msg}`);
        if (wsUsername !== "") { 
            broadcast(`${wsUsername}: ${msg}`)
        }
    })
})
const broadcast = (msg: any ) => {
    for (const client of wss.clients) {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(msg))
        }
    }
}
httpServer.listen(8080, () => {
    console.log(`server listening on port 8080`);
})

export default wss;
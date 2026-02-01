import WebSocket, {WebSocketServer} from "ws";
import {createServer} from 'http'
import path from 'path'
import fs from 'fs'
import {fileURLToPath} from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 
const server = createServer((_,res)=>{
    const filepath = path.join(__dirname, 'index.html');
  fs.readFile(filepath, (err, data) => {
   if (err) {
      res.writeHead(500)
      res.end()
      return
   }
   res.writeHead(200, {'content-type': 'text/html'})
   res.end(data)
})

})

const wss = new WebSocketServer({server});
const Users = new Set()
wss.on("connection",(socket,req)=>{
    const ip = req.socket.remoteAddress;
    console.log(ip, 'started connection connection')
    Users.add(ip);
    socket.on("message",(data)=>{
        wss.clients.forEach((c)=>{
            if(c.readyState===WebSocket.OPEN){
                console.log(ip, 'broadcasted a message')
                c.send(data.toString())
            }
        });
    });
    socket.on("close",()=>{
        Users.delete(ip);
        console.log(ip, 'close connection')
    });
    socket.on("error",(err)=>{
        Users.delete(ip);
        console.warn(`[user with ip ${ip}] faces some error`,err)
    })
})
server.listen(8080,()=>{
    console.log('app running')
})

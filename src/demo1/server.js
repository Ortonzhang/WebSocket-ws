let app = require('express')()
const http = require('http')
var WebSocketServer = require('ws').Server;

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
})

const server = http.createServer(app)
var wss = new WebSocketServer({ server });

wss.on('connection', function (ws) {
    console.log('client connected');
    ws.on('message', function (message) {
        console.log(message);
        wss.clients.forEach(function(ws){
            ws.send(message)
        })
        
    });
    ws.on('close', function () {
        console.log('连接关闭')
    });
    /*
        服务端不断的推数据
    */

    // setInterval(function () {
    //     ws.send('message')
    // }, 1000);
});
server.listen('8181', function(){
    console.log('open http://localhost:8181')
})
let app = require('express')()
const http = require('http')
var WebSocketServer = require('ws').Server;

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
})

const server = http.createServer(app)
var wss = new WebSocketServer({ server });


var stocks = {
    "AAPL": 95.0,
    "MSFT": 50.0,
    "AMZN": 300.0,
    "GOOG": 550.0,
    "YHOO": 35.0
}
function randomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
var stockUpdater;
var randomStockUpdater = function() {
    for (var symbol in stocks) {
        if(stocks.hasOwnProperty(symbol)) {
            var randomizedChange = randomInterval(-150, 150);
            var floatChange = randomizedChange / 100;
            stocks[symbol] += floatChange;
        }
    }
    var randomMSTime = randomInterval(500, 2500);
    stockUpdater = setTimeout(function() {
        randomStockUpdater();
    }, randomMSTime);
}
randomStockUpdater();
var clientStocks = [];
wss.on('connection', function (ws) {
    var sendStockUpdates = function (ws) {
        if (ws.readyState == 1) {
            var stocksObj = {};
            for (var i = 0; i < clientStocks.length; i++) {
              var symbol = clientStocks[i];
                stocksObj[symbol] = stocks[symbol];
            }
            if (stocksObj.length !== 0) {
                ws.send(JSON.stringify(stocksObj));
                console.log("更新", JSON.stringify(stocksObj));
            }
           
        }
    }
    var clientStockUpdater = setInterval(function () {
        sendStockUpdates(ws);
    }, 1000);
    ws.on('message', function (message) {
        var stockRequest = JSON.parse(message);
        console.log("收到消息", stockRequest);
        clientStocks = stockRequest['stocks'];
        sendStockUpdates(ws);
    });
    ws.on('close', function () {
        if (typeof clientStockUpdater !== 'undefined') {
            clearInterval(clientStockUpdater);
        }
    });
});
server.listen('8281', function(){
    console.log('open http://localhost:8281')
})
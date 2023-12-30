import Aedes from 'aedes'
import { createServer } from 'net'

const port = 1883

const aedes = new Aedes()
const server = createServer(aedes.handle)



server.listen(port, function () {
  console.log('server started and listening on port ', port)
})

// 客户端连接
aedes.on('client', function (client) {
    console.log('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id);
});
 
// 客户端断开
aedes.on('clientDisconnect', function (client) {
    console.log('Client Disconnected: \x1b[31m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id);
});


//消息订阅
aedes.on('subscribe', function (subscriptions, client) {
    if (client) {
        console.log('subscribe from client', subscriptions, client.id);
    }
});





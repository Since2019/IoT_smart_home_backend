const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const PORT = 18080

server.listen(PORT, function () {
    console.log('server started and listening on port ', PORT)
    // aedes.publish({ topic: 'aedes/hello', payload: "I'm broker " + aedes.id })
})

// aedes.on('subscribe', function (subscriptions, client) {
//     console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
//         '\x1b[0m subscribed to topics: ' + subscriptions.map(s => s.topic).join('\n'), 'from broker', aedes.id)
// })

// aedes.on('unsubscribe', function (subscriptions, client) {
//     // console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
//     //     '\x1b[0m unsubscribed to topics: ' + subscriptions.join('\n'), 'from broker', aedes.id)
//     console.log((client ? client.id : client) + subscriptions.join('\n'), aedes.id)
// })


// aedes.on('client', function (client) {
//     // console.log('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
//     console.log((client ? client.id : client), aedes.id)
// })


// aedes.on('clientDisconnect', function (client) {
//     // console.log('Client Disconnected: \x1b[31m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
//     console.log((client ? client.id : client), aedes.id)
// })


aedes.on('publish', async function (packet, client) {
    console.log(packet.topic.toString())
    console.log(packet.payload.toString())
    try {
        let payload_json = JSON.parse(packet.payload.toString())
        console.log(payload_json)
    }
    catch (e) {
        console.log(packet.payload.toString())

    }

})


const aedes = require('aedes')()
const aedes_server = require('net').createServer(aedes.handle)
const express = require("express");

const AEDES_PORT = 18080
const EXPRESS_PORT = 3000

const express_server = express();

const mongoose = require('mongoose');

const {
    connectMongoose,
    saveMqttUpdate,
    MqttMsg
} = require('./utils/mongo/mongoHandler')


connectMongoose()

// aedes server
aedes_server.listen(AEDES_PORT, function () {
    console.log('aedes_server started and listening on port ', AEDES_PORT)
    // aedes.publish({ topic: 'aedes/hello', payload: "I'm broker " + aedes.id })
})

aedes.on('subscribe', function (subscriptions, client) {
    console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
        '\x1b[0m subscribed to topics: ' + subscriptions.map(s => s.topic).join('\n'), 'from broker', aedes.id)
})

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


/**
 *  aedes.on('publish' , CALLBACK){
 *      CALLBACK();
 *  }
 * 
 *  This listener listens for the smart device to publish mqtt signals,
 *  then does what the callback function stipulates
 */
// MQTT 将收到的信息转换成 JSON
aedes.on('publish', async function (packet, client) {

    try {
        // console.log("packet.topic.toString()")
        // console.log(packet.topic.toString())

        // console.log("packet.payload.toString()")
        // console.log(packet.payload.toString())

        saveMqttUpdate({
            timestamp: new Date(),
            topic: packet.topic.toString(),
            device_name: packet.topic.toString(),
            reading: JSON.parse(packet.payload.toString())
        })

        // console.log("reading:")
        // console.log(JSON.parse(packet.payload.toString()))

    }
    catch (err) {
        console.log(err)
    }

})

// Get all the data from that device
express_server.get('/sensor_data/:device_name', (req, res) => {
    console.log("MongoDB读取")
    // 
    let device_name = req.params.device_name
    console.log(device_name);

    let condition_json = {
        "device_name": device_name,
    };

    MqttMsg.findOne(condition_json, {}, {
        sort: {
            timestamp: -1
        }
    }, (err, reading) => {

        // {
        //     timestamp :  Date().now
        //     sensor_model: "DHT22",
        //     sensor_data : {
        //             "temperature" : 27.7,
        //             "humidity" : 61.1
        //         }
        // }
        if (err) {
            console.log(err);
            return err
        }

        reading && (console.log("reading:::"), console.log(reading))

        res.send(reading);
    })


})


// start the express server 
express_server.listen(EXPRESS_PORT, () => {
    console.log(`Example app listening at http://localhost:${EXPRESS_PORT}`);
});


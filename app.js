const aedes = require('aedes')()
const aedes_server = require('net').createServer(aedes.handle)
const express = require("express");

const AEDES_PORT = 18080
const EXPRESS_PORT = 3000
const cors = require('cors')
const express_server = express();

const mongoose = require('mongoose');

const {
    connectMongoose,
    saveMqttUpdate,
    MqttMsg,
    DeviceInfo
} = require('./utils/mongo/mongoHandler')


connectMongoose()

express_server.use(cors())



// aedes server
aedes_server.listen(AEDES_PORT, function () {
    console.log('aedes_server started and listening on port ', AEDES_PORT)
    // aedes.publish({ topic: 'aedes/hello', payload: "I'm broker " + aedes.id })
})

aedes.on('subscribe', function (subscriptions, client) {
    aedes.publish({ "topic": "wemos-room-monitor-02", "payload": "test ${aedes.id}" });

    console.log("On subscribe ==== ")
    console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
        '\x1b[0m subscribed to topics: ' + subscriptions.map(s => s.topic).join('\n'), 'from broker', aedes.id)
})

// aedes.on('unsubscribe', function (subscriptions, client) {
//     // console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
//     //     '\x1b[0m unsubscribed to topics: ' + subscriptions.join('\n'), 'from broker', aedes.id)
//     console.log((client ? client.id : client) + subscriptions.join('\n'), aedes.id)
// })


aedes.on('client', function (client) {
    console.log('on client = = = = = = = = = = = = ')
    console.log('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
    console.log((client ? client.id : client), aedes.id)
})


aedes.on('clientDisconnect', function (client) {
    // console.log('Client Disconnected: \x1b[31m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
    console.log((client ? client.id : client), aedes.id)
})




let client_array = []

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
    console.log('on publish = = = = = = = = = = = = ')
    console.log(packet)
    return
    // console.log(client)

    // let client_counterpart = new aedes.Client()
    // client_array

    try {
        // console.log("packet.topic.toString()")
        // console.log(packet.topic.toString())

        // console.log("packet.payload.toString()")
        // console.log(packet.payload.toString())
        let topic = packet.topic.toString();
        let device_name = packet.topic.toString();
        let reading = JSON.parse(packet.payload.toString());

        // 如果发现是提交设备信息
        try {
            if (reading.updating_device_info) {
                console.log("========================================= UPDATING DEVICE INFO ==========================================")
                console.log(reading)
                const filter = { device_name: `${device_name}` };
                const update = { sensors: reading.sensors };

                // `doc` is the document _after_ `update` was applied because of
                // `new: true`
                let doc = await DeviceInfo.findOneAndUpdate(filter, update, {
                    new: true,
                    upsert: true // Make this update into an upsert
                });
                return;
            }
        }
        catch (e) {
            console.log(e)
        }


        // 如果是上传sensor readings
        saveMqttUpdate({
            timestamp: new Date(),
            topic: topic,
            device_name: device_name,
            reading: reading
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


    DeviceInfo.findOne(condition_json, async (err, result) => {
        // the list of sensors
        let sensors = result.sensors;
        let ret_obj = [];



        let query = {
            "device_name": device_name,
            "reading.sensor_model": { "$in": sensors }
        }

        MqttMsg.find(query, {}, {
            sort: {
                timestamp: -1                 //HACK 排序时找最后写入的
            }
        }, (err, readings) => {
            // console.log(query)
            // console.log("reading===================================")
            // console.log(reading.reading)


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



            console.log(readings[readings.length - 1].reading);
            console.log(readings[readings.length - 2].reading);
            ret_obj = Object.assign(readings[readings.length - 1].reading.sensor_data, readings[readings.length - 2].reading.sensor_data);
            res.send(ret_obj)
        })





    })

})


// A dynamic API that does all the payload sends
express_server.get('/test/:topic/:payload', (req, res) => {
    let topic = req.params.topic;
    let payload = req.params.payload;
    let msg_publish = { topic: topic, payload: payload };

    aedes.publish(msg_publish)
    res.end();
})


// start the express server 
express_server.listen(EXPRESS_PORT, () => {
    console.log(`Example app listening at http://localhost:${EXPRESS_PORT}`);
});


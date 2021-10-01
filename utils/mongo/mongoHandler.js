const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 服务器 connection string
const { SERVER } = require("./mongoConfig")


const ReadingSchema = new Schema({
    sensor_model: String,
    sensor_data: Schema.Types.Mixed //HACK It means that it can be anything, not quite predictable!!!
})

// MqttMsgSchema
const MqttMsgSchema = new Schema({
    timestamp: Date,
    topic: String,
    device_name: String,
    reading: ReadingSchema,      //Array with a type of "ReadingSchema"

}, { collection: 'mqtt_data' });


// 按照Schema创建model
const MqttMsg = mongoose.model('MqttMsg', MqttMsgSchema);
const Reading = mongoose.model('Reading', ReadingSchema);

function connectMongoose() {

    // ==================== Listeners =======================
    mongoose.connection.on("connected", () => {
        console.log("MongoDB Connected");
    });

    mongoose.connection.on("error", (err) => {
        console.log("MongoDB connection error", err);
    });

    mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnnected");
    });
    // ^^^^^^^^^^^^^^^^^^^^^ Listeners ^^^^^^^^^^^^^^^^^^^^^^^

    // ==================== Does the connection action =======
    console.log("Connecting to MongoDB...");
    mongoose.connect(SERVER, { useNewUrlParser: true });
}

/**
 * 
 * @param {string} mqtt_string 
 * 将收到的MQTT string转成 JSON 放入数据库中
 */
async function saveMqttUpdate(mqtt_json) {
    // let mqtt_json = null;
    // mqtt_json = JSON.parse(mqtt_string)

    if (mqtt_json != null) {
        let mqtt_msg = new MqttMsg(
            mqtt_json
        )
        // console.log(mqtt_json)
        mqtt_msg.save((err, doc) => {
            console.log("saving readings");
            err && console.log(err);
            console.log(doc);
            return;
        });
    }
}

// async function findSensorReading(condition_json) {


// }

module.exports = {
    connectMongoose, // 连接服务器
    saveMqttUpdate,  // 保存数据到服务器
    MqttMsg

};
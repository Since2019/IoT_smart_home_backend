const { Schema } = mongoose;
const Sensor = require('./sensor')

const smartDeviceSchema = new Schema({

    device_controller: String,   // MCU / SBC
    sensors_attached: [Sensor.schema], //
    device_manufacturer: String,
    device_id: Number, // specifies the sensor
    
}, { collection: 'devices' });

module.exports = mongoose.model("Sensors", sensorSchema);

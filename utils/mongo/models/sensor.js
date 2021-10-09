const { Schema } = mongoose;


const sensorSchema = new Schema({

    sensor_model: String,
    sensor_type: String,
    sensor_manufacturer: String,
    sensor_id: Number, // specifies the sensor

}, { collection: 'sensors' });

module.exports = mongoose.model("Sensors", sensorSchema);



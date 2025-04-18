const { Kafka } = require('kafkajs');

// Create Kafka client
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9094']
});

// Create a producer instance
const producer = kafka.producer();

// GPS Data Types
const GPS_TYPES = ['GARMIN', 'SUUNTO', 'TUG'];

// Function to generate random GPS data
function generateRandomGpsData(customType) {
  return {
    timestamp: new Date().toISOString(),
    long: parseFloat((Math.random() * 360 - 180).toFixed(6)),
    lat: parseFloat((Math.random() * 180 - 90).toFixed(6)),
    type: customType || GPS_TYPES[Math.floor(Math.random() * GPS_TYPES.length)]
  };
}

async function sendCustomGpsMessage(type) {
  try {
    // Connect to the Kafka broker
    await producer.connect();
    console.log('Producer connected');

    if (!type || !GPS_TYPES.includes(type.toUpperCase())) {
      console.log(`Type must be one of: ${GPS_TYPES.join(', ')}. Using random type.`);
      type = null;
    } else {
      type = type.toUpperCase();
    }

    const gpsData = generateRandomGpsData(type);

    // Send a message
    await producer.send({
      topic: 'gps-data',
      messages: [
        { value: JSON.stringify(gpsData) },
      ],
    });
    console.log(`GPS data sent successfully: ${JSON.stringify(gpsData)}`);

    // Disconnect the producer
    await producer.disconnect();
    console.log('Producer disconnected');
  } catch (error) {
    console.error('Error producing message:', error);
  }
}

// Get message from command line arguments
const gpsType = process.argv[2];
sendCustomGpsMessage(gpsType);
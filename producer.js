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
function generateRandomGpsData() {
  return {
    timestamp: new Date().toISOString(),
    long: parseFloat((Math.random() * 360 - 180).toFixed(6)),
    lat: parseFloat((Math.random() * 180 - 90).toFixed(6)),
    type: GPS_TYPES[Math.floor(Math.random() * GPS_TYPES.length)]
  };
}

async function connectProducer() {
  await producer.connect();
  console.log('Producer connected');
  return producer;
}

async function sendGpsMessage() {
  try {
    const gpsData = generateRandomGpsData();
    
    await producer.send({
      topic: 'gps-data',
      messages: [
        { value: JSON.stringify(gpsData) },
      ],
    });
    
    console.log(`Message sent: ${JSON.stringify(gpsData)}`);
  } catch (error) {
    console.error('Error producing message:', error);
  }
}

async function startProducer() {
  try {
    await connectProducer();
    
    console.log('Starting to send GPS data messages (3 per second)...');
    
    // Send 3 messages per second continuously
    setInterval(async () => {
      // Send 3 messages
      for (let i = 0; i < 3; i++) {
        await sendGpsMessage();
      }
    }, 1000);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down producer...');
      await producer.disconnect();
      process.exit(0);
    });

    
    
  } catch (error) {
    console.error('Error in producer:', error);
  }
}

// Run the producer
startProducer();
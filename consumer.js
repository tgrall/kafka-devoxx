const { Kafka } = require('kafkajs');

// Create Kafka client
const kafka = new Kafka({
  clientId: 'my-app-consumer',
  brokers: ['localhost:9094']
});

// Create a consumer instance
const consumer = kafka.consumer({ groupId: 'gps-data-group' });

// Function to format GPS data for display
function formatGpsData(data) {
  return `GPS [${data.type}] - Coordinates: (${data.lat}, ${data.long}) at ${data.timestamp}`;
}

// Function to track and display statistics about received GPS data
const stats = {
  GARMIN: 0,
  SUUNTO: 0,
  TUG: 0,
  total: 0,
  lastReport: Date.now(),
  reportInterval: 10000 // Report stats every 10 seconds
};

function updateStats(gpsData) {
  stats.total++;
  stats[gpsData.type]++;
  
  const now = Date.now();
  if (now - stats.lastReport >= stats.reportInterval) {
    console.log('\n----- GPS Data Statistics -----');
    console.log(`Total messages received: ${stats.total}`);
    console.log(`GARMIN: ${stats.GARMIN} (${(stats.GARMIN/stats.total*100).toFixed(1)}%)`);
    console.log(`SUUNTO: ${stats.SUUNTO} (${(stats.SUUNTO/stats.total*100).toFixed(1)}%)`);
    console.log(`TUG: ${stats.TUG} (${(stats.TUG/stats.total*100).toFixed(1)}%)`);
    console.log('-----------------------------\n');
    stats.lastReport = now;
  }
}

async function consumeMessages() {
  try {
    // Connect to the Kafka broker
    await consumer.connect();
    console.log('Consumer connected');

    // Subscribe to the topic
    await consumer.subscribe({
      topic: 'gps-data',
      fromBeginning: true
    });

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value.toString();
          const gpsData = JSON.parse(value);
          
          console.log(formatGpsData(gpsData));
          updateStats(gpsData);
          
        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });

    // Keep the consumer running
    console.log('Consumer is running and waiting for GPS data messages...');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down consumer...');
      await consumer.disconnect();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error consuming message:', error);
  }
}

// Run the consumer
consumeMessages();
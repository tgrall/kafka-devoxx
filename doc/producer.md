# Producer Components

## Overview

The application includes two producer components:

1. **producer.js** - Continuously generates random GPS data (3 messages/second)
2. **custom-producer.js** - Sends a single GPS message with a specified device type

## Producer Sequence Diagram

### Continuous Producer (producer.js)

```mermaid
sequenceDiagram
    participant App as Producer.js
    participant Kafka as Kafka Broker
    
    Note over App: Initialize
    App->>App: Create Kafka client
    App->>App: Create producer instance

    Note over App: Start producer
    App->>Kafka: Connect()
    Kafka-->>App: Connection established

    loop Every 1 second
        Note over App: Generate 3 messages
        loop 3 times
            App->>App: generateRandomGpsData()
            App->>Kafka: Send(gps-data topic, message)
            Kafka-->>App: Acknowledgment
            App->>App: Log message sent
        end
    end

    Note over App: On shutdown (SIGINT)
    App->>Kafka: Disconnect()
    Kafka-->>App: Disconnected
```

### Custom Producer (custom-producer.js)

```mermaid
sequenceDiagram
    participant App as Custom-Producer.js
    participant Kafka as Kafka Broker
    
    Note over App: Initialize
    App->>App: Create Kafka client
    App->>App: Create producer instance
    App->>App: Get device type from args
    
    App->>Kafka: Connect()
    Kafka-->>App: Connection established

    App->>App: Validate device type
    App->>App: generateRandomGpsData(type)
    App->>Kafka: Send(gps-data topic, message)
    Kafka-->>App: Acknowledgment
    App->>App: Log message sent
    
    App->>Kafka: Disconnect()
    Kafka-->>App: Disconnected
```

## Key Functions

### generateRandomGpsData()

Generates a random GPS data point with the following properties:
- timestamp: Current time in ISO format
- long: Random longitude (-180 to +180)
- lat: Random latitude (-90 to +90)
- type: GARMIN, SUUNTO, or TUG (random or specified)

### sendGpsMessage()

Sends a single GPS message to Kafka:
1. Generates GPS data
2. Serializes to JSON
3. Sends to the 'gps-data' topic
4. Logs the result

### startProducer()

Main function in producer.js that:
1. Connects to Kafka
2. Sets up an interval to send 3 messages per second
3. Handles graceful shutdown

## Configuration

Both producers use the following configuration:
- Kafka broker: localhost:9094
- Client ID: my-app
- Topic: gps-data
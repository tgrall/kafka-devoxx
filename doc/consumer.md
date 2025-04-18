# Consumer Component

## Overview

The consumer component (`consumer.js`) is responsible for reading GPS data messages from Kafka, processing them, and displaying the results. It also maintains statistics about the different types of GPS devices and provides periodic reports.

## Consumer Sequence Diagram

```mermaid
sequenceDiagram
    participant App as Consumer.js
    participant Kafka as Kafka Broker
    
    Note over App: Initialize
    App->>App: Create Kafka client
    App->>App: Create consumer instance
    App->>App: Initialize statistics

    App->>Kafka: Connect()
    Kafka-->>App: Connection established

    App->>Kafka: Subscribe(gps-data topic)
    Kafka-->>App: Subscription confirmed
    
    App->>Kafka: Run consumer
    
    loop For each incoming message
        Kafka-->>App: Message delivered
        App->>App: Deserialize JSON
        App->>App: Format GPS data
        App->>App: Update statistics
        
        opt Every 10 seconds
            App->>App: Generate statistics report
        end
    end
    
    Note over App: On shutdown (SIGINT)
    App->>Kafka: Disconnect()
    Kafka-->>App: Disconnected
```

## Key Functions

### formatGpsData()

Formats a GPS data point for display:
- Input: JSON object with timestamp, long, lat, and type
- Output: Formatted string showing device type, coordinates, and timestamp

### updateStats()

Updates statistics for received GPS data:
- Increments total messages counter
- Increments counter for the specific device type
- Generates a report every 10 seconds showing:
  - Total messages received
  - Count and percentage for each device type

### consumeMessages()

Main function that:
1. Connects to Kafka
2. Subscribes to the 'gps-data' topic
3. Sets up message processing
4. Handles graceful shutdown

## Error Handling

The consumer includes error handling:
- Try-catch blocks around message processing
- Connection error handling
- Graceful shutdown on SIGINT signal

## Configuration

The consumer uses the following configuration:
- Kafka broker: localhost:9094
- Client ID: my-app-consumer
- Consumer group: gps-data-group
- Topic: gps-data
- FromBeginning: true (reads all available messages)
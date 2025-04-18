# Infrastructure and Deployment

## Overview

This document describes the infrastructure components of the Kafka GPS Data application, focusing on the Kafka cluster setup and Docker configuration.

## Docker Compose Configuration

The application uses Docker Compose to deploy Kafka and Zookeeper. The configuration is defined in `docker-compose.yml`.

### Component Diagram

```mermaid
graph TB
    subgraph Docker Environment
        Z[Zookeeper<br>Port: 2181] --- K[Kafka Broker<br>Ports: 9092, 9094]
    end
    
    subgraph Host Machine
        P[Producer.js] -->|localhost:9094| K
        C[Consumer.js] -->|localhost:9094| K
        CP[Custom-Producer.js] -->|localhost:9094| K
    end
```

### Kafka Configuration

The Kafka broker is configured with the following key settings:

- **KAFKA_BROKER_ID**: Unique identifier for the broker (set to 1)
- **KAFKA_ZOOKEEPER_CONNECT**: Connection to Zookeeper (zookeeper:2181)
- **KAFKA_ADVERTISED_LISTENERS**: Configures two listeners:
  - PLAINTEXT://kafka:9092 (for internal Docker network)
  - PLAINTEXT_HOST://localhost:9094 (for host machine access)
- **KAFKA_LISTENER_SECURITY_PROTOCOL_MAP**: Maps protocols for the listeners
- **KAFKA_INTER_BROKER_LISTENER_NAME**: Internal communication listener (PLAINTEXT)
- **KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR**: Replication factor for offset topics (1 for development)

### Zookeeper Configuration

Zookeeper is configured with:

- **ZOOKEEPER_CLIENT_PORT**: Port for client connections (2181)
- **ZOOKEEPER_TICK_TIME**: Basic time unit in milliseconds (2000)

## Deployment Sequence

```mermaid
sequenceDiagram
    participant User
    participant Docker as Docker Compose
    participant Z as Zookeeper
    participant K as Kafka
    participant App as Node.js Apps
    
    User->>Docker: npm run start:kafka
    Docker->>Z: Start Zookeeper container
    Z-->>Docker: Zookeeper started
    Docker->>K: Start Kafka container
    K-->>Z: Connect to Zookeeper
    Z-->>K: Connection established
    K-->>Docker: Kafka started
    Docker-->>User: Containers running
    
    User->>App: npm run consume
    App-->>K: Connect to Kafka
    K-->>App: Connection established
    
    User->>App: npm run produce
    App-->>K: Connect to Kafka
    App-->>K: Send messages
    K-->>App: Messages consumed
```

## Scaling Considerations

For production environments, consider:

1. **Multi-node Kafka cluster**: Increase the number of Kafka brokers
2. **Replication factor**: Increase from 1 to 3 for fault tolerance
3. **Persist data volumes**: Mount volumes for Kafka and Zookeeper to persist data
4. **Network configuration**: Configure security, SASL, and proper network controls
5. **Monitoring**: Add monitoring and alerting for the Kafka cluster
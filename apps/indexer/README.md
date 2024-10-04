# Indexer Service

This repository contains the Envio indexer service, which is ready to run on the Envio hosted platform. It includes a Dockerfile for the indexer process.

## 🚀 Deployment

### Envio Hosted Solution

To deploy the indexer on the Envio hosted service, refer to the official documentation:  
[Envio Hosted Service Deployment](https://docs.envio.dev/docs/HyperIndex/hosted-service-deployment)

## 🛠 Getting Started

### Install Dependencies

Run the following command to install all necessary dependencies:

```bash
pnpm i
```

### Local Development

For local development, start the service with:

```bash
pnpm dev
```

## ➕ Adding a New Event

To add a new event to the indexer, follow these steps:

### Step 1: Modify Configuration

Update the `config.yaml` file to include the new event you wish to handle. Ensure the event is correctly configured.

### Step 2: Add an Event Handler

Create a handler for the new event. This handler is essential for ensuring the event is indexed. Without a handler, the event (and its corresponding entry in the `raw_events` table) will not be saved or processed. Each event must have a handler to be included in `raw_events`.

### Step 3: Redeploy the Environment

After making the necessary changes, redeploy your environment to apply the updates.

## 🔍 Notes

Ensure each event is properly handled and thoroughly tested before redeploying the environment to prevent issues in the indexing process.

## 🧪 Testing

To run tests, use the following command:

```bash
pnpm test
```

# Deployment Guide - AQI Intelligence Platform

This guide provides step-by-step instructions to deploy the AQI Intelligence Platform from scratch using Docker.

## Prerequisites
- **Docker** and **Docker Compose** installed on your system.
- Basic knowledge of terminal/shell commands.

## Step 1: Clone and Prepare
If you haven't already, clone the repository and navigate to the project root:
```bash
git clone <repository-url>
cd aqi
```

## Step 2: Environment Configuration
The application uses environment variables for configuration. Create a `.env` file in the root directory (the provided Docker setup has default values).

## Step 3: Build and Start Services
Run the following command to build the optimized Docker images and start the containers in the background:

```bash
docker compose up -d --build
```

### Why is this optimized?
- **.dockerignore**: Excludes local folders like `node_modules` and `venv`, making build context tiny (~500MB instead of 10GB+).
- **ML Optimization**: Uses `torch-cpu`, reducing the ML image from ~12GB to ~2GB.
- **Frontend Multi-stage**: Only copies production assets, keeping the web image lean.

## Step 4: Verify Deployment
Check if all services are running:
```bash
docker compose ps
```

You should see:
- `aqi-web`: Port 3000 (Frontend)
- `aqi-api`: Port 8000 (Backend API)
- `aqi-ml`: Port 8001 (ML Service)
- `aqi-postgres`: Port 5432 (Database)
- `aqi-redis`: Port 6379 (Cache)

## Step 5: Access the Application
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ML Health**: [http://localhost:8001/health](http://localhost:8001/health)

## Troubleshooting

### Clearing Large Data/Volumes
If you need to reset the database and clear all volumes:
```bash
docker compose down -v
```

### Checking Logs
To see what's happening inside a specific service:
```bash
docker compose logs -f api
```

### Docker Image Cleanup
If you still have old, huge images, you can prune them:
```bash
docker image prune -a
```

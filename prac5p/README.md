#  Calculator Microservice (Dockerized)

## Overview
A simple calculator microservice built using **Node.js** and **Express**. It performs basic arithmetic operations, includes logging, is Dockerized using Docker Compose, and has health checks with auto-restart.


## Features
- Supports addition, subtraction, multiplication, and division
- Handles invalid inputs and division by zero
- Logs all operations and errors using Winston
- Fully Dockerized with Docker Compose
- Health check monitoring and automatic restart


##  Prerequisites
Install the following:
- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/)

## Getting Started

### 1. Clone the Repository
git clone https://github.com/anushakatuwal99/sit737-2025.git
cd sit737-2025/prac5p


### 2. Build the Docker Image Locally
docker build -t anushakatuwal99/calculator-web-server .


### 3. Run Docker Compose (builds and starts container)
docker-compose up

### 4. Stop Docker Compose
docker-compose down


## Access the App

The app will be running at: http://localhost:3090


## API Endpoints

You can test the calculator using the following endpoints:

* http://localhost:3090
   * http://localhost:3090/add?n1=5&n2=3  
   * http://localhost:3090/subtract?n1=8&n2=2  
   * http://localhost:3090/multiply?n1=4&n2=6  
   * http://localhost:3090/divide?n1=10&n2=2  


## Logs

Logs are saved in the `logs/` directory.

### View logs in real time:
tail -f logs/error.log
tail -f logs/combined.log


## Push Docker Image to Docker Hub

### 1. Tag the Image
docker tag anushakatuwal99/calculator-web-server anushakatuwal99/calculator-web-server:latest

### 2. Login to Docker Hub
docker login

### 3. Push the Image to docker hub
docker push anushakatuwal99/calculator-web-server:latest
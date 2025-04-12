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
git clone https://github.com/s224917102/sit737-2025.git
cd sit737-2025/prac5d


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


## Push Docker Image to Google Cloud Registry

If you want to push the Docker image to Google Cloud Registry, follow these steps:

### 1. Tag the Image
Tag your Docker image with the appropriate registry URL:

docker tag anushakatuwal99/calculator-web-server:latest australia-southeast2-docker.pkg.dev/sit737-25t1-katuwal-ch-1ae0a33/my-docker-repo/calculator-web-server:latest

### 2. Login to Google Cloud Registry
Authenticate Docker to access Google Cloud Container Registry:
gcloud auth print-access-token | docker login -u oauth2accesstoken --password-stdin australia-southeast2-docker.pkg.dev

### 3. Push the Image to Google Cloud
Upload the image to Google Cloud's Container Registry:
docker push australia-southeast2-docker.pkg.dev/sit737-25t1-katuwal-ch-1ae0a33/my-docker-repo/calculator-web-server:latest

## Running the Container from the Published Image

After pushing the image to Google Cloud, you can run the container from the published image by executing the following command:
docker run -d -p 3090:3000 australia-southeast2-docker.pkg.dev/sit737-25t1-katuwal-ch-1ae0a33/my-docker-repo/calculator-web-server:latest

This will start the container and map port 3090 on your local machine to port 3000 on the container, allowing you to access the microservice at [http://localhost:3090](http://localhost:3090).

## View Running Containers
To check which containers are currently running, use the following command: 
docker ps


## Stop a Running Container
To stop a running container, you can use the following command:

docker stop <container_id_or_name>
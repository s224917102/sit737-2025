# Deploying a Calculator App on Kubernetes

## Overview
This repository contains the steps for deploying a containerized Node.js application to a Kubernetes cluster.

## Requirements
- **Docker**: For building and running the container.
- **Kubernetes**: For managing the application deployment.
- **kubectl**: To interact with the Kubernetes cluster.
- **Node.js**: The application is built using Node.js.

### 1. Setup The Kubernetes Cluster
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
kubectl -n kubernetes-dashboard create token admin-user
kubectl apply -f cluster_role_binding.yaml
kubectl apply -f dashboard-adminuser.yaml 


### 2. Build Docker Image and run app

Build the Docker image for the application:

```bash
docker build -t anushakatuwal99/calculator-web-server:v1 .
```
Run it with Docker Compose:
```bash
docker-compose up
```

### 3. Create Kubernetes Deployment

Deploy the application with the following `createDeployment.yaml`:

```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
   name: mydeploymentv1
   labels:
      app: myapp
      tier: frontend
   spec:
   # modify replicas according to your case
   replicas: 3
   selector:
      matchLabels:
         tier: frontend
   template:
      metadata:
         labels:
         tier: frontend
      spec:
         containers:
         - name: mynode
         image: anushakatuwal99/calculator-web-server:v1
         ports:
         - containerPort: 3090
```

Run the following command:

```bash
kubectl apply -f createDeployment.yaml
```

### 4. Create Kubernetes Service

Expose the application with this `createService.yaml`:

```yaml
   apiVersion: v1
   kind: Service
   metadata:
   name: calculator-service-v1
   spec:
   selector:
      tier: frontend
   ports:
      - protocol: TCP
         port: 80           # The port clients will use to access the service
         targetPort: 3000    # The port your container listens on 3000
   type: NodePort         # So you can access it via localhost:<nodePort>
```

Run the following command:

```bash
kubectl apply -f createService.yaml
```

## Conclusion
This task deploys a Node.js application on a Kubernetes cluster and exposes it via a NodePort service.
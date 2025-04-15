# Interacting with Kubernetes

## Overview
This task involves interacting with a deployed Kubernetes application and updating it using Kubernetes commands and Docker image versioning.

## Tools Required
- Git: https://github.com  
- Visual Studio Code: https://code.visualstudio.com/  
- Node.js: https://nodejs.org/en/download/  
- Docker  
- Kubernetes (via Docker Desktop)  
- Kubectl CLI  

---

## Part I – Interact with the Deployed Application

### Step 1: Verify the Application is Running
Run the following commands:
```bash
kubectl get pods
kubectl get services
```

### Step 2: Port Forward the Kubernetes Service
Forward traffic from a local port to the Kubernetes service port (usually 80):
```bash
kubectl port-forward service/calculator-service-v1 8080:80
```

### Step 3: Access the Application
Open a web browser and navigate to:
```
http://localhost:8080
```

## Part II – Update the Application

### Step 1: Modify the Application Code
Make the necessary changes to your Node.js application (e.g., calculator.js).

### Step 2: Build and Push a New Docker Image
Update the version tag to avoid conflicts:
```bash
docker build -t anushakatuwal99/calculator-web-server:v2 .
docker-compose up
```

### Step 3: Update Kubernetes Deployment and Service
Updated the image tag: in createDeployment and createService yaml file
```yaml
containers:
  - name: mynode
    image: anushakatuwal99/calculator-web-server:v2
```

Apply the updated deployment:
```bash
kubectl apply -f createDeployment.yaml
```

Apply the updated service:
```bash
kubectl apply -f createService.yaml
```

### Step 4: Verify the Update
```bash
kubectl get pods
kubectl get svc
```

### Step 5: Re-verify in Browser
Use the same port-forward command:
```bash
kubectl port-forward service/calculator-service-v2 8090:80
```
Then navigate to:
```
http://localhost:8090
```
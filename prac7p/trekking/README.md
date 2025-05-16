````markdown
# Adding a Database to Kubernetes-deployed Microservice

**Student Name:** Anusha Katuwal Chhetri  
**Student ID:** 224917102  
**Email:** s224917102@deakin.edu.au  

---

## Overview

This README explains how to integrate a MongoDB database into your existing Node.js microservice, containerized with Docker and deployed on a local Kubernetes cluster (Docker Desktop). You will create and secure a MongoDB instance, persist its data, connect your app to it, and verify full end-to-end functionality.


---

## Prerequisites

- Docker Desktop (with Kubernetes enabled)  
- `kubectl`  (A Kubernetes cluster installed by Docker Desktop to talk to your cluster)  
- Node.js & npm  
- Git  
- `mongo` CLIs installed locally  
- Docker image `anushakatuwal99/trekking-web-server:v1` pushed to a registry  

---

## 1. Storage Setup

1. **PersistentVolume**  
   ```bash
   kubectl apply -f createMongoPersistentVolume.yaml
````

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mongodb-pv
spec:
  capacity:
    storage: 1Gi
  accessModes: [ ReadWriteMany ]
  hostPath:
    path: /path/on/host/MyMappedFolder
    type: Directory
```

2. **PersistentVolumeClaim**

   ```bash
   kubectl apply -f createMongoPersistentVolumeClaim.yaml
   ```

   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: mongodb-pvc
   spec:
     storageClassName: demo-storage
     accessModes: [ ReadWriteMany ]
     resources:
       requests:
         storage: 1Gi
   ```

---

## 2. Config & Secrets

1. **ConfigMap**

   ```bash
   kubectl apply -f createMongoConfigMap.yaml
   ```

   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: mongodb-config
   data:
     username: admin
     mongodb.conf: |
       storage:
         dbPath: /data/db
       replication:
         replSetName: "rs0"
   ```

2. **Secret**

   ```bash
   kubectl apply -f createMongoSecret.yaml
   ```

   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: mongodb-secret
   type: Opaque
   data:
     password: cGFzc3dvcmQxMjM=   # base64(password123)
   ```

---

## 3. Services

1. **ClusterIP Service**

   ```bash
   kubectl apply -f createMongoService.yaml
   ```

   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: mongodb
   spec:
     selector:
       app: mongodb
     ports:
       - port: 27017
         targetPort: 27017
   ```

2. **Headless Service**

   ```bash
   kubectl apply -f createMongoHeadlessService.yaml
   ```

   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: mongodb
   spec:
     clusterIP: None
     selector:
       app: mongodb
     ports:
       - name: mongodb
         port: 27017
         targetPort: 27017
   ```

---

## 4. MongoDB StatefulSet

```bash
kubectl apply -f createMongoStatefulSet.yaml
```

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
spec:
  serviceName: "mongodb"
  replicas: 3
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:4.0.8
        command:
          - mongod
          - "--bind_ip_all"
          - --config=/etc/mongo/mongodb.conf
        env:
          - name: MONGO_INITDB_ROOT_USERNAME
            valueFrom:
              configMapKeyRef:
                name: mongodb-config
                key: username
          - name: MONGO_INITDB_ROOT_PASSWORD
            valueFrom:
              secretKeyRef:
                name: mongodb-secret
                key: password
        volumeMounts:
          - name: mongodb-volume
            mountPath: /data/db
          - name: mongodb-config
            mountPath: /etc/mongo
        startupProbe:
          exec:
            command: ["mongo","--eval","db.adminCommand('ping')"]
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          exec:
            command: ["mongo","--eval","db.adminCommand('ping')"]
          initialDelaySeconds: 10
          periodSeconds: 20
        readinessProbe:
          exec:
            command: ["mongo","--eval","db.adminCommand('ping')"]
          initialDelaySeconds: 5
          periodSeconds: 10
      volumes:
        - name: mongodb-config
          configMap:
            name: mongodb-config
            items:
              - key: mongodb.conf
                path: mongodb.conf
  volumeClaimTemplates:
    - metadata:
        name: mongodb-volume
      spec:
        accessModes: [ ReadWriteOnce ]
        storageClassName: demo-storage
        resources:
          requests:
            storage: 1Gi
```

---

## 5. App Deployment & Service

1. **Deployment**

   ```bash
   kubectl apply -f createApplicationDeployment.yaml
   ```

   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: trekking-app
   spec:
     replicas: 2
     selector:
       matchLabels:
         app: trekking-app
     template:
       metadata:
         labels:
           app: trekking-app
       spec:
         containers:
         - name: trekking
           image: anushakatuwal99/trekking-web-server:v1
           env:
             - name: MONGO_USER
               valueFrom:
                 configMapKeyRef:
                   name: mongodb-config
                   key: username
             - name: MONGO_PASS
               valueFrom:
                 secretKeyRef:
                   name: mongodb-secret
                   key: password
             - name: MONGO_URI
               value: >-
                 mongodb://$(MONGO_USER):$(MONGO_PASS)@mongodb.default.svc.cluster.local:27017/trekkingDB?replicaSet=rs0&directConnection=false
           ports:
             - containerPort: 3000
   ```

2. **LoadBalancer Service**

   ```bash
   kubectl apply -f createApplicationService.yaml
   ```

   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: trekking-service-v1
   spec:
     type: LoadBalancer
     selector:
       app: trekking-app
     ports:
       - port: 3000
         targetPort: 3000
   ```

---

## 6. Replica Set Init & CRUD Check

```bash
kubectl exec -it mongodb-0 -- mongo --eval 'rs.initiate({_id:"rs0",members:[
  {_id:0,host:"mongodb-0.mongodb:27017"},
  {_id:1,host:"mongodb-1.mongodb:27017"},
  {_id:2,host:"mongodb-2.mongodb:27017"}
]})'
kubectl exec -it mongodb-0 -- mongo --eval 'rs.status()'

kubectl exec -it mongodb-0 -- mongo trekkingDB --eval 'db.trekdestinations.insertOne({
  name:"Makalu Base Camp Trek", totalDays:12, difficultyLevel:"Easy"
})'
kubectl exec -it mongodb-0 -- mongo trekkingDB --eval 'db.trekdestinations.find().pretty()'
```

---

## 7. Simple Monitoring Commands

### MongoDB

```bash
# Live stats
kubectl port-forward statefulset/mongodb 27016:27017


# Replica set health & server status
kubectl exec -it mongodb-0 -- mongo --eval 'rs.status()'
kubectl exec -it mongodb-0 -- mongo --eval 'db.serverStatus()'
```

### Application & Cluster

```bash
kubectl logs deployment/trekking-app
kubectl describe deployment trekking-app
kubectl get pods
kubectl get svc
```
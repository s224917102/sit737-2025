// app.js

const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'Frontend')));

// 2. Routes
const userRoutes    = require('./router/router');
const trekRoutes    = require('./router/trekRouter');
const agencyRoutes  = require('./router/agencyRoutes');
const bookingRoutes = require('./router/bookingRoutes');
const paymentRoutes = require('./router/payementRoutes');
const guidesRouter  = require('./router/guideRoutes');

app.use('/api/user',    userRoutes);
app.use('/api/treks',   trekRoutes);
app.use('/api/agencies',agencyRoutes);
app.use('/api/bookings',bookingRoutes);
app.use('/api/payement',paymentRoutes);
app.use('/api/guides',  guidesRouter);

// 3. Fallback for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

// 4. Error handler
app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 5. Create HTTP & Socket.IO servers
const server = http.createServer(app);
const io     = new Server(server);

// 6. Real-time events
io.on('connection', socket => {
  console.log('A user connected:', socket.id);
  socket.on('chat message', msg => io.emit('chat message', msg));
  socket.on('disconnect',   ()  => console.log('User disconnected:', socket.id));
});

// 7. Database + Server startup
async function start() {
  try {
    // Use your MONGO_URI from env
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
      bufferCommands:     false  // disable buffering so we fail fast if not connected :contentReference[oaicite:0]{index=0}
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }

  // Only start listening once DB is connected
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, '0.0.0.0', () =>
    console.log(`Server started on port ${PORT}`));
}

start();

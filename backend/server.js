const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://ephemeral-heliotrope-f8a9dd.netlify.app', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: ['https://ephemeral-heliotrope-f8a9dd.netlify.app', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const agentRoutes = require('./routes/agents');
const webhookRoutes = require('./routes/webhook');

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/webhook', webhookRoutes);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected!');
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log(err));
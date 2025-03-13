const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');

// Initialize Express
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server);

// Connect to MongoDB
mongoose.connect('mongodb+srv://PowerAppDB:res1234ear@@powerappdb.6gd9t.mongodb.net/?retryWrites=true&w=majority&appName=PowerAppDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a Mongoose schema and model for storing feedback
const feedbackSchema = new mongoose.Schema({
  userId: String,
  technique: String,
  correctness: Number,
  timestamp: { type: Date, default: Date.now },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Serve static files (if any)
app.use(express.static('public'));

// Handle new Socket.IO connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for feedback events from clients
  socket.on('feedback', async (data) => {
    const { userId, technique, correctness } = data;

    // Save feedback to MongoDB
    const feedback = new Feedback({ userId, technique, correctness });
    await feedback.save();

    // Emit real-time feedback to the client
    socket.emit('feedbackReceived', feedback);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

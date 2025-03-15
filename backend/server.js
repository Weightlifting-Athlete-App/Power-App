// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(bodyParser.json());
app.use(cors());

// Mount routes, etc.
const userRoutes = require('./routes/UserRoutes');
app.use('/api', userRoutes);

// Remove deprecated options
mongoose
.connect(MONGO_URI, {
  dbName: "PowerAppDB", // Specify the database name explicitly
  
})
.then(() => console.log("MongoDB connected to PowerAppDB"))
.catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

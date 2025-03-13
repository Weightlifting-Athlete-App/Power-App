const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = 'mongodb+srv://PowerAppDB:res1234ear@@powerappdb.6gd9t.mongodb.net/?retryWrites=true&w=majority&appName=PowerAppDB';

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

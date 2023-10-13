const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { userRouter } = require("./routers/users");
const { bookRouter } = require("./routers/books");
const app = express();
require('dotenv').config();

// Middlewares

app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: true }));


// Connexion Database

const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

const MONGODB_URL = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@projet.tevf5co.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(MONGODB_URL,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


// Routers
app.use("/api/auth", userRouter);
app.use("/api/books", bookRouter);

module.exports = app;
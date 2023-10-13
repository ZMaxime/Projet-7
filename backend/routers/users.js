const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

// Inscription

async function signupUser(req, res) {
  
    if (!req.body.email || !req.body.password) {
      res.status(400).send({ message: "Email ou mot de passe manquant" });
      return;
    }
    const { email, password } = req.body;
  
    try {
      const hash = await bcrypt.hash(password, 10);
      const user = new User({
        email: email,
        password: hash
      });
      await user.save();
        res.send({ userId: user._id });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Le compte n'a pas pu être crée" });
    }
}


// Connexion

async function logUser(req, res) {
    const requestBody = req.body;
    if (!requestBody.email || !requestBody.password) {
      res.status(400).send({ message: "Email ou mot de passe manquant" });
      return;
    }
    const user = await User.findOne({ email: requestBody.email });
    if (user == null) {
      res.status(401).send({ message: "Identifiants incorrects" });
      return;
    }
    const isPasswordCorrect = await bcrypt.compare(requestBody.password, user.password);
    if (!isPasswordCorrect) {
      res.status(401).send({ message: "Identifiants incorrects" });
      return;
    }
    res.send({ userId: user._id, token: makeToken(user) });
}

// Gestion des routes

const userRouter = express.Router();
userRouter.post("/signup", signupUser);
userRouter.post("/login", logUser);

// Gestion des tokens

function makeToken(user) {
  const secretKey = process.env.JWT_SECRET;
  const token = jsonwebtoken.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
  return token;
}

module.exports = { userRouter };
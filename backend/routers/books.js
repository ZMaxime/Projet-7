const express = require("express");
const { Book } = require("../models/Book");
const { upload, compressAndSaveImage } = require("../middleware/storage");
const { checkToken } = require("../middleware/checkToken");

const bookRouter = express.Router();

bookRouter.post("/:id/rating", checkToken, postRating);
bookRouter.get("/", getBooks);
bookRouter.get("/bestrating", getBooksWithBestRating);
bookRouter.get("/:id", getBook);
bookRouter.delete("/:id", checkToken, deleteBook);
bookRouter.post("/", checkToken, upload.single("image"), postBooks);
bookRouter.put("/:id", checkToken, putBook);

module.exports = { bookRouter };

// Ajouter un nouveau livre

function postBooks(req, res) {
    const bookStringified = req.body.book;
    const book = JSON.parse(bookStringified);
    const file = req.file;
  try {

    const compressedImageBuffer = compressAndSaveImage(file);

      const newBook = new Book({
        userId: book.userId,
        title: book.title,
        author: book.author,
        imageUrl: file.originalname,
        year: book.year,
        genre: book.genre,
        ratings: [
          {
            userId: book.userId,
            grade: book.ratings.find((obj) => obj.userId === book.userId).grade
          }
        ],
        averageRating: 0
      });
      newBook.save();
      res.send(newBook);
  } catch (error) {
      console.error(error);
    }
}

// Supprimer un livre

async function deleteBook(req, res) {
  const id = req.params.id;
  const book = await Book.findById(id);
  if (!book) return res.status(404).send("Livre introuvable");
  const userIdOnBook = book.userId;
  if (userIdOnBook !== req.body.userIdFromToken)
    return res.status(401).send("Vous ne pouvez supprimer que vos propres livres");
  const result = await Book.findByIdAndDelete(id);
  res.send(result);
}

// GET pour la totalité des livres en page d'accueil

async function getBooks(req, res) {
    const allBooks = await Book.find();
    allBooks.forEach((book) => {
      const imageUrl = generateImageUrl(book.imageUrl)
      book.imageUrl = imageUrl;
    });
    res.send(allBooks);
}

// GET pour un livre spécifique


async function getBook(req, res) {
    const id = req.params.id;
    const book = await Book.findById(id);
    book.imageUrl = generateImageUrl(book.imageUrl);
    res.send(book);
}


function generateImageUrl(localUrl) {
    const hostUrl = "http://localhost";
    const port = 4000;
    const absoluteUrl = hostUrl + ":" + port + "/" + localUrl;
    return absoluteUrl;
}

// Modification de livre

async function putBook(req, res) {
    const id = req.params.id;
    const book = await Book.findById(id);
    if (!book) return res.status(404).send("Livre introuvable");
    const userId = book.userId;
    if (userId !== req.body.userIdFromToken)
      return res.status(401).send("Vous ne pouvez éditer que vos propres livres");
    const result = await Book.findOneAndUpdate(
      { _id: id },
      {
        title: req.body.title,
        author: req.body.author,
        year: req.body.year,
        genre: req.body.genre
      }
    );
    res.send(result);
}

// Notation de livre

async function postRating(req, res) {
  const id = req.params.id;
  const book = await Book.findById(id);
  const userId = req.body.userIdFromToken;
  try {
    const ratings = book.ratings;
    if (ratings.some((obj) => obj.userId === userId)) {
      return res.status(400).send("Vous avez déjà noté ce livre");
    }
    const newRating = {
      userId: userId,
      grade: req.body.rating
    };
    ratings.push(newRating);

    const sum = ratings.reduce((total, curr) => (total += curr.grade), 0);
    const numberOfRaters = ratings.length;
    const averageRating = sum / numberOfRaters;
    book.ratings = ratings;
    book.averageRating = averageRating;

    book.save();
    res.send(book);
  } catch (error) {
    console.error(error);
  }
}

// Récupération des livres les mieux notés

async function getBooksWithBestRating(req, res) {
  const books = await Book.find().sort({ averageRating: -1 }).limit(3);

  const booksWithAbsoluteUrls = books.map((book) => ({
    ...book.toObject(),
    imageUrl: generateImageUrl(book.imageUrl),
  }));
  res.send(booksWithAbsoluteUrls);
}
const mongoose = require('mongoose');

const ratingsSchema = new mongoose.Schema({
    userId: { type: String },
    grade: { type: Number }
  });

const bookSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [ratingsSchema],
    averageRating: { type: Number }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = { Book };
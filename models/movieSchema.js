const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
  date: {
    type: Date
  },
  imdb_id: {
    type: String
  },
  overview: {
    type: String
  },
  poster_path: {
    type: String
  },
  rating: {
    type: String
  },
  release_date: {
    type: String
  },
  title: {
    type: String
  },
  tmdb_id: {
    required: true,
    type: Number
  }
}, { timestamps: true })

module.exports = movieSchema

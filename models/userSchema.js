const mongoose = require('mongoose')
const Movie = require('./movieSchema.js')

const userSchema = new mongoose.Schema({
  email: {
    required: true,
    type: String,
    unique: true
  },
  movies: {
    type: [Movie]
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)

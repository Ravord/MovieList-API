require('dotenv').config()
require('./db.js')

const express = require('express')
const app = express()
app.use(express.json())
const axios = require('axios')
const User = require('./models/userSchema.js')
const port = process.env.PORT || 5000

const cors = require('cors')
app.use(cors({
  origin: process.env.CORS_ORIGIN
}))

app.get('/', (req, res, next) => {
  return res.status(200).json({ msg: 'MovieList API is working correctly' })
})
app.get('/search', async (req, res, next) => {
  let encodedUrl = encodeURI(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${req.query.query}`)
  let { data: { results: movies } } = await axios.get(encodedUrl)
  return res.status(200).json(movies)
})
app.post('/add', async (req, res, next) => {
  let movie
  try {
    let { data } = await axios.get(`https://api.themoviedb.org/3/movie/${req.body.tmdb_id}?api_key=${process.env.TMDB_API_KEY}`)
    movie = data
  }
  catch (err) {
    return res.status(err.response.status).json({ msg: err.message })
  }
  let data = {
    date: req.body.date,
    imdb_id: movie.imdb_id,
    overview: movie.overview,
    poster_path: movie.poster_path,
    rating: req.body.rating,
    release_date: movie.release_date,
    title: movie.title,
    tmdb_id: req.body.tmdb_id
  }
  for (let key in data) {
    if (!data[key]) {
      data[key] = null
    }
  }
  let allowedRatings = ['n/a', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  if (!allowedRatings.includes(data.rating)) {
    data.rating = 'n/a'
  }
  let foundUser = await User.findOne({ email: req.body.email })
  if (foundUser) {
    await User.bulkWrite([
      {
        updateOne: {
          filter: {
            email: req.body.email
          },
          update: {
            $pull: { movies: { tmdb_id: data.tmdb_id } }
          }
        }
      },
      {
        updateOne: {
          filter: {
            email: req.body.email
          },
          update: {
            $push: { movies: data }
          }
        }
      }
    ])
  }
  else {
    await User.create({ email: req.body.email, movies: [data] })
  }
  return res.status(204).json()
})
app.post('/', async (req, res, next) => {
  let foundUser = await User.findOne({ email: req.body.email })
  if (foundUser) {
    return res.status(200).json(foundUser.movies)
  }
  else {
    return res.status(200).json([])
  }
})
app.patch('/update', async (req, res, next) => {
  if (!req.body.tmdb_id) {
    return res.status(422).json({ msg: 'Missing movie id' })
  }
  if (req.body.rating) {
    let allowedRatings = ['n/a', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    if (!allowedRatings.includes(req.body.rating)) {
      req.body.rating = 'n/a'
    }
  }
  await User.updateOne({ 'movies.tmdb_id': req.body.tmdb_id }, {
    $set: {
      'movies.$.date': req.body.date,
      'movies.$.rating': req.body.rating
    }
  })
  return res.status(204).json()
})
app.delete('/remove', async (req, res, next) => {
  await User.updateOne({ 'movies.tmdb_id': req.body.tmdb_id }, {
    $pull: {
      movies: { tmdb_id: req.body.tmdb_id }
    }
  })
  return res.status(204).json()
})

app.listen(port, () => {
  console.log(`App is now running on port ${port}`)
})

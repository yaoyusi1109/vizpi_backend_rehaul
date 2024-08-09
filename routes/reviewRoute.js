const express = require('express')
const router = express.Router()
const reviewController = require('../controllers/reviewController')



router.post('/', (req, res, next) => {
  return reviewController.createReview(req, res, next)
})


module.exports = router
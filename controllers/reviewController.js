const reviewService = require("../services/reviewService")

exports.createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.body.review)
    res.status(201).json({ review: review })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
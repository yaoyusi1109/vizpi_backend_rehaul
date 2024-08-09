const sequelize = require("../postgre/db")
const initModels = require("../models/init-models")

const Review = initModels(sequelize).review

exports.createReview = async (review) => {
  try {
    return await Review.create(review)
  } catch (err) {
    console.log(err)
  }
}
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const initModels = require("../models/init-models")
const sequelize = require('../postgre/db')
const Instructor = initModels(sequelize).instructor
const authService = require('../services/authService')

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const instructor = await authService.validatePassword(email, password)
      if (!instructor) {
        return done(null, false, { message: 'Incorrect password.' })
      }
      return done(null, instructor)
    } catch (error) {
      return done(error)
    }
  }
))

passport.serializeUser((instructor, done) => {
  done(null, instructor.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const instructor = await Instructor.findByPk(id)
    done(null, instructor)
  } catch (error) {
    done(error)
  }
})

module.exports = passport

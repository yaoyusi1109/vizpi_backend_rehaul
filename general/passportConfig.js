const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const initModels = require("../models/init-models")
const sequelize = require('../postgre/db')
const Instructor = initModels(sequelize).instructor
const User = initModels(sequelize).user;
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
  console.log(instructor)
  done(null, {id: instructor.id ,type: instructor.role==1?"instructor":"student"})
})

passport.deserializeUser(async (id, done) => {
  try {
    if(id.type== "instructor"){
      const instructor = await Instructor.findByPk(id)
      done(null, instructor)
    }
    else{
      const student = await User.findByPk(id)
      done(null, student)
    }
  } catch (error) {
    done(error)
  }
})

module.exports = passport

const bcrypt = require('bcrypt')
const sequelize = require("../postgre/db")
const initModels = require("../models/init-models")
const Instructor = initModels(sequelize).instructor

async function hashPassword (password) {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

async function validatePassword (email, plainPassword) {
  const instructor = await Instructor.findOne({ where: { email: email } })
  const hashedPassword = instructor.password
  const isValid = await bcrypt.compare(plainPassword, hashedPassword)
  if (isValid) {
    const instructorWithoutPassword = { ...instructor.toJSON() }
    delete instructorWithoutPassword.password
    return instructorWithoutPassword
  } else {
    return null
  }
}

async function register (instructor) {
  instructor.password = await hashPassword(instructor.password)
  try {
    const res = await Instructor.create(instructor)
    return res
  } catch (error) {
    throw new Error(error)
  }
}

// function login (req, res, next) {
//   passport.authenticate('local', (err, user, info) => {
//     if (err) {
//       return next(err)
//     }
//     if (!user) {
//       return res.status(400).send(info.message)
//     }
//     req.logIn(user, (err) => {
//       if (err) {
//         return next(err)
//       }
//       return res.redirect('/dashboard')
//     })
//   })(req, res, next)
// }

function logout (req, res) {
  req.logout()
}

module.exports = {
  hashPassword,
  validatePassword,
  register,
  // login,
  logout
}

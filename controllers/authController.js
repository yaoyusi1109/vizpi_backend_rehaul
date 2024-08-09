const authService = require('../services/authService')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const e = require('express')
const secret = process.env.JWT_SECRET
const { getInstructorById } = require('../services/instructorService')
const { getUserById } = require('../services/userService')

async function register (req, res) {
  try {
    await authService.register(req.body.instructor)
    res.status(201).send('User registered successfully')
  } catch (error) {
    res.status(500).send(error.message)
  }
}
async function registerStudent (req, res) {
  try {
    const student = await authService.registerStudent(req.body.student)
    res.json({user:student})
  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
}

async function validate (req, res) {
  jwt.verify(req.body.token, secret, async (err, decoded) => {
    if (err) {
      console.log('JWT ERROR:', err)
      res.status(401).send('Unauthorized')
    } else {
      const id = decoded.id
      const type = decoded.type
      console.log(type)
      try {
        if(type == "instructor"){
          const instructor = await getInstructorById(id)
          if (!instructor) {
            return res.status(404).json({ message: 'User not found' })
          }
          res.status(200).json(instructor)
        }
        else{
          const student = await getUserById(id)
          if (!student) {
            return res.status(404).json({ message: 'User not found' })
          }
          res.status(200).json(student)
        }
        
      } catch (error) {
        throw error
      }
    }
  })
}


function login (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.status(400).send(info.message)
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      }

      const token = jwt.sign({ id: user.id, type: user.role==1?"instructor":"student"}, secret, { expiresIn: '7d' })
      return res.json({ token })
    })
  })(req, res, next)
}

async function recover (req, res) {
  try {
    const student = await authService.recover(req.body.email)
    res.json({result: student})
  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
}

function logout (req, res) {
  req.logout()
}

module.exports = {
  register,
  registerStudent,
  recover,
  login,
  logout,
  validate
}

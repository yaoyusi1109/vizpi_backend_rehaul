const express = require('express')
const authController = require('../controllers/authController')
const router = express.Router()

router.post('/register', (req, res, next) => {
  return authController.register(req, res, next)
})
router.post('/registerStudent', (req, res, next) => {
  console.log("hello")
  return authController.registerStudent(req, res, next)
})
router.post('/login', authController.login)
router.post('/validate', authController.validate)
router.post('/recover', (req, res, next) => {
  return authController.recover(req, res, next)
})

router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('You are not authenticated')
  }
  res.send('Welcome to your dashboard')
})

module.exports = router

const express = require('express')
const authController = require('../controllers/authController')
const router = express.Router()

router.post('/register', (req, res, next) => {
  return authController.register(req, res, next)
})
router.post('/login', authController.login)
router.post('/validate', authController.validate)

router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('You are not authenticated')
  }
  res.send('Welcome to your dashboard')
})

module.exports = router

const express = require('express')
const router = express.Router()
const CodeController = require('../controllers/codeController')

router.get('/', (req, res, next) => {
  return CodeController.list(req, res, next)
})

router.post('/', (req, res, next) => {
  return CodeController.createCode(req, res, next)
})

router.get('/:id', (req, res, next) => {
  return CodeController.getCodeById(req, res, next)
})

router.put('/:id', (req, res, next) => {
  return CodeController.updateCode(req, res, next)
})

router.delete('/:id', (req, res, next) => {
  return CodeController.deleteCode(req, res, next)
})

router.get('/user/:id', (req, res, next) => {
  return CodeController.getCodeByUserId(req, res, next)
})

router.post('/user/:id', (req, res, next) => {
  return CodeController.addCodeToUser(req, res, next)
})

router.get('/session/:id', (req, res, next) => {
  return CodeController.getCodesBySessionId(req, res, next)
})

router.get('/session/:id/:stuId', (req, res, next) => {
  return CodeController.getCodeByUserInSession(req, res, next)
})

module.exports = router

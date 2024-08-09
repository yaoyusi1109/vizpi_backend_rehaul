const express = require('express')
const router = express.Router()
const gptController = require('../controllers/gptController')

router.post('/functionName', (req, res, next) => {
  return gptController.functionNameDetect(req, res, next)
})

router.post('/test', (req, res, next) => {
  return gptController.generateUnitTests(req, res, next)
})

router.post('/validate', (req, res, next) => {
  return gptController.validate(req, res, next)
})

router.post('/changeTests', (req, res, next) => {
  return gptController.changeTests(req, res, next)
})

router.post('/topics/:groupId', (req, res, next) => {
  return gptController.analyzeTopics(req, res, next)
})

router.post('/messages', (req, res, next) => {
  return gptController.classify(req, res, next)
})

router.post('/generateTask', (req, res, next) => {
  return gptController.generateTaskDescription(req, res, next)
})

router.post('/autoCompleteTask', (req, res, next) => {
  return gptController.generateTaskRealTime(req, res, next)
})

router.post('/getQuiz', (req, res, next) => {
  return gptController.getQuizQuestions(req, res, next)
})

router.post('/openAI', (req, res, next) => {
  return gptController.chatCompletion(req, res, next)
})

router.post('/generateAudioTask', (req, res, next) => {
  return gptController.generateAudioTaskDescription(req, res, next)
})

// correct answers api
router.post('/getCorrectAnswers', (req, res, next) => {
  return gptController.getCorrectAnswers(req, res, next)
})



module.exports = router

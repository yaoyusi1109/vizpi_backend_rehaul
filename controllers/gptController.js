const gptService = require('../services/gptService')
const chatService = require('../services/chatService')
const { createTopicAnalysis } = require('../services/topicAnalysisService')

exports.functionNameDetect = async (req, res, next) => {
  try {
    const functionName = await gptService.functionNameDetect(req.body.taskDescription)
    res.status(200).json({
      functionName: functionName
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

exports.generateUnitTests = async (req, res, next) => {
  try {
    const task = req.body.task
    const unitTests = await gptService.generateUnitTests(task.description, task.num, task.type)
    res.status(200).json(unitTests)
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

exports.validate = async (req, res, next) => {
  try {
    const task = req.body.task
    const unitTests = await gptService.validateTests(task)
    res.status(200).json(unitTests)
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

exports.changeTests = async (req, res, next) => {
  try {
    const task = req.body.task
    const gptCode = req.body.gptCode
    const tests = req.body.tests
    const unitTests = await gptService.changeTests(task, gptCode, tests)
    res.status(200).json(unitTests)
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

exports.classify = async (req, res, next) => {
  try {
    const messages = req.body.messages
    const studentClass = await gptService.classify(messages)
    res.status(200).json(studentClass)
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

exports.generateTaskDescription = async (req, res, next) => {
  try {
    const taskDescription = req.body.taskDescription
    const refinedDescription = await gptService.generateTaskDescription(taskDescription)
    res.status(200).json(refinedDescription)
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

exports.generateAudioTaskDescription = async (req, res, next) => {
  try {
    const taskDescription = req.body.taskDescription
    const refinedDescription = await gptService.generateAudioTaskDescription(taskDescription)
    res.status(200).json(refinedDescription)
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

exports.generateTaskRealTime = async (req, res, next) => {
  try {
    const context = req.body.context
    const learning_objectives = req.body.learning_objectives
    const taskDescription = req.body.taskDescription

    const unitTests = await gptService.generateTaskRealTime(context, learning_objectives, taskDescription)
    res.status(200).json(unitTests)
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

exports.getQuizQuestions = async (req, res, next) => {
  try {
    const taskDescription = req.body.taskDescription
    const quiz = await gptService.generateQuiz(taskDescription)
    res.status(200).json(quiz)
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}


exports.analyzeTopics = async (req, res, next) => {
  try {
    const groupId = req.params.groupId
    const sessionId = req.body.sessionId
    const message = await chatService.getMessagesByGroup(groupId)
    const topics = await gptService.analyzeTopics(message)
    createTopicAnalysis({
      session_id: sessionId,
      group_id: groupId,
      metadata: topics,
      type: "MESSAGE_TOPICS"
    })
    res.status(200).json(topics)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error.message
    })
  }
}

exports.chatCompletion = async (req, res, next) => {
  const message = req.body.messages
  // console.log('message', message);
  try {
    const reply = await gptService.chatCompletion(message)
    res.status(200).json(reply)
  } catch (error) {
    console.error('Failed to send message', error)
    res.status(500).send('Server error')
  }
}


exports.getCorrectAnswers = async (req,res,next) => {
  const message = req.body.taskDescription
  try {
    const reply = await gptService.correctAnswers(message)
    res.status(200).json(reply)
  } catch (error) {
    console.error('Failed to send message', error)
    res.status(500).send('Server error')
  }
}

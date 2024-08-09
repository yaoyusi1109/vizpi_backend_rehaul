const express = require('express')
const router = express.Router()
const InstructorController = require('../controllers/instructorController')

router.get('/', (req, res, next) => {
  return InstructorController.list(req, res, next)
})

router.post('/', (req, res, next) => {
  return InstructorController.createInstructor(req, res, next)
})

router.get('/:id', (req, res, next) => {
  return InstructorController.getInstructorById(req, res, next)
})

router.put('/:id', (req, res, next) => {
  return InstructorController.updateInstructor(req, res, next)
})

router.delete('/:id', (req, res, next) => {
  return InstructorController.deleteInstructor(req, res, next)
})

router.get("/session/:sessionId", (req, res, next) => {
	return InstructorController.getInstructorBySessionId(req, res, next);
});

module.exports = router

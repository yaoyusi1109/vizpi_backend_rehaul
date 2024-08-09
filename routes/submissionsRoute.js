const express = require('express')
const submissionsController = require('../controllers/submissionsController')
const router = express.Router()

router.post('/', (req, res, next) => {
  return submissionsController.createSubmission(req, res, next)
})

router.get("/:id/:user", (req, res, next) => {
	return submissionsController.getUserSubmissions(req, res, next);
});

router.get("/:id", (req, res, next) => {
	return submissionsController.getSessionSubmissions(req, res, next);
});

module.exports = router
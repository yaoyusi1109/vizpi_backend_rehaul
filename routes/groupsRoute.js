const express = require("express")
const router = express.Router()
const groupsController = require("../controllers/groupController")

router.get("/:id", (req, res, next) => {
	return groupsController.getGroupById(req, res, next)
})

router.get("/sessionId/:sessionId", (req, res, next) => {
	return groupsController.getGroupBySessionId(req, res, next)
})

router.get("/user/:userId/:sessionId", (req, res, next) => {
	return groupsController.getGroupByUser(req, res, next)
})

router.get("/users/:userId/:sessionId", (req, res, next) => {
	return groupsController.getGroupsByUser(req, res, next)
})

router.delete("/session/:id", (req, res, next) => {
	return groupsController.removeGroupsInSession(req, res, next)
})


router.get('/:id/users', (req, res, next) => {
	return groupsController.listMembers(req, res, next)
})

router.put("/:id", (req, res, next) => {
	return groupsController.updateGroup(req, res, next)
})

router.get("/:id/topics", (req, res, next) => {
	return groupsController.getTopicAnalysis(req, res, next)
})

router.post("/adduser", (req, res, next) => {
	return groupsController.addUserToGroup(req, res, next)
})

router.delete("/:groupId/removeuser/:userId", (req, res, next) => {
	return groupsController.removeUserFromGroup(req, res, next)
})



module.exports = router

const express = require("express")
const router = express.Router()
const ChatController = require("../controllers/chatController")

router.post("/", (req, res, next) => {
	return ChatController.sendMessage(req, res, next)
})

router.get("/group/:groupId", (req, res, next) => {
	return ChatController.getMessagesByGroup(req, res, next)
})

router.get("/session/:sessionId", (req, res, next) => {
	return ChatController.getMessagesBySession(req, res, next)
})

router.get("/group/:groupId/user/:userId", (req, res, next) => {
	return ChatController.getMessagesByGroupAndRecipent(req, res, next)
})

router.put("/:messageId/reaction", (req, res, next) => {
	return ChatController.updateReaction(req, res, next)
})

router.get("/ai/:userId", (req, res, next) => {
	return ChatController.getAIMessagesByUser(req, res, next)
})

router.put("/:messageId/type", (req, res, next) => {
	return ChatController.updateMessageType(req, res, next)
})
module.exports = router

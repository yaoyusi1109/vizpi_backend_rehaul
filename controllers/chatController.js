const chatService = require("../services/chatService")

exports.sendMessage = async (req, res, next) => {
	try {
		const message = await chatService.sendMessage(req.body)
		res.json({ message: message })
	} catch (err) {
		next(err)
	}
}

exports.getMessagesByGroup = async (req, res, next) => {
	try {
		const messages = await chatService.getMessagesByGroup(req.params.groupId)
		res.json({ messages: messages })
	} catch (err) {
		next(err)
	}
}

exports.getMessagesBySession = async (req, res, next) => {
	try {
		const messages = await chatService.getMessagesBySession(req.params.sessionId)
		res.json({ messages: messages })
	} catch (err) {
		next(err)
	}
}

exports.getMessagesByGroupAndRecipent = async (req, res, next) => {
	try {
		const messages = await chatService.getMessagesByGroupAndRecipent(
			req.params.groupId,
			req.params.userId
		)
		res.json({ messages: messages })
	} catch (err) {
		next(err)
	}
}

exports.updateReaction = async (req, res, next) => {
	try {
		const message = await chatService.updateReaction(req.params.messageId, req.body.reaction)
		res.json({ message: message })
	} catch (err) {
		next(err)
	}
}


exports.updateMessageType = async (req, res, next) => {
	try {
		console.log(req.body)
		const message = await chatService.updateMessageType(req.params.messageId, req.body.question_type)
		res.json({ message: message })
	} catch (err) {
		next(err)
	}
}
exports.getAIMessagesByUser = async (req, res, next) => {
	try {
		const messages = await chatService.getAIMessagesByUser(req.params.userId)
		res.json({ messages: messages })
	} catch (err) {
		next(err)
	}
}

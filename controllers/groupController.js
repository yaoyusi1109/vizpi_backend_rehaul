const groupService = require("../services/groupService")
const topicAnalysisService = require("../services/topicAnalysisService")

exports.getGroupById = async (req, res, next) => {
	try {
		const groups = await groupService.getGroupById(req.params.id)
		res.status(200).json({ group: groups })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getGroupBySessionId = async (req, res, next) => {
	try {
		const groups = await groupService.getGroupBySessionId(req.params.sessionId)
		if (!groups) {
			return res.status(404).json({ message: "Group not found" })
		}
		res.status(200).json({ groups: groups })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getGroupByUser = async (req, res, next) => {
	try {
		const group = await groupService.getGroupByUser(req.params.userId, req.params.sessionId)
		if (!group) {
			return res.status(404).json({ message: "Group not found" })
		}
		res.status(200).json({ group: group })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getGroupsByUser = async (req, res, next) => {
	try {
		const userId = parseInt(req.params.userId, 10)
		if (isNaN(userId)) {
			return res.status(400).json({ message: "Invalid user ID" })
		}
		const group = await groupService.getGroupsByUser(req.params.userId)
		res.status(200).json({ group })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.listMembers = async (req, res, next) => {
	try {
		const users = await groupService.getAllUsers(req.params.id)
		res.json({ users: users })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
}

exports.removeGroupsInSession = async (req, res, next) => {
	try {
		const groupsRemoved = await groupService.removeGroupsBySessionId(
			req.params.id
		)
		res.json({ groupsRemoved })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
}

exports.updateGroup = async (req, res, next) => {
	try {
		const group = await groupService.updateGroup(req.params.id, req.body.group)
		res.json({ group: group })
	} catch (err) {
		next(err)
	}
}

exports.getTopicAnalysis = async (req, res, next) => {
	try {
		const topicAnalysis = await topicAnalysisService.getTopicAnalysisByGroup(req.params.id)
		res.json(topicAnalysis)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
}

exports.addUserToGroup = async (req, res, next) => {
	try {
		const group = await groupService.addUserToGroup(req.body.sessionId, req.body.groupNum, req.body.userId)
		res.json(group)
	} catch (err) {
		next(err)
	}
}

exports.removeUserFromGroup = async (req, res, next) => {
	try {
		console.log(req.params.id + " " + req.body)
		const group = await groupService.removeUserFromGroup(req.params.groupId, req.params.userId)
		res.json(group)
	} catch (err) {
		next(err)
	}
}

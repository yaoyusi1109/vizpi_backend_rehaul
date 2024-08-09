const sessionService = require("../services/sessionService")
const eventService = require("../services/eventService")
const chatService = require("../services/chatService")
const gptService = require("../services/gptService")
const topicAnalysisService = require("../services/topicAnalysisService")
const { getGroupBySessionId } = require("../services/groupService")

exports.list = async (req, res, next) => {
	try {
		const sessions = await sessionService.list()
		res.json({ sessions: sessions })
	} catch (err) {
		next(err)
	}
}

exports.createSession = async (req, res, next) => {
	try {
		const session = await sessionService.createSession(req.body.session)
		eventService.createEvent({
			session_id: session.id,
			event: eventService.eventType.SESSION_CREATED,
			description: "created"
		})
		res.json({ session: session })
	} catch (err) {
		next(err)
	}
}

exports.getSessionById = async (req, res, next) => {
	try {
		const session = await sessionService.getSessionById(req.params.id)
		res.json({ session: session })
	} catch (err) {
		next(err)
	}
}

exports.getSessionsByIds = async (req, res, next) => {
	try {
		const sessions = await sessionService.getSessionsByIds(req.body.ids)
		res.json(sessions)
	} catch (err) {
		next(err)
	}
}

exports.updateSession = async (req, res, next) => {
	try {
		const session = await sessionService.updateSession(
			req.params.id,
			req.body.session
		)
		res.json({ session: session })
	} catch (err) {
		next(err)
	}
}

exports.deleteSession = async (req, res, next) => {
	try {
		const session = await sessionService.deleteSession(req.params.id)
		eventService.createEvent({
			session_id: req.params.id,
			event: eventService.eventType.SESSION_DELETED,
			description: "deleted"
		})
		res.json({ session: session })
	} catch (err) {
		next(err)
	}
}

exports.register = async (req, res, next) => {
	try {
		const user = await sessionService.register(req.params.id, req.body.user)
		res.json({ user: user })
	} catch (err) {
		next(err)
	}
}

exports.getGroups = async (req, res, next) => {
	try {
		const groups = await sessionService.getGroups(req.params.id)
		res.json({ groups: groups })
	} catch (err) {
		next(err)
	}
}

exports.deleteGroups = async (req, res, next) => {
	try {
		const count = await sessionService.deleteGroups(req.params.id)
		eventService.createEvent({
			session_id: req.params.id,
			event: eventService.eventType.SESSION_GROUPS_REMOVED,
			description: "all groups removed"
		})
		res.json({ count: count })
	} catch (err) {
		next(err)
	}
}

exports.grouping = async (req, res, next) => {
	try {
		const groups = await sessionService.grouping(req.params.id, req.body.type, 3)
		eventService.createEvent({
			session_id: req.params.id,
			event: eventService.eventType.SESSION_GROUPED,
			description: "type " + req.body.type
		})
		res.json({ groups: groups })
	} catch (err) {
		next(err)
	}
}
exports.groupManual = async (req, res, next) => {
	try {
		const groups = await sessionService.groupManual(
			req.params.id,
			req.body.ids,
			req.body.name
		)
		res.json({ groups: groups })
	} catch (err) {
		next(err)
	}
}

exports.lateGroup = async (req, res, next) => {
	try {
		const groups = await sessionService.lateGroup(req.params.id, req.body.id)
		res.json({ groups: groups })
	} catch (err) {
		next(err)
	}
}

exports.getSubmissions = async (req, res, next) => {
	try {
		const submissions = await sessionService.getSubmissions(req.params.id)
		res.json({ submissions: submissions })
	} catch (err) {
		next(err)
	}
}

exports.duplicateSession = async (req, res, next) => {
	try {
		const session = await sessionService.duplicateSession(
			req.params.id,
			req.body.subject
		)
		eventService.createEvent({
			session_id: session.id,
			event: eventService.eventType.SESSION_CREATED,
			description: "duplicated"
		})
		res.json({ session: session })
	} catch (err) {
		next(err)
	}
}

exports.getCodesByTarget = async (req, res, next) => {
	try {
		const codes = await sessionService.getCodesByTarget(
			req.params.id,
			req.body.target
		)
		res.json({ codes: codes })
	} catch (err) {
		next(err)
	}
}

exports.getTaskByCreaterId = async (req, res, next) => {
	try {
		const tasks = await sessionService.getTaskByCreaterId(req.params.createrId)
		res.json({ tasks: tasks })
	} catch (err) {
		next(err)
	}
}

//old version
// exports.regrouping = async (req, res, next) => {
//   try {
//     const groups = await sessionService.regrouping(req.params.id, req.body.baseGroupSize, req.body.round)
//     res.json({ groups: groups })
//   } catch (err) {
//     next(err)
//   }
// }

//dynamic regrouping
exports.regrouping = async (req, res, next) => {
	try {
		const groups = await sessionService.regrouping(req.params.id, req.body.baseGroupSize, req.body.round)
		eventService.createEvent({
			session_id: req.params.id,
			event: eventService.eventType.SESSION_REGROUPED,
			description: "round " + req.body.round
		})
		res.json({ groups: groups })
	} catch (err) {
		next(err)
	}
}

exports.getSummary = async (req, res, next) => {
	try {
		const info = await sessionService.getSummary(req.params.id)
		res.json(info)
	} catch (err) {
		next(err)
	}
}


exports.IncrementStuNumInSession = async (req, res, next) => {
	try {
		const num = await sessionService.IncrementStuNumInSession(req.params.id)
		res.json({ num: num })
	} catch (err) {
		next(err)
	}
}

exports.getAllTopicsInSession = async (req, res, next) => {
	try {
		const topics = await sessionService.getAllTopicsInSession(req.params.id)
		res.json(topics)
	} catch (err) {
		next(err)
	}
}

const mergeTopics = (oldTopics, newTopics) => {
	const mergedTopics = [...oldTopics]
	console.log(oldTopics)
	newTopics.forEach(newTopic => {
		const existingTopic = mergedTopics.find(topic => topic.topic === newTopic.topic)
		if (existingTopic) {
			console.log(existingTopic)
			existingTopic.dialogs.push(...newTopic.dialogs)
		} else {
			mergedTopics.push(newTopic)
		}
	})

	return mergedTopics
}

exports.renewAllTopicsInSession = async (req, res, next) => {
	try {
		const groups = await getGroupBySessionId(req.params.id)
		// console.log(groups)
		const groupIds = groups.map((group) => group.id)
		const updatedGroups = {}

		await Promise.all(groupIds.map(async (groupId) => {
			try {
				const messages = await chatService.getMessagesByGroup(groupId)
				let latestTopics = await topicAnalysisService.getTopicAnalysisByGroup(groupId)
				// console.log(latestTopic.created_at > messages[messages.length - 1].created_time)

				if (latestTopics && latestTopics.created_at > messages[messages.length - 1].created_time) {
					return
				}
				// console.log(latestTopics)
				let oldTopics
				let newMessages
				if (latestTopics) {
					newMessages = messages.filter((message) => message.created_time > latestTopics.created_at)
				} else {
					latestTopics = {
						metadata: []
					}
					newMessages = messages
				}

				// console.log(newMessages)
				const newTopics = await gptService.analyzeNewMessages(newMessages, latestTopics.metadata)
				console.log(newTopics)

				await topicAnalysisService.createTopicAnalysis({
					session_id: req.params.id,
					group_id: groupId,
					metadata: newTopics,
					type: "MESSAGE_TOPICS"
				})

				updatedGroups[groupId] = newTopics
			} catch (error) {
				console.log(error)
			}
		}))

		res.json(updatedGroups)
	} catch (err) {
		next(err)
		res.status(500).json({ message: err.message })
	}
}

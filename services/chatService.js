const sequelize = require("../postgre/db")
const { Op } = require("sequelize")
const initModels = require("../models/init-models")

const Message = initModels(sequelize).message
const Group = initModels(sequelize).group
const User = initModels(sequelize).user

exports.sendMessage = async (messageReq) => {
	const { group_id, sender_id, session_id, content, recipient_id, keystrokes } = messageReq

	const messageCount = await Message.max('id')
	let currentId = messageCount + 1

	const messageData = {
		id: currentId,
		group_id,
		sender_id,
		session_id,
		recipient_id,
		content,
		created_time: new Date(),
		code_id: null,
		keystrokes,
		question_type : null
	}

	try {
		const messages = await Message.create(messageData)
		if (group_id !== -4) {
			const group = await Group.findByPk(group_id)
			if ((!messages || messages.length == 0) && group.progress.conversation !== 0) {
				group.progress = { ...group.progress, conversation: 0 }
				await group.save({ fields: ['passrate'] })
			} else if (group.progress.conversation !== 100) {
				group.progress = { ...group.progress, conversation: 100 }
				await group.save({ fields: ['passrate'] })
			}
		}
		return messages
	} catch (err) {
		console.log(err)
		return err
	}
}

// exports.getMessagesByGroup = async (groupId) => {
// 	try {
// 		return await Message.findAll({
// 			where: {
// 				[Op.and]: [{ [Op.or]: [{ group_id: groupId }, { group_id: null }] }],
// 			},
// 			order: [["created_time", "ASC"]],
// 		})
// 	} catch (err) {
// 		console.log(err)
// 		throw err
// 	}
// }

exports.getMessagesByGroup = async (groupId) => {
	try {
		const messages = await Message.findAll({
			where: {
				[Op.or]: [{ group_id: groupId }, { group_id: null }],
			},
			order: [["created_time", "ASC"]],
		})

		const senderIds = [...new Set(messages.map(message => message.sender_id))]

		const users = await User.findAll({
			where: {
				id: senderIds,
			}
		})

		const usersMap = users.reduce((acc, user) => {
			acc[user.id] = user
			return acc
		}, {})

		messages.forEach(message => {
			message.dataValues.sender = usersMap[message.sender_id].first_name || null
		})

		return messages
	} catch (err) {
		console.log(err)
		throw err
	}
}

exports.getMessagesBySession = async (sessionId) => {
	try {
		return await Message.findAll({
			where: {
				[Op.and]: [{ [Op.or]: [{ session_id: sessionId }] }],
			},
			order: [["created_time", "ASC"]],
		})
	} catch (err) {
		console.log(err)
		throw err
	}
}

exports.getMessagesByGroupAndRecipent = async (groupId, userId) => {
	try {
		return await Message.findAll({
			where: {
				[Op.and]: [
					{ [Op.or]: [{ recipient_id: userId }, { recipient_id: null }, { recipient_id: -1 }] },
					{ [Op.or]: [{ group_id: groupId }, { group_id: null }, { group_id: -1 }] },
				],
			},
			order: [["created_time", "ASC"]],
		})
	} catch (err) {
		console.log(err)
		throw err
	}
}

exports.updateReaction = async (messageId, reaction) => {
	try {
		const message = await Message.findByPk(messageId)
		if (!message) {
			throw new Error('Message not found')
		}
		let reactions = message.reactions
		if (!reactions) reactions = {}
		reactions[reaction.by] = reaction.emoji
		message.reactions = { ...reactions }
		message.changed('reactions', true)
		await message.save({ fields: ['reactions'] })

		console.log(message)
		return message
	} catch (err) {
		console.log(err)
		throw err
	}
}

exports.getAIMessagesByUser = async (userId) => {
	try {
		return await Message.findAll({
			where: {
				[Op.and]: [
					{ [Op.or]: [{ sender_id: userId }, { sender_id: -4 }] },
					{ [Op.or]: [{ recipient_id: userId }, { recipient_id: -4 }] },
				],
			},
			order: [["created_time", "ASC"]],
		})
	} catch (err) {
		console.log(err)
		throw err
	}
}
exports.updateMessageType = async (messageId, question_type) => {
	try {
		const message = await Message.findByPk(messageId)
		if (!message) {
			throw new Error('Message not found')
		}
		message.question_type = question_type
		message.changed('question_type', true)
		await message.save({ fields: ['question_type'] })

		return message
	} catch (err) {
		console.log(err)
		throw err
	}
}
const sequelize = require("../postgre/db")
const { Op } = require("sequelize")
const initModels = require("../models/init-models")
const group = require("../models/group")
const { Session } = require("express-session")

const User = initModels(sequelize).user
const Group = initModels(sequelize).group
const Sessions = initModels(sequelize).session
const Message = initModels(sequelize).message

exports.getGroupById = async (groupId) => {
	try {
		let group = await Group.findByPk(groupId)
		let sessionId = group.session_id
		let messages = await Message.findAll({
			where: {
				[Op.and]: [
					{ session_id: sessionId },
					{ [Op.or]: [{ group_id: groupId }, { group_id: -1 }] },
				]
			},
			order: [["created_time", "ASC"]],
		})
		if (!group) {
			throw new Error("Group not found")
		}
		group.dataValues.messages = messages
		return group
	} catch (err) {
		console.log(err)
		return err
	}
}

exports.getGroupBySessionId = async (sessionId) => {
	try {
		const group = await Group.findAll({
			where: {
				session_id: sessionId,
			},
		})
		if (!group) {
			throw new Error("Group not found")
		}
		return group
	} catch (err) {
		console.log(err)
	}
}

exports.getGroupByUser = async (userId, sessionId) => {
	try {
		let group = await Group.findOne({
			where: {
				user_ids: {
					[Op.contains]: [userId],
				},
				session_id: sessionId,
			},
		})
		if (!group) {
			throw new Error("Group not found")
		}

		let messages = await Message.findAll({
			where: {
				group_id: group.id,
			},
			order: [["created_time", "ASC"]],
		})
		group.dataValues.messages = messages
		return group
	} catch (err) {
		console.error(err)
		throw err
	}
}

exports.getGroupsByUser = async (userId) => {
	try {
		let group = await Group.findAll({
			where: {
				user_ids: {
					[Op.contains]: [userId],
				},
				session_id: sessionId,
			},
		})

		if (!group) {
			throw new Error("Group not found")
		} else {
			group = group.dataValues
		}
		const sessionId = group.session_id
		const messages = await Message.findAll({
			where: {
				[Op.and]: [
					{ session_id: sessionId },
					{ [Op.or]: [{ recipient_id: userId }, { recipient_id: null }, { recipient_id: -1 }] },
					{ [Op.or]: [{ group_id: group.id }, { group_id: null }, { group_id: -1 }] },
				],
			},
			order: [["created_time", "ASC"]],
		})
		group.messages = messages
		return group
	} catch (err) {
		console.error(err)
		throw err
	}
}


exports.getAllUsers = async (groupId) => {
	try {
		const group = await Group.findByPk(groupId)
		if (!group || !group.user_ids) {
			throw new Error("Group not found or no user IDs available")
		}
		const users = await User.findAll({
			where: {
				id: {
					[Op.in]: group.user_ids,
				},
			},
		})
		return users
	} catch (err) {
		console.log(err)
		throw err
	}
}

exports.removeGroupsBySessionId = async (sessionId) => {
	const groups = await Group.findAll({
		where: { session_id: sessionId },
	})

	if (groups.length === 0) return false
	const transaction = await sequelize.transaction()
	try {
		const groups = await Group.findAll({
			where: {
				session_id: sessionId,
			},
			transaction,
		})
		const groupIds = await groups.map((group) => group.id)
		if (groupIds.length > 0) {
			await User.update(
				{
					group_id: null,
				},
				{ where: { group_id: { [Op.in]: groupIds } }, transaction }
			)
		} else {
			await transaction.rollback()
			return false
		}

		await Group.destroy({
			where: { id: { [Op.in]: groupIds } },
			transaction,
		})

		await Sessions.update(
			{
				grouped: false,
			},
			{ where: { id: sessionId } }
		)
		await transaction.commit()
		return true
	} catch (err) {
		if (transaction) await transaction.rollback()
		console.log(err)
		throw err
	}
}

exports.updateGroup = async (id, group) => {
	try {
		const updatedGroup = await Group.update(group, {
			where: { id },
			returning: true,
		})
		return updatedGroup
	} catch (err) {
		console.log(err)
	}
}

exports.addUserToGroup = async (sessionId, groupNum, userId) => {
	try {
		const group = await Group.findOne({
			where: {
				session_id: sessionId,
				name: `Group ${groupNum}`,
			},
		})
		if (!group) {
			return await Group.create({
				session_id: sessionId,
				name: `Group ${groupNum}`,
				user_ids: [userId],
				group_round: 1,
				group_type: "MANUAL",
			})
		} else {
			await group.update({
				user_ids: sequelize.fn(
					"array_append",
					sequelize.col("user_ids"),
					userId
				),
			})
			return group
		}
	} catch (err) {
		console.log(err)
		throw err
	}
}

exports.removeUserFromGroup = async (groupId, userId) => {
	try {
		const group = await Group.findOne({
			where: {
				id: groupId,
			},
		})
		if (!group) {
			throw new Error("Group not found")
		} else {
			await group.update({
				user_ids: sequelize.fn(
					"array_remove",
					sequelize.col("user_ids"),
					userId
				),
			})
			console.log(`User ${userId} removed from group ${groupId}`)
			return group
		}
	} catch (err) {
		console.log(err)
		throw err
	}
}

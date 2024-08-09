const sequelize = require("../postgre/db")
const initModels = require("../models/init-models")
const { get } = require("../routes/chatRoute")
const Group = initModels(sequelize).group
const Session = initModels(sequelize).session
const User = initModels(sequelize).user
const Instructor = initModels(sequelize).instructor
const Submission = initModels(sequelize).submission
const Message = initModels(sequelize).message
const Code = initModels(sequelize).code
const groupLogit = require("../general/groupLogit")
const group = require("../models/group")
const { groupAllByPassrate, regrouping, initialGroupByPassrateAndCodeWithRandom, regroupingV2 } = require("../general/groupLogit")
const { Op, Sequelize } = require("sequelize")
const TopicAnalysis = initModels(sequelize).topicAnalysis

exports.list = async () => {
	try {
		return await Session.findAll()
	} catch (err) {
		console.log(err)
		throw err
	}
}

exports.createSession = async (session) => {
	try {
		session.round = 0
		session = await Session.create(session)
		Instructor.update(
			{
				session_list: sequelize.fn(
					"array_append",
					sequelize.col("session_list"),
					session.id
				),
			},
			{
				where: {
					id: session.creater_id,
				},
			}
		)
		return session
	} catch (err) {
		console.log(err)
	}
}

exports.getSessionById = async (id) => {
	try {
		let session = await Session.findByPk(id)
		let instructor = await Instructor.findByPk(session.creater_id)
		instructor.password = undefined
		session.dataValues.instructor = instructor
		return session
	} catch (err) {
		console.log(err)
	}
}

exports.getSessionsByIds = async (ids) => {
	try {
		return await Session.findAll({
			where: {
				id: ids,
			},
		})
	} catch (err) {
		console.log(err)
	}
}

exports.updateSession = async (id, session) => {
	try {
		const updatedSession = await Session.update(session, {
			where: { id },
			returning: true,
		})
		return updatedSession
	} catch (err) {
		console.log(err)
	}
}

exports.deleteSession = async (sessionId) => {
	try {
		const session = await Session.findByPk(sessionId)
		const creater_id = session.creater_id

		const result = await sequelize.transaction(async (t) => {
			await Session.destroy({
				where: { id: sessionId },
				transaction: t,
			})

			await Group.destroy({
				where: { session_id: sessionId },
				transaction: t,
			})

			await Instructor.update(
				{
					session_list: sequelize.fn(
						"array_remove",
						sequelize.col("session_list"),
						sessionId
					),
				},
				{
					where: {
						id: creater_id,
					},
					transaction: t,
				}
			)

			return { success: true }
		})

		return result
	} catch (err) {
		console.log(err)
		throw err
	}
}

exports.register = async (sessionId, userData) => {
	try {
		return await sequelize.transaction(async (t) => {
			const user = await User.create(userData, { transaction: t })
			await Session.increment("stu_num", {
				where: {
					id: sessionId,
				},
				transaction: t,
			})
			return user
		})
	} catch (err) {
		console.log(err)
		throw err
	}
}

exports.getGroups = async (sessionId) => {
	try {
		let session = await Session.findByPk(sessionId)
		const groupRound = session.group_round == null ? 1 : session.group_round
		let messages = await Message.findAll({
			where: {
				session_id: sessionId,
			},
			order: [["created_time", "ASC"]],
		})

		let groups
		if (groupRound === 2) {
			groups = await Group.findAll({
				where: {
					session_id: sessionId,
					group_round: 2,
				},
			})
		} else {
			groups = await Group.findAll({
				where: {
					session_id: sessionId,
				},
			})
		}

		groups.forEach((group) => {
			group.dataValues.messages = []
		})

		messages.forEach((message) => {
			let group = groups.find((group) => group.id === message.group_id)
			if (group) {
				group.dataValues.messages.push(message)
			}
		})
		return groups
	} catch (err) {
		console.log(err)
		throw err
	}
}

exports.deleteGroups = async (sessionId) => {
	try {
		return await Group.destroy({
			where: {
				session_id: sessionId,
			},
		})
	} catch (err) {
		console.log(err)
		throw err
	}
}

exports.groupManual = async (sessionId, groupUserIds, groupName) => {
	console.log(sessionId)
	console.log(groupUserIds)
	const users = await User.findAll({ where: { id: groupUserIds } })
	if (users.length === 0) return false
	await sequelize.transaction(async (transaction) => {
		await Group.create(
			{
				session_id: sessionId,
				user_ids: groupUserIds,
				name: groupName,
			},
			{ transaction }
		)
	})
	return true
}

exports.lateGroup = async (sessionId, userId) => {
	console.log(sessionId)
	console.log(userId)
	let sessionGroups = await Group.findAll({ where: { session_id: sessionId } })
	let result = sessionGroups.reduce((minIndex, group, currIndex) => sessionGroups[currIndex].user_ids.length < sessionGroups[minIndex].user_ids.length ? currIndex : minIndex, 0)
	console.log(sessionGroups)
	console.log(sessionGroups[result])
	await sequelize.transaction(async (transaction) => {

		await Group.update(
			{
				user_ids: sequelize.fn(
					"array_append",
					sequelize.col("user_ids"),
					userId
				),
			},
			{
				where: {
					id: sessionGroups[result].id,
				},
				transaction: transaction,
			}
		)
		await User.update(
			{ group_id: sessionGroups[result].id },
			{
				where: {
					id: userId
				},
				transaction
			}
		)

	})
	return sessionGroups[result].id
}

exports.groupAllByPassrate = async (sessionId, baseGroupSize) => {
	if (baseGroupSize <= 0) return false

	const session = await Session.findByPk(sessionId)
	let prefix = ""
	if (session.grouped === true) {
		prefix = "#2 "
	}

	const users = await User.findAll({ where: { session_id: sessionId } })
	if (users.length === 0) return false

	const groupsInfo = distributeUsersIntoGroups(users.length, baseGroupSize)

	let currentGroupCount =
		(await Group.count({
			where: { session_id: sessionId },
		})) + 1

	await sequelize.transaction(async (transaction) => {
		for (const groupInfo of groupsInfo) {
			const groupUserIds = users
				.slice(0, groupInfo.size)
				.map((user) => user.id)

			users.splice(0, groupInfo.size)

			const newGroup = await Group.create(
				{
					session_id: sessionId,
					user_ids: groupUserIds,
					name: `${prefix}Group ${groupInfo.groupId}`,
					group_round: 1,
				},
				{ transaction }
			)

			await User.update(
				{ group_id: newGroup.id },
				{
					where: {
						id: groupUserIds,
					},
					transaction,
				}
			)
			currentGroupCount++
		}
	})

	await Session.update({ grouped: true }, { where: { id: sessionId } })
	return true
}

exports.grouping = async (sessionId, type, groupSize) => {
	if (type == "RANDOM") {
		return groupLogit.groupAllRandomly(sessionId, groupSize)
	} else {
		return initialGroupByPassrateAndCodeWithRandom(sessionId, groupSize)
	}
}

function distributeUsersIntoGroups (totalUsers, baseGroupSize) {
	let fullGroupCount = Math.floor(totalUsers / baseGroupSize)
	let remainder = totalUsers % baseGroupSize

	if (remainder > 0 && fullGroupCount > 0) {
		remainder += baseGroupSize * fullGroupCount
		fullGroupCount -= 1
	}

	const groups = []
	for (let i = 0; i < fullGroupCount; i++) {
		groups.push(baseGroupSize)
	}

	if (remainder > 0) {
		groups.push(remainder)
	}

	return groups.map((size, index) => ({ groupId: index + 1, size }))
}

exports.getSubmissions = async (sessionId) => {
	try {
		const [results, metadata] = await sequelize.query(
			`
      SELECT s1.*
      FROM submission AS s1
      JOIN (
        SELECT user_id, MAX(created_time) AS max_created_time
        FROM submission
        WHERE session_id = :sessionId
        GROUP BY user_id
      ) AS s2 ON s1.user_id = s2.user_id AND s1.created_time = s2.max_created_time
      WHERE s1.session_id = :sessionId
    `,
			{
				replacements: { sessionId: sessionId },
			}
		)

		return results
	} catch (err) {
		console.error(err)
	}
}

exports.duplicateSession = async (sessionId, newSubject) => {
	let newSession = await this.getSessionById(sessionId)
	newSession = newSession.toJSON()
	if (!newSession) throw new Error("Session not found")
	newSession.enable_chat = false
	newSession.grouped = false
	newSession.group_round = 0
	newSession.stu_num = 0
	newSession.url = null
	newSession.subject = newSubject
	delete newSession.created_time
	delete newSession.id
	newSession = await this.createSession(newSession)
	return newSession
}

exports.getCodesByTarget = async (sessionId, target) => {
	try {
		const query = `
		WITH RelevantUsers AS (
				SELECT id AS user_id
				FROM "user"
				WHERE session_id = :sessionId
		),
		LatestCodes AS (
				SELECT c.creater_id, c.id, c.content, c.created_time,
				ROW_NUMBER() OVER(PARTITION BY c.creater_id ORDER BY c.created_time DESC) AS rn
				FROM code c
				INNER JOIN RelevantUsers u ON c.creater_id = u.user_id
				WHERE c.content LIKE '%' || :target || '%'
		)
		SELECT creater_id, id, content, created_time
		FROM LatestCodes
		WHERE rn = 1
`
		return await sequelize.query(query, {
			replacements: { sessionId: sessionId, target: target },
			type: sequelize.QueryTypes.SELECT,
		})
	} catch (err) {
		console.error(err)
	}
}

exports.getTaskByCreaterId = async (createrId) => {
	try {
		const tasks = await Session.findAll({
			where: {
				creater_id: createrId,
			},
			attributes: ["task"],
		})
		return tasks.map((task) => task.task)
	} catch (err) {
		console.error(err)
		throw err
	}
}

const getAllRank = async (sessionId) => {
	// Get all user IDs in the session
	let user_ids = await User.findAll({
		where: {
			session_id: sessionId,
		},
		attributes: ["id"],
	})
	user_ids = user_ids.map((user) => user.id)
	// Get frequency of messages sent by each user
	const results = await sequelize.query(
		`
		SELECT sender_id, COUNT(*) AS message_count
		FROM message
		WHERE session_id = :sessionId
		GROUP BY sender_id
		ORDER BY message_count DESC
	`,
		{
			replacements: { sessionId: sessionId },
			type: sequelize.QueryTypes.SELECT,
		}
	)
	let countsByUserId = new Map(
		results.map((result) => [result.sender_id, result.message_count])
	)
	countsByUserId = user_ids.map((userId) => {
		return {
			userId: userId,
			messageCount: countsByUserId.get(userId) || 0,
		}
	})
	// Get passrate of each user
	const results2 = await sequelize.query(
		`
		SELECT DISTINCT ON (user_id) user_id, result_list
		FROM Submission
		WHERE session_id = :sessionId
		ORDER BY user_id, created_time DESC
	`,
		{
			replacements: { sessionId: sessionId },
			type: sequelize.QueryTypes.SELECT,
		}
	)
	let passratesByUserId = new Map(
		results2.map((result) => [
			result.user_id,
			getPassratePercent(result.result_list),
		])
	)
	passratesByUserId = user_ids.map((userId) => {
		return {
			userId: userId,
			passrate: passratesByUserId.get(userId) || 0,
		}
	})
	return {
		countsByUserId: countsByUserId,
		passratesByUserId: passratesByUserId,
	}
}

const getFinalRank = (countsByUserId, passratesByUserId) => {
	let rankOfMessageCount = countsByUserId
		.sort((a, b) => b.messageCount - a.messageCount)
		.map((user, index) => [user.userId, index])
	let rankOfPassrate = passratesByUserId
		.sort((a, b) => b.passrate - a.passrate)
		.map((user, index) => [user.userId, index])

	const messageRankMap = new Map(rankOfMessageCount)
	const passrateRankMap = new Map(rankOfPassrate)

	const averageRankMap = new Map()

	const allUserIds = new Set([
		...messageRankMap.keys(),
		...passrateRankMap.keys(),
	])

	allUserIds.forEach((userId) => {
		const messageRank = messageRankMap.get(userId) || 0
		const passrateRank = passrateRankMap.get(userId) || 0
		const averageRank = (messageRank + passrateRank) / 2
		averageRankMap.set(userId, averageRank)
	})

	const sortedAverageRank = Array.from(averageRankMap.entries()).sort(
		(a, b) => a[1] - b[1]
	)

	const finalRanking = new Map(
		sortedAverageRank.map((item, index) => [item[0], index])
	)

	return finalRanking
}

const getPassratePercent = (resultList) => {
	let passCount = 0
	resultList.forEach((result) => {
		if (result) passCount++
	})
	return (passCount / resultList.length) * 100
}

const getGroupsRanking = async (sessionId, finalRank) => {
	let groups = await this.getGroups(sessionId)
	groups.map((group) => {
		group.score = 0
		group.user_ids.forEach((userId) => {
			group.score += finalRank.get(userId)
		})
	})
	groups.sort((a, b) => a.score - b.score)
	groups.map((group, index) => {
		group.rank = index
	})
	return groups
}

const getGroupPopulations = (groupsRanking, numOfPopulations) => {
	let representativeGroups = []
	let i, j
	for (i = 0; i < numOfPopulations; i++) {
		representativeGroups[i] = []
	}
	for (i = 0; i < groupsRanking.length; i++) {
		representativeGroups[i % numOfPopulations].push(groupsRanking[i])
	}
	return representativeGroups
}

const generateGroups = (groupPopulation, groupSize, ranking) => {
	const groupUserIds = groupPopulation.map((group) => group.user_ids).flat()
	groupUserIds.sort((a, b) => ranking.get(a) - ranking.get(b))
	const groups = []
	const groupNum = Math.floor(groupUserIds.length / groupSize)
	for (let i = 0; i < groupNum; i++) {
		groups.push([])
	}
	let reverse = false
	for (let i = 0; i < groupUserIds.length; i++) {
		const groupId = reverse ? groupNum - 1 - (i % groupNum) : i % groupNum
		groups[groupId].push(groupUserIds[i])
		if ((i + 1) % groupNum === 0) {
			reverse = !reverse
		}
	}
	return groups
}

exports.getTaskByCreaterId = async (createrId) => {
	try {
		const tasks = await Session.findAll({
			where: {
				creater_id: createrId,
			},
			attributes: ["task"],
		})
		return tasks.map((task) => task.task)
	} catch (err) {
		console.error(err)
		throw err
	}
}

exports.getCodes = async (sessionId) => {
	let userIds = await this.getUsers(sessionId)
	userIds = userIds.map((user) => user.id)
	try {
		return await Code.findAll({
			where: {
				creater_id: userIds,
			},
		})
	} catch (err) {
		console.error(err)
		throw err
	}
}

exports.getUsers = async (sessionId) => {
	try {
		return await User.findAll({
			where: {
				session_id: sessionId,
			},
		})
	} catch (err) {
		console.error(err)
		throw err
	}
}

exports.getSummary = async (sessionId) => {
	const session = await this.getSessionById(sessionId)
	const groups = await this.getGroups(sessionId)
	const submissions = await this.getSubmissions(sessionId)
	const codes = await this.getCodes(sessionId)
	const users = await this.getUsers(sessionId)

	return {
		session: session,
		groups: groups,
		submissions: submissions,
		codes: codes,
		users: users,
	}
}


exports.IncrementStuNumInSession = async (sessionId) => {
	try {
		return await sequelize.transaction(async (t) => {
			await Session.increment("stu_num", {
				where: {
					id: sessionId,
				},
				transaction: t,
			})
			return true
		})
	} catch (err) {
		console.log(err)
    throw err
	}
}

exports.getAllTopicsInSession = async (sessionId) => {
	try {
		const latestTopics = await TopicAnalysis.findAll({
			where: {
				session_id: sessionId,
			},
			attributes: [
				[Sequelize.fn('MAX', Sequelize.col('id')), 'id'],
				'group_id'
			],
			group: ['group_id'],
			raw: true
		})

		const latestTopicIds = latestTopics.map(topic => topic.id)

		const topics = await TopicAnalysis.findAll({
			where: {
				id: {
					[Op.in]: latestTopicIds
				}
			}
		})
		const res = {}

		topics.forEach(topic => {
			const groupId = topic.group_id
			if (!topic.metadata || topic.metadata.length === 0)
				return
			const topicNames = topic.metadata.map(data => data.topic)

			if (groupId && topicNames) {
				res[groupId] = topicNames
			}
		})

		return res
	} catch (err) {
		console.error(err)
		throw err
	}
}


exports.regrouping = regrouping

exports.initialGroupByPassrateAndCodeWithRandom = initialGroupByPassrateAndCodeWithRandom

exports.regroupingV2 = regroupingV2

const sequelize = require("../postgre/db")
const initModels = require("../models/init-models")

const Group = initModels(sequelize).group
const User = initModels(sequelize).user
const Session = initModels(sequelize).session
const Message = initModels(sequelize).message
const Code = initModels(sequelize).code

const { OpenAIEmbeddings } = require("@langchain/openai")

const getEmbeddings = () => {
  return new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    batchSize: 512, // Default value if omitted is 512. Max is 2048
    model: "text-embedding-3-large",
  })
}

const getUsersCodes = async (userIds) => {
  let codeIds = await User.findAll({
    where: {
      id: userIds
    },
    attributes: ["code_id"]
  })
  let codes = await Code.findAll({
    where: {
      id: codeIds.map(code => code.code_id)
    }
  })
  let codeByUserId = codes.map(code => {
    return {
      userId: code.creater_id,
      code: code.content
    }
  })
  return codeByUserId
}


const getGroups = async (sessionId) => {
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

    groups.forEach(group => {
      group.dataValues.messages = []
    })

    messages.forEach(message => {
      let group = groups.find(group => group.id === message.group_id)
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

const getAllRank = async (sessionId) => {
  // Get all user IDs in the session
  let user_ids = await User.findAll({
    where: {
      session_id: sessionId
    },
    attributes: ["id"]
  })
  user_ids = user_ids.map(user => user.id)
  // Get frequency of messages sent by each user
  const results = await sequelize.query(`
		SELECT sender_id, COUNT(*) AS message_count
		FROM message
		WHERE session_id = :sessionId
		GROUP BY sender_id
		ORDER BY message_count DESC
	`, {
    replacements: { sessionId: sessionId },
    type: sequelize.QueryTypes.SELECT
  })
  let countsByUserId = new Map(results.map(result => [result.sender_id, result.message_count]))
  countsByUserId = user_ids.map(userId => {
    return {
      userId: userId,
      messageCount: countsByUserId.get(userId) || 0
    }
  })
  // Get passrate of each user
  const results2 = await sequelize.query(`
		SELECT DISTINCT ON (user_id) user_id, result_list
		FROM Submission
		WHERE session_id = :sessionId
		ORDER BY user_id, created_time DESC
	`, {
    replacements: { sessionId: sessionId },
    type: sequelize.QueryTypes.SELECT
  })
  // console.log(results2)
  let passratesByUserId = new Map(results2.map(result => [result.user_id, getPassratePercent(result.result_list)]))
  passratesByUserId = user_ids.map(userId => {
    return {
      userId: userId,
      passrate: passratesByUserId.get(userId) || 0
    }
  })
  return {
    countsByUserId: countsByUserId,
    passratesByUserId: passratesByUserId
  }
}


const getFinalRank = (countsByUserId, passratesByUserId) => {
  let rankOfMessageCount = countsByUserId.sort((a, b) => b.messageCount - a.messageCount).map((user, index) => [user.userId, index])
  let rankOfPassrate = passratesByUserId.sort((a, b) => b.passrate - a.passrate).map((user, index) => [user.userId, index])

  const messageRankMap = new Map(rankOfMessageCount)
  const passrateRankMap = new Map(rankOfPassrate)

  const averageRankMap = new Map()

  const allUserIds = new Set([...messageRankMap.keys(), ...passrateRankMap.keys()])

  allUserIds.forEach(userId => {
    const messageRank = messageRankMap.get(userId) || 0
    const passrateRank = passrateRankMap.get(userId) || 0
    const averageRank = (messageRank + passrateRank) / 2
    averageRankMap.set(userId, averageRank)
  })

  const sortedAverageRank = Array.from(averageRankMap.entries()).sort((a, b) => a[1] - b[1])

  const finalRanking = new Map(sortedAverageRank.map((item, index) => [item[0], index]))

  return finalRanking
}

const getPassratePercent = (resultList) => {
  if (resultList === null || resultList.length === 0) return 0
  let passCount = 0
  resultList.forEach(result => {
    if (result) passCount++
  })
  return passCount / resultList.length * 100
}

const getGroupsRanking = async (sessionId, finalRank) => {
  let groups = await getGroups(sessionId)
  groups.map(group => {
    group.score = 0
    group.user_ids.forEach(userId => {
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

const getStudentPopulations = (studentsRanking, numOfPopulations) => {
  let representativeStudents = []
  let i, j
  for (i = 0; i < numOfPopulations; i++) {
    representativeStudents[i] = []
  }
  for (i = 0; i < studentsRanking.length; i++) {
    representativeStudents[i % numOfPopulations].push(studentsRanking[i])
  }
  return representativeStudents
}

const generateGroupsByGP = (groupPopulation, groupSize, ranking) => {
  const groupUserIds = groupPopulation.map(group => group.user_ids).flat()
  return generateGroupsByRank(groupUserIds, groupSize, ranking)
}

const generateGroupsRandomly = (userIds, groupSize) => {
  userIds.sort(() => Math.random() - 0.5)
  const groups = []
  const groupNum = Math.floor(userIds.length / groupSize)
  for (let i = 0; i < groupNum; i++) {
    groups.push([])
  }
  for (let i = 0; i < userIds.length; i++) {
    const groupId = i % groupNum
    groups[groupId].push(userIds[i])
  }
  return groups
}

const getGroupsType = async (sessionId, countsByUserId, passratesByUserId) => {
  let groups = await getGroups(sessionId)
  let threshold = 1000
  if (groups.length < 15) {
    threshold = 2
  }
  else if (groups.length > 15 && groups.length < 33) {
    threshold = 4
  }
  else if (groups.length >= 33) {
    threshold = 6
  }
  let groupByType = { "Well-Performing": [], "Poor-Performing": [], "Stay": [], "Well-Control": [], "Poor-Control": [] }
  let groupInfo = {}
  groups.forEach(group => {
    let passrate = 0
    let messageCount = 0
    let activeUserCount = 0
    group.user_ids.forEach(userId => {
      passrate += passratesByUserId.find(user => user.userId === userId).passrate
      messageCount += countsByUserId.find(user => user.userId === userId).messageCount
      if (countsByUserId.find(user => user.userId === userId).messageCount > 0) {
        activeUserCount += 1
      }
    })
    groupInfo[group.id] = { passrate: passrate / group.user_ids.length, messageCount: messageCount / group.user_ids.length, activeUserCount: activeUserCount }
  })

  groups.forEach(group => {
    if (group.user_ids.length !== 3) {
      groupByType["Stay"].push(group.id)
      delete groupInfo[group.id]
    }
  })

  //process well-performing and delete them from groupInfo
  temp_well_performing = []
  Object.keys(groupInfo).forEach(key => {
    if (groupInfo[key].passrate >= 99 && groupInfo[key].activeUserCount >= 2) {
      temp_well_performing.push(parseInt(key))
    }
    //for test
    // if (groupInfo[key].passrate >= 99) {
    //   temp_well_performing.push(parseInt(key))
    // }
  })
  temp_well_performing.sort((a, b) => groupInfo[b].messageCount - groupInfo[a].messageCount)
  // if (temp_well_performing.length < 6) 
  //   return false;
  for (let i = 0; i < threshold; i++) {
    i % 2 === 0 ? groupByType["Well-Performing"].push(temp_well_performing[i]) : groupByType["Well-Control"].push(temp_well_performing[i])
    delete groupInfo[temp_well_performing[i]]
  }

  //process poor-performing and delete them from groupInfo
  temp_poor_performing = []
  Object.keys(groupInfo).forEach(key => {
    temp_poor_performing.push(parseInt(key))
  })
  temp_poor_performing.sort((a, b) => groupInfo[a].passrate - groupInfo[b].passrate).slice(0, threshold * 2)
  temp_poor_performing.sort((a, b) => groupInfo[b].messageCount - groupInfo[a].messageCount)
  for (let i = 0; i < threshold * 2; i++) {
    i % 2 === 0 ? groupByType["Poor-Performing"].push(temp_poor_performing[i]) : groupByType["Poor-Control"].push(temp_poor_performing[i])
    delete groupInfo[temp_poor_performing[i]]
  }

  //process stay
  Object.keys(groupInfo).forEach(key => {
    groupByType["Stay"].push(parseInt(key))
  })
  return groupByType
}


const generateGroupsByType = async (sessionId, groupSize, groupByType, passratesByUserId, countsByUserId) => {
  let groups = await getGroups(sessionId)
  wellPerformingUserIds = groupByType["Well-Performing"].map(key => groups.find(group => group.id === key).user_ids).flat()
  poorPerformingUserIds = groupByType["Poor-Performing"].map(key => groups.find(group => group.id === key).user_ids).flat()
  poorPerformingUserIds.sort((a, b) => passratesByUserId.find(user => user.userId === a).passrate - passratesByUserId.find(user => user.userId === b).passrate)

  //generate groups by selecting one from front and one from back of the sorted poorPerformingUserIds combined with wellPerformingUserIds
  let newGroups = []
  let i = 0
  let j1 = 0
  let j2 = poorPerformingUserIds.length - 1
  while (i < wellPerformingUserIds.length) {
    let group = []
    group.push(wellPerformingUserIds[i])
    group.push(poorPerformingUserIds[j1])
    group.push(poorPerformingUserIds[j2])
    newGroups.push(group)
    i++
    j1++
    j2--
  }
  return newGroups
}


const generateGroupsByRank = (userIds, groupSize, ranking) => {
  userIds.sort((a, b) => ranking.get(a) - ranking.get(b))
  const groups = []
  const groupNum = Math.floor(userIds.length / groupSize)
  for (let i = 0; i < groupNum; i++) {
    groups.push([])
  }
  let reverse = false
  for (let i = 0; i < userIds.length; i++) {
    const groupId = reverse ? groupNum - 1 - (i % groupNum) : i % groupNum
    groups[groupId].push(userIds[i])
    if ((i + 1) % groupNum === 0) {
      reverse = !reverse
    }
  }
  return groups
}

const generateGroupsByRankAndCode = async (userIds, groupSize, ranking) => {
  userIds.sort((a, b) => ranking.get(a) - ranking.get(b))
  let codeByUserId = await getUsersCodes(userIds)
  //check users with no code
  userIds.forEach(userId => {
    if (!codeByUserId.find(user => user.userId === userId)) {
      codeByUserId.push({
        userId: userId,
        code: "null"
      })
    }
  })
  let groups = []
  //divide users into 3 parts (low,middle,high) by rank
  let usersByParts = [[], [], []]
  let low = Math.floor(userIds.length / 3)
  let high = Math.floor(userIds.length * 2 / 3)
  for (let i = 0; i < userIds.length; i++) {
    if (i < low) {
      usersByParts[0].push(userIds[i])
    } else if (i < high) {
      usersByParts[1].push(userIds[i])
    } else {
      usersByParts[2].push(userIds[i])
    }
  }
  // console.log("codeByUserId", codeByUserId)
  // console.log("usersByParts", usersByParts)
  //get code embeddings
  let embeddings = getEmbeddings()
  let codes = codeByUserId.map(user => user.code)
  let codeEmbeddings = await embeddings.embedDocuments(codes)
  let codeEmbeddingsByUserId = codeByUserId.map((user, index) => {
    return {
      userId: user.userId,
      code: user.code,
      embedding: codeEmbeddings[index]
    }
  })
  // console.log("codeEmbeddingsByUserId", codeEmbeddingsByUserId)
  //get similarity between each user's code
  let similarityMatrix = []
  for (let i = 0; i < codeEmbeddingsByUserId.length; i++) {
    let row = []
    for (let j = 0; j < codeEmbeddingsByUserId.length; j++) {
      row.push(similarity(codeEmbeddingsByUserId[i].embedding, codeEmbeddingsByUserId[j].embedding))
    }
    similarityMatrix.push(row)
  }
  // console.log("similarityMatrix", similarityMatrix)
  //generate group: pick one from high, and two from low and middle with highest similarity
  record_high = usersByParts[2].map(user => user)
  let i = 0
  while (i < usersByParts[2].length) {
    let group = []
    let highUser = usersByParts[2][i]
    let highUserIndex = codeByUserId.findIndex(user => user.userId === highUser)
    let maxSimilarity = -1
    let maxSimilarityIndex = -1
    for (let j = 0; j < usersByParts[0].length; j++) {
      let lowUser = usersByParts[0][j]
      let lowUserIndex = codeByUserId.findIndex(user => user.userId === lowUser)
      if (similarityMatrix[highUserIndex][lowUserIndex] > maxSimilarity) {
        maxSimilarity = similarityMatrix[highUserIndex][lowUserIndex]
        maxSimilarityIndex = j
      }
    }
    // console.log("maxSimilarity 1", maxSimilarityIndex)
    if (maxSimilarityIndex === -1) break
    group.push(highUser)
    record_high.splice(record_high.indexOf(highUser), 1)
    group.push(usersByParts[0][maxSimilarityIndex])
    usersByParts[0].splice(maxSimilarityIndex, 1)
    maxSimilarity = -1
    maxSimilarityIndex = -1
    for (let j = 0; j < usersByParts[1].length; j++) {
      let middleUser = usersByParts[1][j]
      let middleUserIndex = codeByUserId.findIndex(user => user.userId === middleUser)
      if (similarityMatrix[highUserIndex][middleUserIndex] > maxSimilarity) {
        maxSimilarity = similarityMatrix[highUserIndex][middleUserIndex]
        maxSimilarityIndex = j
      }
    }
    // console.log("maxSimilarity 2", maxSimilarityIndex)
    if (maxSimilarityIndex === -1) break
    group.push(usersByParts[1][maxSimilarityIndex])
    usersByParts[1].splice(maxSimilarityIndex, 1)
    groups.push(group)
    i++
  }
  //check if there are still users in low and middle, put them into existing groups
  let remainingUsers = usersByParts[0].concat(usersByParts[1]).concat(record_high)
  for (let j = 0; j < remainingUsers.length; j++) {
    groups[j].push(remainingUsers[j])
  }
  // console.log("groups", groups)
  return groups
}


const setGroups = async (sessionId, groups, type, round, transaction, offset = 0) => {
  for (let i = 0; i < groups.length; i++) {
    let newGroup = await Group.create(
      {
        session_id: sessionId,
        user_ids: groups[i],
        name: `#${round} Group ${i + 1 + offset}`,
        group_round: round,
        group_type: type,
      },
      { transaction }
    )

    await User.update(
      { group_id: newGroup.id },
      {
        where: {
          id: groups[i]
        },
        transaction
      }
    )
  }
}

const regrouping = async (sessionId, groupSize, round) => {
  console.log("regroupingV1", sessionId, groupSize, round)
  const session = await Session.findByPk(sessionId)
  console.log("session", session.regrouping)
  if (session.group_round === 2) return false

  try {
    await Session.update({ regrouping: true }, {
      where: { id: sessionId }
    })
    console.log("regrouping start")
    let { countsByUserId, passratesByUserId } = await getAllRank(sessionId)

    let finalRank = getFinalRank(countsByUserId, passratesByUserId)

    let groupsRanking = await getGroupsRanking(sessionId, finalRank)

    let groupPopulations = getGroupPopulations(groupsRanking, 2)

    gp0 = generateGroupsByGP(groupPopulations[0], groupSize, finalRank)
    unchangedGroups = groupPopulations[1].map(group => group.id)
    // console.log(gp0, unchangedGroups)

    await sequelize.transaction(async (transaction) => {
      await setGroups(sessionId, gp0, "PASSRATE&MESSAGE", 2, transaction)
      await Group.update({
        group_round: 2,
        group_type: "UNCHANGE"
      }, {
        where: {
          id: unchangedGroups
        }, transaction
      })
      await Session.update({
        group_round: 2,
        regrouping: false
      }, {
        where: { id: sessionId }, transaction
      })
    })
    console.log("regrouping end")
    return true
  } catch (err) {
    console.log(err)
    await Session.update({ regrouping: false }, {
      where: { id: sessionId }
    })
    throw err
  }
}


const regroupingV2 = async (sessionId, groupSize, round) => {
  console.log("regroupingV2", sessionId, groupSize, round)
  const session = await Session.findByPk(sessionId)
  console.log("session", session.regrouping)
  if (session.regrouping === 2) return false

  try {
    await Session.update({ regrouping: true }, {
      where: { id: sessionId }
    })
    console.log("regrouping start")
    let { countsByUserId, passratesByUserId } = await getAllRank(sessionId)

    let groupByType = await getGroupsType(sessionId, countsByUserId, passratesByUserId)

    let gp0 = await generateGroupsByType(sessionId, groupSize, groupByType, passratesByUserId, countsByUserId)
    await sequelize.transaction(async (transaction) => {
      await setGroups(sessionId, gp0, "DYNAMIC", 2, transaction)
      await Group.update({
        group_round: 2,
        group_type: "STAY"
      }, {
        where: {
          id: groupByType["Stay"]
        }, transaction
      })
      await Group.update({
        group_round: 2,
        group_type: "Well-Control"
      }, {
        where: {
          id: groupByType["Well-Control"]
        }, transaction
      })
      await Group.update({
        group_round: 2,
        group_type: "Poor-Control"
      }, {
        where: {
          id: groupByType["Poor-Control"]
        }, transaction
      })
      await Session.update({
        group_round: 2,
        regrouping: false
      }, {
        where: { id: sessionId }, transaction
      })
    })
    console.log("regrouping end")
    return true
  } catch (err) {
    console.log(err)
    await Session.update({ regrouping: false }, {
      where: { id: sessionId }
    })
    throw err
  }
}


const initialGroupByPassrateAndCodeWithRandom = async (sessionId, baseGroupSize) => {
  if (baseGroupSize <= 0) return false

  const session = await Session.findByPk(sessionId)
  if (session.grouped === true) {
    return false
  }
  const { passratesByUserId } = await getAllRank(sessionId)
  const rank = new Map(passratesByUserId.map(user => [user.userId, user.passrate]))
  const users = await User.findAll({ where: { session_id: sessionId } })
  if (users.length === 0) return false
  let rankedUsers = users.sort((a, b) => rank.get(a.id) - rank.get(b.id))
  let studentPopulations = getStudentPopulations(rankedUsers, 2)
  // let gp0 = generateGroupsByRank(studentPopulations[0].map(user => user.id), baseGroupSize, rank)
  let gp0 = await generateGroupsByRankAndCode(studentPopulations[0].map(user => user.id), baseGroupSize, rank)
  let randomGroup = generateGroupsRandomly(studentPopulations[1].map(user => user.id), baseGroupSize)
  console.log("initialGroupByPassrateAndCodeWithRandom", gp0, randomGroup)

  await sequelize.transaction(async (transaction) => {
    await setGroups(sessionId, gp0, "PASSRATE&CODE", 1, transaction)
    await setGroups(sessionId, randomGroup, "RANDOM", 1, transaction, gp0.length)
    await Session.update({
      grouped: true,
      group_round: 1
    }, {
      where: { id: sessionId }, transaction
    })
  })
  return true

}

const groupAllByPassrate = async (sessionId, baseGroupSize) => {
  if (baseGroupSize <= 0) return false

  const session = await Session.findByPk(sessionId)
  if (session.grouped === true) {
    return false
  }
  const { passratesByUserId } = await getAllRank(sessionId)
  const rank = new Map(passratesByUserId.map(user => [user.userId, user.passrate]))
  const users = await User.findAll({ where: { session_id: sessionId } })
  if (users.length === 0) return false
  const userIds = users.map(user => user.id)
  const groups = generateGroupsByRank(userIds, baseGroupSize, rank)

  await sequelize.transaction(async (transaction) => {
    await setGroups(sessionId, groups, "PASSRATE", 1, transaction)
    await Session.update({
      grouped: true,
      group_round: 1
    }, {
      where: { id: sessionId }, transaction
    })
  })

  return true
}


module.exports = {
  getAllRank,
  getFinalRank,
  getGroupsRanking,
  getGroupPopulations,
  generateGroupsByGP,
  generateGroupsByRank,
  setGroups,
  regrouping,
  groupAllByPassrate,
  generateGroupsRandomly,
  getStudentPopulations,
  initialGroupByPassrateAndCodeWithRandom,
  regroupingV2,
  getGroupsType,
  generateGroupsByType,
}

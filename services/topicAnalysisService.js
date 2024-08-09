const sequelize = require("../postgre/db")
const initModels = require("../models/init-models")

const TopicAnalysis = initModels(sequelize).topicAnalysis

exports.createTopicAnalysis = async (topicAnalysis) => {
  try {
    return await TopicAnalysis.create(topicAnalysis)
  } catch (err) {
    console.log(err)
  }
}

exports.getTopicAnalysisByGroup = async (groupId) => {
  if (!groupId) throw new Error("groupId is required")
  try {
    console.log("Getting topic analysis by group and type")
    const res = await TopicAnalysis.findOne({
      where: { group_id: groupId, type: "MESSAGE_TOPICS" },
      order: [['created_at', 'DESC']],
      limit: 1
    })
    if (!res) return null
    return res.dataValues
  }
  catch (err) {
    console.log(err)
  }
}
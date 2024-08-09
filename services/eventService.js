const sequelize = require("../postgre/db")
const initModels = require("../models/init-models")

const Event = initModels(sequelize).event

exports.eventType = {
  SESSION_CREATED: "SESSION_CREATED",
  SESSION_GROUPED: "SESSION_GROUPED",
  SESSION_REGROUPED: "SESSION_REGROUPED",
  SESSION_DELETED: "SESSION_DELETED",
  SESSION_CLOSED: "SESSION_CLOSED",
  SESSION_GROUPS_REMOVED: "SESSION_GROUPS_REMOVED",
}

exports.createEvent = async (event) => {
  try {
    return await Event.create(event)
  } catch (err) {
    console.log(err)
  }
}
var DataTypes = require("sequelize").DataTypes
var _code = require("./code")
var _group = require("./group")
var _instructor = require("./instructor")
var _message = require("./message")
var _review = require("./review")
var _session = require("./session")
var _submission = require("./submission")
var _user = require("./user")
var _event = require("./event")
var _topicAnalysis = require("./topicAnalysis")
const e = require("express")

function initModels (sequelize) {
  var code = _code(sequelize, DataTypes)
  var group = _group(sequelize, DataTypes)
  var instructor = _instructor(sequelize, DataTypes)
  var message = _message(sequelize, DataTypes)
  var review = _review(sequelize, DataTypes)
  var session = _session(sequelize, DataTypes)
  var submission = _submission(sequelize, DataTypes)
  var user = _user(sequelize, DataTypes)
  var event = _event(sequelize, DataTypes)
  var topicAnalysis = _topicAnalysis(sequelize, DataTypes)


  return {
    code,
    group,
    instructor,
    message,
    review,
    session,
    submission,
    user,
    event,
    topicAnalysis
  }
}
module.exports = initModels
module.exports.initModels = initModels
module.exports.default = initModels

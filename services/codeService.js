const sequelize = require("../postgre/db")
const initModels = require("../models/init-models")
const user = require("../models/user")

const Code = initModels(sequelize).code
const User = initModels(sequelize).user

exports.list = async () => {
  try {
    return await Code.findAll()
  } catch (err) {
    console.log(err)
  }
}

exports.getCodeById = async (id) => {
  try {
    return await Code.findByPk(id)
  } catch (err) {
    console.log(err)
  }
}

exports.getCodesByUserId = async (id) => {
  try {
    return await Code.findAll({
      where: {
        creater_id: id
      }
    })
  } catch (err) {
    console.log(err)
  }
}

exports.getCodeByUserId = async (userId) => {
  try {
    const user = await User.findByPk(userId)

    if (!user) {
      console.log('User not found')
      return
    }

    if (user.code_id == null) {
      console.log('Code not found')
      return
    }

    const code = await Code.findByPk(user.code_id)

    return code
  } catch (err) {
    console.log(err)
  }
}

exports.createCode = async (code) => {
  try {
    return await Code.create(code)
  } catch (err) {
    console.log(err)
  }
}

exports.updateCode = async (id, code) => {
  try {
    return await Code.update(code, {
      where: {
        id: id
      },
    })
  } catch (err) {
    console.log(err)
  }
}

exports.deleteCode = async (id) => {
  try {
    return await Code.destroy({
      where: {
        id: id,
      },
    })
  } catch (err) {
    console.log(err)
  }
}

exports.addCodeToUser = async (userId, code) => {
  try {
    return await sequelize.transaction(async (t) => {
      const newCode = await this.createCode(code, { transaction: t })
      let user = {
        code_id: newCode.id
      }
      console.log(user)
      await User.update(user, {
        where: {
          id: userId
        },
        transaction: t
      })
      return newCode
    })
  } catch (err) {
    console.log(err)
    throw err
  }
}

exports.getCodesBySessionId = async (sessionId) => {
  try {
    return await Code.findAll({
      where: {
        session_id: sessionId
      }
    })
  } catch (err) {
    console.log(err)
  }
}

exports.getCodeByUserInSession = async (sessionId,userId) => {
  try {
    return await Code.findAll({
      where: {
        session_id: sessionId,
        creater_id: userId
      },
      order: [[ 'created_time', 'DESC']]
    })
  } catch (err) {
    console.log(err)
  }
}
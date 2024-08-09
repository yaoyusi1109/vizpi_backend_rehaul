const userService = require('../services/userService')

exports.list = async (req, res, next) => {
  try {
    const users = await userService.list()
    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

exports.getUsersByIds = async (req, res, next) => {
  try {
    const users = await userService.getUsersByIds(req.body.ids)
    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

exports.createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body.user)
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}

exports.updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.body.user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    next(error)
  }
}

exports.getCodes = async (req, res, next) => {
  try {
    const codes = await userService.getCodes(req.params.id)
    if (!codes) {
      return res.status(404).json({ message: 'Code not found' })
    }
    res.status(200).json(codes)
  } catch (error) {
    next(error)
  }
}

exports.getGroup = async (req, res, next) => {
  try {
    const group = await userService.getGroup(req.params.id)
    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }
    res.status(200).json(group)
  } catch (error) {
    next(error)
  }
}

exports.getUsersBySessionId = async (req, res, next) => {
  try {
    const users = await userService.getUsersBySessionId(req.params.id)
    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

exports.getUsersByGroup = async (req, res, next) => {
  try {
    const users = await userService.getUsersByGroup(req.params.groupId)
    res.status(200).json(users)
  } catch (error) {
    console.error(error);
    next(error)
  }
}

exports.getUserByEmail = async (req, res, next) => {
  try {
    const user = await userService.getUserByEmail(req.body.email)
    res.status(200).json(user)
  } catch (error) {
    console.error(error);
    next(error)
  }
}

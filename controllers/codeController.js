const codeService = require('../services/codeService')

exports.list = async (req, res, next) => {
  try {
    const codes = await codeService.list()
    res.status(200).json({ codes: codes })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getCodeById = async (req, res, next) => {
  try {
    const code = await codeService.getCodeById(req.params.id)
    if (!code) {
      return res.status(404).json({ message: 'Code not found' })
    }
    res.status(200).json({ code: code })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getCodesByUserId = async (req, res, next) => {
  try {
    const codes = await codeService.getCodesByUserId(req.params.id)
    res.status(200).json({ codes: codes })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getCodeByUserId = async (req, res, next) => {
  try {
    const code = await codeService.getCodeByUserId(req.params.id)
    res.status(200).json(code)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createCode = async (req, res, next) => {
  try {
    const code = await codeService.createCode(req.body.code)
    res.status(201).json({ code: code })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.updateCode = async (req, res, next) => {
  try {
    const count = await codeService.updateCode(req.params.id, req.body.code)
    if (count == 0) {
      return res.status(404).json({ message: 'Code not found' })
    }
    res.status(200).json({ count: count })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.deleteCode = async (req, res, next) => {
  try {
    const code = await codeService.deleteCode(req.params.id)
    if (!code) {
      return res.status(404).json({ message: 'Code not found' })
    }
    res.status(200).json({ message: 'Code deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.addCodeToUser = async (req, res, next) => {
  try {
    const code = await codeService.addCodeToUser(req.params.id, req.body.code)
    if (!code) {
      return res.status(404).json({ message: 'Code not found' })
    }
    res.status(200).json({ code: code })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.getCodesBySessionId = async (req, res, next) => {
  try {
    const codes = await codeService.getCodesBySessionId(req.params.id)
    res.status(200).json({ codes: codes })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getCodesBySessionId = async (req, res, next) => {
  try {
    const code = await codeService.getCodeByUserInSession(req.params.id,req.params.stuId)
    res.status(200).json({ code: code })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
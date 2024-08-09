const sequelize = require("../postgre/db")
const initModels = require("../models/init-models")
const { Op } = require("sequelize")

const Instructor = initModels(sequelize).instructor
const Session = initModels(sequelize).session

exports.list = async () => {
	try {
		return await Instructor.findAll()
	} catch (err) {
		console.log(err)
	}
}

exports.getInstructorById = async (id) => {
	try {
		const instructor = await Instructor.findByPk(id)
		return instructor
	} catch (err) {
		console.log(err)
	}
}

exports.getInstructorBySessionId = async (sessionId) => {
	try {
		// console.log(`Looking for instructor with session ID: ${sessionId}`);
		const instructor = await Instructor.findOne({
			where: {
				role: 1,
				session_list: {
					[Op.contains]: [sessionId],
				},
			},
		})
		if (instructor) {
			// console.log(
			// 	`Instructor found: ${instructor.firstName} ${instructor.lastName}`
			// )
		} else {
			console.log(`No instructor found with session ID: ${sessionId}`)
		}
		return instructor
	} catch (err) {
		console.log(err)
	}
}

exports.createInstructor = async (instructor) => {
	try {
		return await Instructor.create(instructor)
	} catch (err) {
		console.log(err)
	}
}

exports.updateInstructor = async (id, instructor) => {
	try {
		return await Instructor.update(instructor, {
			where: {
				id: id,
			},
		})
	} catch (err) {
		console.log(err)
	}
}

exports.deleteInstructor = async (id) => {
	try {
		return await Instructor.destroy({
			where: {
				id: id,
			},
		})
	} catch (err) {
		console.log(err)
	}
}

exports.getSessions = async (instructorId) => {
	try {
		return await Session.findAll({
			where: {
				creater_id: instructorId,
			},
		})
	} catch (err) {
		console.log(err)
	}
}

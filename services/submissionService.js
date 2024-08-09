const sequelize = require("../postgre/db")
const initModels = require("../models/init-models")

const Submission = initModels(sequelize).submission

exports.list = async () => {
  try {
    return await Submission.findAll()
  } catch (err) {
    console.log(err)
  }
}

exports.getSubmissionById = async (id) => {
  try {
    return await Submission.findByPk(id)
  } catch (err) {
    console.log(err)
  }
}

exports.createSubmission = async (submission) => {
  try {
    return await Submission.create(submission)
  } catch (err) {
    console.log(err)
    throw err
  }
}

exports.updateSubmission = async (submission) => {
  try {
    return await Submission.update(submission, {
      where: {
        id: submission.id,
      },
    })
  } catch (err) {
    console.log(err)
  }
}

exports.getPassrateBySessionId = async (sessionId) => {
  try {
    return await Submission.count({
      where: {
        sessionId: sessionId,
        passed: true,
      },
    })
  } catch (err) {
    throw err
  }
}

exports.getUserSubmissions = async (sessionId,userId) => {
	try {
		const submissions = await Submission.findAll({ where: { session_id: sessionId,user_id:userId } });

		return submissions;
	} catch (err) {
		console.error(err);
	}
};

exports.getSessionSubmissions = async (sessionId) => {
	try {
		const submissions = await Submission.findAll({ where: { session_id: sessionId } });

		return submissions;
	} catch (err) {
		console.error(err);
	}
};
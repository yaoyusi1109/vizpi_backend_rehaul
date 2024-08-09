const submissionService = require('../services/submissionService')

exports.createSubmission = async (req, res, next) => {
  try {
    const submission = await submissionService.createSubmission(req.body.submission)
    res.json({ submission: submission })
  } catch (err) {
    res.status(500).send('Something broke!')
  }
}
exports.getUserSubmissions = async (req, res, next) => {
	try {
		const submissions = await submissionService.getUserSubmissions(req.params.id,req.params.user);
		res.json({ submissions: submissions });
	} catch (err) {
		next(err);
	}
};

exports.getSessionSubmissions = async (req, res, next) => {
	try {
		const submissions = await submissionService.getSessionSubmissions(req.params.id);
		res.json({ submissions: submissions });
	} catch (err) {
		next(err);
	}
};
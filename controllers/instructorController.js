const instructorService = require("../services/instructorService");

exports.list = async (req, res) => {
	try {
		const instructors = await instructorService.list();
		res.status(200).json({ instructors: instructors });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.getInstructorById = async (req, res) => {
	try {
		const instructor = await instructorService.getInstructorById(req.params.id);
		if (instructor == null) {
			return res.status(404).json({ message: "Instructor not found" });
		}
		res.status(200).json({ instructor: instructor });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.getInstructorBySessionId = async (req, res) => {
	try {
    console.log(req.params)
    const sessionId = parseInt(req.params.sessionId, 10);
		if (isNaN(sessionId)) {
			return res.status(400).json({ message: "Invalid session ID" });
		}
		const instructor = await instructorService.getInstructorBySessionId(sessionId);
		if (instructor == null) {
			return res.status(404).json({ message: "Instructor not found" });
		}
		res.status(200).json({ instructor: instructor });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.createInstructor = async (req, res) => {
	try {
		const instructor = await instructorService.createInstructor(
			req.body.instructor
		);
		res.status(201).json({ instructor: instructor });
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

exports.updateInstructor = async (req, res) => {
	try {
		const instructor = await instructorService.updateInstructor(
			req.params.id,
			req.body.instructor
		);
		res.status(200).json(instructor);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

exports.deleteInstructor = async (req, res) => {
	try {
		await instructorService.deleteInstructor(req.params.id);
		res.status(200).json({ message: "Instructor deleted" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

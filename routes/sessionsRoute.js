const express = require("express")
const router = express.Router()
const SessionController = require("../controllers/sessionController")

/**
 * @openapi
 * /sessions:
 *   get:
 *     summary: List all sessions
 *     responses:
 *       200:
 *         description: Returns a list of sessions
 */
router.get("/", (req, res, next) => {
	return SessionController.list(req, res, next)
})

/**
 * @openapi
 * /sessions:
 *   post:
 *     summary: Create a new session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session created successfully
 */
router.post("/", (req, res, next) => {
	return SessionController.createSession(req, res, next)
})

/**
 * @openapi
 * /sessions/{id}:
 *   get:
 *     summary: Get a session by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session details
 */
router.get("/:id", (req, res, next) => {
	return SessionController.getSessionById(req, res, next)
})

/**
 * @openapi
 * /sessions/{id}:
 *   put:
 *     summary: Update a session
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session updated successfully
 */
router.put("/:id", (req, res, next) => {
	return SessionController.updateSession(req, res, next)
})

/**
 * @openapi
 * /sessions/{id}:
 *   delete:
 *     summary: Delete a session
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session deleted successfully
 */
// router.delete("/:id", (req, res, next) => {
// 	return SessionController.deleteSession(req, res, next)
// })

/**
 * @openapi
 * /sessions/{id}/register:
 *   post:
 *     summary: Register for a session
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Registration successful
 */
router.post("/:id/register", (req, res, next) => {
	return SessionController.register(req, res, next)
})

/**
 * @openapi
 * /sessions/{id}/groups:
 *   get:
 *     summary: Get groups for a session
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: List of groups
 */
router.get("/:id/groups", (req, res, next) => {
	return SessionController.getGroups(req, res, next)
})

/**
 * @openapi
 * /sessions/{id}/groups:
 *   delete:
 *     summary: Delete groups from a session
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Groups deleted successfully
 */
router.delete("/:id/groups", (req, res, next) => {
	return SessionController.deleteGroups(req, res, next)
})

/**
 * @openapi
 * /sessions/{id}/grouping:
 *   get:
 *     summary: Perform grouping operation for a session
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Grouping operation completed
 */
router.get("/:id/grouping", (req, res, next) => {
	return SessionController.grouping(req, res, next)
})
/**
 * @openapi
 * /sessions/{id}/groupManual:
 *   get:
 *     summary: Perform grouping operation manualy for some students
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Grouping operation completed
 */
router.post("/:id/groupManual", (req, res, next) => {
	return SessionController.groupManual(req, res, next)
})


/**
 * @openapi
 * /sessions/{id}/lateGroup:
 *   get:
 *     summary: Put student who joined late into a group
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Grouping operation completed
 */
router.post('/:id/lateGroup', (req, res, next) => {
	return SessionController.lateGroup(req, res, next)
})

router.post('/ids', (req, res, next) => {
	return SessionController.getSessionsByIds(req, res, next)
})

router.get("/:id/submissions", (req, res, next) => {
	return SessionController.getSubmissions(req, res, next)
})

router.post("/:id/duplicate", (req, res, next) => {
	return SessionController.duplicateSession(req, res, next)
})

router.post("/:id/codes", (req, res, next) => {
	return SessionController.getCodesByTarget(req, res, next)
})

router.post("/:id/regroup", (req, res, next) => {
	return SessionController.regrouping(req, res, next)
})

router.get("/tasks/createrId/:createrId", (req, res, next) => {
	return SessionController.getTaskByCreaterId(req, res, next)
})

router.get("/:id/summary", (req, res, next) => {
	return SessionController.getSummary(req, res, next)
})

router.post("/incStu/:id", (req, res, next) => {
	return SessionController.IncrementStuNumInSession(req, res, next)
})

router.get("/:id/topics", (req, res, next) => {
	return SessionController.getAllTopicsInSession(req, res, next)
})

router.get("/:id/renewTopics", (req, res, next) => {
	return SessionController.renewAllTopicsInSession(req, res, next)
})

module.exports = router

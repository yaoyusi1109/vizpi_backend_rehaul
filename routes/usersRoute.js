const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all users
 *     responses:
 *       200:
 *         description: Returns a list of users
 */
router.get('/', (req, res, next) => {
  return UserController.list(req, res, next)
})

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/', (req, res, next) => {
  return UserController.createUser(req, res, next)
})

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/:id', (req, res, next) => {
  return UserController.getUserById(req, res, next)
})

/**
 * /users/decrypt/{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/decrypt/:id', (req, res, next) => {
  return UserController.decryptUserEmail(req, res, next)
})

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/:id', (req, res, next) => {
  return UserController.updateUser(req, res, next)
})

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/:id', (req, res, next) => {
  return UserController.deleteUser(req, res, next)
})

/**
 * @openapi
 * /users/{id}/codes:
 *   get:
 *     summary: Get codes for a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of codes
 */
router.get('/:id/codes', (req, res, next) => {
  return UserController.getCodes(req, res, next)
})

/**
 * @openapi
 * /users/{id}/group:
 *   get:
 *     summary: Get the group of a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Group details
 */
router.get('/:id/group', (req, res, next) => {
  return UserController.getGroup(req, res, next)
})

router.post('/ids', (req, res, next) => {
  return UserController.getUsersByIds(req, res, next)
})

router.get('/session/:id', (req, res, next) => {
  return UserController.getUsersBySessionId(req, res, next)
})

router.get('/group/:groupId', (req, res, next) => {
  return UserController.getUsersByGroup(req, res, next)
})

router.post('/email', (req, res, next) => {
  return UserController.getUserByEmail(req, res, next)
})


module.exports = router

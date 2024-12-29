const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: A list of users
 *       500:
 *         description: Internal server error
 */
router.get('/', userController.getAllUsers); 

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A user object
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', userController.getUserById); 

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *                 description: The name of the user (required).
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *                 description: The email of the user (required).
 *               password:
 *                 type: string
 *                 example: "password123"
 *                 description: The password of the user (required).
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/', userController.createUser); 

/**
 * @swagger
 * /bulk:
 *   post:
 *     summary: Create multiple users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Jane Doe"
 *                   description: The name of the user (required).
 *                 email:
 *                   type: string
 *                   example: "janedoe@example.com"
 *                   description: The email of the user (required).
 *                 password:
 *                   type: string
 *                   example: "password456"
 *                   description: The password of the user (required).
 *     responses:
 *       201:
 *         description: Users created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/bulk', userController.createMultipleUsers);

/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Smith"
 *                 description: The name of the user (optional).
 *               email:
 *                 type: string
 *                 example: "johnsmith@example.com"
 *                 description: The email of the user (optional).
 *               password:
 *                 type: string
 *                 example: "newpassword789"
 *                 description: The password of the user (optional).
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', userController.updateUser); 

/**
 * @swagger
 * /{id}/password:
 *   put:
 *     summary: Update a user's password
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user whose password is to be updated
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: "newsecurepassword"
 *                 description: The new password for the user (required).
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/password', userController.updateUserPassword);

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to delete
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: User deleted
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', userController.deleteUser); 

/**
 * @swagger
 * /{id}/deactivate:
 *   delete:
 *     summary: Deactivate a user by ID (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to deactivate
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: User deactivated
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/deactivate', userController.deactivateUser);

module.exports = router;

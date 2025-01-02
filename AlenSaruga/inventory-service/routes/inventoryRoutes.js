const express = require('express');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all inventory items
 *     responses:
 *       200:
 *         description: A list of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   book_id:
 *                     type: integer
 *                   quantity:
 *                     type: integer
 *             examples:
 *               example1:
 *                 summary: Example 1
 *                 value:
 *                   - id: 1
 *                     book_id: 10
 *                     quantity: 20
 *                   - id: 2
 *                     book_id: 12
 *                     quantity: 5
 *               example2:
 *                 summary: Example 2
 *                 value:
 *                   - id: 3
 *                     book_id: 15
 *                     quantity: 10
 *                   - id: 4
 *                     book_id: 8
 *                     quantity: 7
 */
router.get('/', inventoryController.getAllInventory);

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get an inventory item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the inventory item
 *     responses:
 *       200:
 *         description: Inventory item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 book_id:
 *                   type: integer
 *                 quantity:
 *                   type: integer
 *             examples:
 *               example1:
 *                 summary: Example response for item found
 *                 value:
 *                   id: 1
 *                   book_id: 10
 *                   quantity: 20
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               example1:
 *                 summary: Example response for item not found
 *                 value:
 *                   error: "Inventory item not found"
 */
router.get('/:id', inventoryController.getInventoryById);

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new inventory item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               book_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *           examples:
 *             example1:
 *               summary: Add a book with quantity 5
 *               value:
 *                 book_id: 20
 *                 quantity: 5
 *             example2:
 *               summary: Add a book with quantity 10
 *               value:
 *                 book_id: 25
 *                 quantity: 10
 *     responses:
 *       201:
 *         description: Inventory item created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *             examples:
 *               example1:
 *                 summary: Example response for item created
 *                 value:
 *                   id: 1
 */
router.post('/', inventoryController.createInventoryItem);

/**
 * @swagger
 * /bulk:
 *   post:
 *     summary: Add multiple inventory items in bulk
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 book_id:
 *                   type: integer
 *                 quantity:
 *                   type: integer
 *             examples:
 *               example1:
 *                 summary: Add multiple books
 *                 value:
 *                   - book_id: 20
 *                     quantity: 5
 *                   - book_id: 25
 *                     quantity: 10
 *               example2:
 *                 summary: Add another set of books
 *                 value:
 *                   - book_id: 30
 *                     quantity: 15
 *                   - book_id: 35
 *                     quantity: 7
 *     responses:
 *       201:
 *         description: Inventory items added in bulk
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               example1:
 *                 summary: Example response for bulk addition
 *                 value:
 *                   message: "2 items added to inventory."
 */
router.post('/bulk', inventoryController.postBulkInventoryItems);

/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update an inventory item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the inventory item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *           examples:
 *             example1:
 *               summary: Update quantity to 15
 *               value:
 *                 quantity: 15
 *             example2:
 *               summary: Update quantity to 25
 *               value:
 *                 quantity: 25
 *     responses:
 *       200:
 *         description: Inventory item updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated:
 *                   type: boolean
 *             examples:
 *               example1:
 *                 summary: Example response for successful update
 *                 value:
 *                   updated: true
 */
router.put('/:id', inventoryController.updateInventoryItem);

/**
 * @swagger
 * /{id}/decrement:
 *   put:
 *     summary: Decrement the quantity of an inventory item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               decrementAmount:
 *                 type: integer
 *             examples:
 *               example1:
 *                 summary: Decrement by 5
 *                 value:
 *                   decrementAmount: 5
 *               example2:
 *                 summary: Decrement by 10
 *                 value:
 *                   decrementAmount: 10
 *     responses:
 *       200:
 *         description: Inventory item quantity decremented
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated:
 *                   type: boolean
 *             examples:
 *               example1:
 *                 summary: Example response for successful decrement
 *                 value:
 *                   updated: true
 */
router.put('/:id/decrement', inventoryController.decrementInventoryQuantity);

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete an inventory item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inventory item deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               example1:
 *                 summary: Example response for item deleted
 *                 value:
 *                   message: "Inventory item with ID 1 deleted successfully"
 *       404:
 *         description: Inventory item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               example1:
 *                 summary: Example response when item not found
 *                 value:
 *                   error: "Inventory item not found"
 */
router.delete('/:id', inventoryController.deleteInventoryItem);

/**
 * @swagger
 * /book/{bookId}:
 *   delete:
 *     summary: Delete all inventory items by book ID
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the book whose inventory items should be deleted
 *     responses:
 *       200:
 *         description: Successfully deleted inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               example1:
 *                 summary: Example response for successful deletion
 *                 value:
 *                   message: "3 inventory items for book ID 123 deleted successfully."
 *       404:
 *         description: No inventory items found for the specified book ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               example1:
 *                 summary: Example response when no items are found
 *                 value:
 *                   error: "No inventory items found for the specified book ID"
 *       400:
 *         description: Bad request if book ID is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               example1:
 *                 summary: Example response for missing book ID
 *                 value:
 *                   error: "Book ID is required"
 */
router.delete('/book/:bookId', inventoryController.deleteInventoryByBookId);

module.exports = router;

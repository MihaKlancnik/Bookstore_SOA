const inventoryModel = require('../models/inventoryModel');

exports.getAllInventory = async (req, res) => {
    try {
        const items = await inventoryModel.getAllInventory();
        res.status(200).json(items); 
    } catch (err) {
        console.error('Error fetching inventory:', err.message);
        res.status(500).json({ error: err.message }); 
    }
};

exports.getInventoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const item = await inventoryModel.getInventoryById(id);
        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' }); // 404 Not Found
        }
        res.status(200).json(item); 
    } catch (err) {
        console.error('Error fetching inventory item:', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.createInventoryItem = async (req, res) => {
    const { book_id, quantity } = req.body;
    if (!book_id || quantity === undefined) {
        return res.status(400).json({ error: 'Book ID and quantity are required' }); 
    }
    try {
        const itemId = await inventoryModel.createInventoryItem({ book_id, quantity });
        res.status(201).json({ id: itemId }); 
    } catch (err) {
        console.error('Error creating inventory item:', err.message);
        res.status(500).json({ error: err.message }); 
    }
};

exports.postBulkInventoryItems = async (req, res) => {
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'A non-empty array of inventory items is required' }); 
    }
    try {
        const addedCount = await inventoryModel.postBulkInventoryItems(items);
        res.status(201).json({ message: `${addedCount} items added to inventory.` }); 
    } catch (err) {
        console.error('Error adding bulk inventory items:', err.message);
        res.status(500).json({ error: err.message }); 
    }
};

exports.updateInventoryItem = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined) {
        return res.status(400).json({ error: 'Quantity is required' });
    }
    try {
        const updated = await inventoryModel.updateInventoryItem(id, quantity);
        if (!updated) {
            return res.status(404).json({ error: 'Inventory item not found' }); 
        }
        res.status(200).json({ message: 'Inventory item updated successfully.' }); 
    } catch (err) {
        console.error('Error updating inventory item:', err.message);
        res.status(500).json({ error: err.message }); 
    }
};

exports.decrementInventoryQuantity = async (req, res) => {
    const { id } = req.params;
    const { decrementAmount } = req.body;
    if (decrementAmount === undefined) {
        return res.status(400).json({ error: 'decrement amount is required' });
    }
    try {
        const updated = await inventoryModel.decrementInventoryQuantity(id, decrementAmount);
        if (!updated) {
            return res.status(404).json({ error: 'Inventory item not found' }); 
        }
        res.status(200).json({ message: 'Inventory item quantity decrementsuccessfully.' }); 
    } catch (err) {
        console.error('Error decrementing inventory quantity:', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteInventoryItem = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await inventoryModel.deleteInventoryItem(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Inventory item not found' }); 
        }
        res.status(204).send(); 
    } catch (err) {
        console.error('Error deleting inventory item:', err.message);
        res.status(500).json({ error: err.message }); 
    }
};

exports.deleteInventoryByBookId = async (req, res) => {
    const { bookId } = req.params;

    if (!bookId) {
        return res.status(400).json({ error: 'Book ID is required' });
    }

    try {
        const deletedCount = await inventoryModel.deleteInventoryByBookId(bookId);

        if (deletedCount === 0) {
            return res.status(404).json({ error: 'No inventory items found for the specified book ID' });
        }

        res.status(200).json({ message: `${deletedCount} inventory items for book ID ${bookId} deleted successfully.` });
    } catch (err) {
        console.error('Error deleting inventory items by book ID:', err.message);
        res.status(500).json({ error: err.message });
    }
};





 
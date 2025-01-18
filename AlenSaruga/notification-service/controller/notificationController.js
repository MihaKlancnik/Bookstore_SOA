const axios = require('axios');

exports.getNotifications = async (req, res) => {
    try {
        const inventoryResponse = await axios.get('http://localhost:4002/api/inventory');

        if (inventoryResponse.status !== 200) {
            return res.status(500).json({ error: 'Error fetching inventory' });
        }

        const inventory = inventoryResponse.data;
        const lowInventory = inventory.filter(item => item.quantity < 3);

        if (lowInventory.length > 0) {
            const lowStockMessage = lowInventory.map(item => 
                `Produkt: ${item.name || item.id} is low in stock with only ${item.quantity} left.`
            ).join('\n');

            return res.json({
                message: `Low inventory alert:\n${lowStockMessage}`,
            });
        } else {
            return res.json({
                message: 'All inventory items are sufficiently stocked.',
            });
        }

    } catch (err) {
        res.status(500).json({ error: `Error fetching notifications: ${err.message}` });
    }
};
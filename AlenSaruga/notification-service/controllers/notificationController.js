const axios = require('axios');

exports.getNotifications = async (req, res) => {
    try {
        const inventoryResponse = await axios.get('http://localhost:4002/api/inventory');

        if (inventoryResponse.status !== 200) {
            return res.status(500).send('Error fetching inventory');
        }

        const inventory = inventoryResponse.data;
        const lowInventory = inventory.filter(item => item.quantity < 5);
        console.log('lowInventory:', lowInventory);

        if (lowInventory.length > 0) {
            const lowStockMessage = lowInventory.map(item => 
                `Produkt: ${item.id} ima nizko zalogo samo: ${item.quantity}.`
            ).join('\n');

            return res.send(`Pozor:\n${lowStockMessage}`);
        } else {
            return res.send('All inventory items are sufficiently stocked.');
        }

    } catch (err) {
        res.status(500).send(`Error fetching notifications: ${err.message}`);
    }
};

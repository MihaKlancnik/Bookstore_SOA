const axios = require('axios');

exports.getNotifications = async (req, res) => {
    try {
        //const inventoryResponse = await axios.get('http://localhost:4002/api/inventory');
        const inventoryResponse = await axios.get('https://inventory-service-cxrs.onrender.com/api/inventory');

        if (inventoryResponse.status !== 200 || !Array.isArray(inventoryResponse.data) || inventoryResponse.data.length === 0) {
            return res.send('Ni novih obvestil.');
        }

        const inventory = inventoryResponse.data;
        const lowInventory = inventory.filter(item => item.quantity < 5);
        console.log('lowInventory:', lowInventory);

        if (lowInventory.length > 0) {
            const lowStockMessage = lowInventory.map(item => 
                `🚨 Pozor! Izdelek <strong>${item.id}</strong> je skoraj razprodan! Preostalo je le <strong>${item.quantity}</strong> enot.`
            ).join('\n');

            return res.send(`Pozor:\n${lowStockMessage}`);
        } else {
            return res.send('Vsi izdelki so na zalogi.');
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


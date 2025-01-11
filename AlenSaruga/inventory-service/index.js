const express = require('express');
const inventoryRoutes = require('./routes/inventoryRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = 4002;

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Inventory Service API',
            version: '1.0.0',
            description: 'API documentation for the inventory service',
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api/inventory`,
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());

app.use('/api/inventory', inventoryRoutes);

app.listen(PORT, () => {
    console.log(`Inventory service is running on http://localhost:${PORT}/api/inventory`);
    console.log(`Swagger API docs available at http://localhost:${PORT}/api-docs`);
    });
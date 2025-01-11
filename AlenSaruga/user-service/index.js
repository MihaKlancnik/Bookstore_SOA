require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const cors = require('cors');


const app = express();
app.use(cors());
const PORT = 4001;

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'User Service API',
            version: '1.0.0',
            description: 'API documentation for the user service',
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api/users`,
            },
        ],
    },
    apis: ['./routes/*.js'],
};



const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());

app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`User service is running on http://localhost:${PORT}/api/users`);
    console.log(`Swagger API docs available at http://localhost:${PORT}/api-docs`);

    });
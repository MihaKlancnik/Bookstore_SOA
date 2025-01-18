require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const cors = require('cors');
const jwt = require('jsonwebtoken');



const app = express();
app.use(cors());
const PORT = 4001;

const verifyJWT = (req, res, next) => {

    const excludedRoutes = ['/api/users/login', '/api/users/register'];
    if (excludedRoutes.includes(req.path)) {
        console.log(req.path);
        return next();
    }
    
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!token) {
        return res.status(403).json({ message: 'Token is required' }); 
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.user = decoded;
        next();
    });
};

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

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/users', verifyJWT, userRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(PORT, () => {
    console.log(`User service is running on http://localhost:${PORT}/api/users`);
    console.log(`Swagger API docs available at http://localhost:${PORT}/api-docs`);

    });
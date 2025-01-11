const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const dotenv = require('dotenv');
const booksRouter = require('./routes/books');
const { swaggerUi, swaggerDocs } = require('./swagger');
const jwt = require('jsonwebtoken');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

const verifyJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) {
      return res.status(403).json({ message: 'Token is required' }); 
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => { 
      if (err) {
          return res.status(403).json({ message: 'Invalid or expired token' }); 
      }
      req.user = decoded; 
      next(); 
  });
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/books', verifyJWT, booksRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/call-api2', (req, res) => {
    http.get('http://inventoryservice:4002/', (response) => {
      response.pipe(res); 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Books service is running on http://localhost:${PORT}/api/books`);
    console.log(`Swagger API docs is running on http://localhost:${PORT}/api-docs`);
});


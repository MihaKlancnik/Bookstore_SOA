const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const booksRouter = require('./routes/books');
const { swaggerUi, swaggerDocs } = require('./swagger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/books', booksRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


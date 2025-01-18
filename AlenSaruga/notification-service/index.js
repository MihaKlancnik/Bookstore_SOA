const express = require("express");
const cors = require("cors");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
app.use(cors());
const PORT = 4003;

const verifyJWT = (req, res, next) => { 
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

app.use(express.json());
app.use('/api/notifications', notificationRoutes);
app.use('api/notifications', verifyJWT, notificationRoutes);


app.listen(PORT, () => {
    console.log(`Notification service running on http://localhost:${PORT}/api/notifications`);
});

const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const axios = require('axios');


const SECRET_KEY = process.env.SECRET_KEY;


function generateUniqueToken() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        userModel.getUserByEmail(email, password, (err, user) => {
            if (err) {
                if (err.message === 'User not found' || err.message === 'Invalid password') {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }

                console.error('Database error:', err.message);
                return res.status(500).json({ error: 'Database error' });
            }

            const currentTime = Math.floor(Date.now() / 1000);
            const expirationTime = currentTime + 60 * 60;

            const payload = {
                sub: user.id,
                name: user.name,
                role: user.role,
                iat: currentTime,
                exp: expirationTime,
                iss: 'https://soa.abm.com',
                jti: generateUniqueToken(),
            };

            const token = jwt.sign(payload, SECRET_KEY, { algorithm: 'HS256' });

            return res.status(200).json({ token });
        });
    } catch (err) {
        console.error('Error during login:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getAllUsers = (req, res) => {
    userModel.getAllUsers((err, users) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(users);
        }
    });
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ error: 'Authorization token is required for user request.' });
    }

    userModel.getUserById(id, async (err, user) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!user) {
            res.status(404).json({ error: 'User not found' });
        } else {

            try {
                const getReviewsResponse = await axios.get('http://localhost:3000/reviews/user/' + user.id, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                user.reviews = (getReviewsResponse.status === 200 && Array.isArray(getReviewsResponse.data))
                    ? getReviewsResponse.data
                    : [];
            } catch (err) {
                console.error('Error fetching reviews:', err.message);
                user.reviews = [];
            }
            res.json(user);
        }
    });
};


exports.createUser = (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    userModel.createUser({ name, email, password }, (err, id) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id, name, email });
        }
    });
};

exports.createMultipleUsers = (req, res) => {
    const users = req.body;

    if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ error: 'Invalid input: Provide an array of users' });
    }

    userModel.createMultipleUsers(users, (err, changes) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ message: `${changes} users created successfully` });
        }
    });
};

exports.updateUser = (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    userModel.updateUser(id, { name, email, password }, (err, changes) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (changes === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json({ id, name, email });
        }
    });
};


exports.updateUserPassword = (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
    }

    userModel.updateUserPassword(id, newPassword, (err, changes) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (changes === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.status(200).json({ message: 'Password updated successfully' });
        }
    });
};


exports.deleteUser = (req, res) => {
    const { id } = req.params;
    userModel.deleteUser(id, (err, changes) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (changes === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.status(204).send();
        }
    });
};


exports.deactivateUser = (req, res) => {
    const { id } = req.params;

    userModel.deactivateUser(id, (err, changes) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (changes === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.status(200).json({ message: 'User deactivated successfully' });
        }
    });
};

const userModel = require('../models/userModel');

exports.getAllUsers = (req, res) => {
    userModel.getAllUsers((err, users) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(users);
        }
    });
};

exports.getUserById = (req, res) => {
    const { id } = req.params;
    userModel.getUserById(id, (err, user) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!user) {
            res.status(404).json({ error: 'User not found' });
        } else {
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

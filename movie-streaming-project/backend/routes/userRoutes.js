const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/reset-password', userController.resetPassword);

// Protected Routes (require authentication)
router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.put('/change-password', authMiddleware, userController.changePassword);

// Watchlist Routes
router.post('/watchlist', authMiddleware, userController.addToWatchlist);
router.delete('/watchlist', authMiddleware, userController.removeFromWatchlist);

module.exports = router;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId: userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRATION || '1h' }
    );
};

// User Registration
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'User with this email or username already exists' 
            });
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password,
            firstName,
            lastName
        });

        // Save user to database
        await newUser.save();

        // Generate authentication token
        const token = generateToken(newUser._id);

        // Respond with user info and token
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Error registering user', 
            error: error.message 
        });
    }
};

// User Login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        // Check password
        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        // Generate authentication token
        const token = generateToken(user._id);

        // Respond with user info and token
        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                subscriptionType: user.subscriptionType
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Error logging in', 
            error: error.message 
        });
    }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
    try {
        // req.user is set by authMiddleware
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('watchlist', 'title posterUrl')
            .populate('favorites', 'title posterUrl');

        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ 
            message: 'Error fetching user profile', 
            error: error.message 
        });
    }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { firstName, lastName, subscriptionType } = req.body;

        // Find and update user
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id, 
            { 
                firstName, 
                lastName, 
                subscriptionType 
            }, 
            { 
                new: true,  // Return updated document
                runValidators: true  // Run model validations
            }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            message: 'Error updating profile', 
            error: error.message 
        });
    }
};

// Add Movie to Watchlist
exports.addToWatchlist = async (req, res) => {
    try {
        const { movieId } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { watchlist: movieId } },
            { new: true }
        ).populate('watchlist', 'title posterUrl');

        res.json({
            message: 'Movie added to watchlist',
            watchlist: user.watchlist
        });
    } catch (error) {
        console.error('Add to watchlist error:', error);
        res.status(500).json({ 
            message: 'Error adding to watchlist', 
            error: error.message 
        });
    }
};

// Remove Movie from Watchlist
exports.removeFromWatchlist = async (req, res) => {
    try {
        const { movieId } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { watchlist: movieId } },
            { new: true }
        ).populate('watchlist', 'title posterUrl');

        res.json({
            message: 'Movie removed from watchlist',
            watchlist: user.watchlist
        });
    } catch (error) {
        console.error('Remove from watchlist error:', error);
        res.status(500).json({ 
            message: 'Error removing from watchlist', 
            error: error.message 
        });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Find user
        const user = await User.findById(req.user._id);

        // Verify current password
        const isMatch = await user.isValidPassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({ 
                message: 'Current password is incorrect' 
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ 
            message: 'Password changed successfully' 
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ 
            message: 'Error changing password', 
            error: error.message 
        });
    }
};

// Reset Password (for forgot password functionality)
exports.resetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        // In a real-world scenario, you'd validate the reset token
        // This is a simplified version
        const user = await User.findOne({ 
            email, 
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid or expired reset token' 
            });
        }

        // Set new password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ 
            message: 'Password reset successfully' 
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ 
            message: 'Error resetting password', 
            error: error.message 
        });
    }
};
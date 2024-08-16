import User from '../../database/models/User.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({data:users,success:true});
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
    }
};

export const updateUserVerificationStatus = async (req, res) => {
    const { isVerified ,userId} = req.body; 

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isVerified },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User verification status updated', user: updatedUser ,success:true});
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user verification status', error: error.message });
    }
};
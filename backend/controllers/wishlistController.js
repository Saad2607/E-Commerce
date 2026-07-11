const User = require("../models/User");

// Add to Wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ msg: "Product ID is required" });
        }

        const user = await User.findById(req.user._id);

        const alreadyAdded = user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (!alreadyAdded) {
            user.wishlist.push(productId);
        }

        await user.save();
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Remove from Wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.wishlist = user.wishlist.filter(
            (item) => item.toString() !== req.params.productId
        );

        await user.save();
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Get Wishlist
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("wishlist");
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

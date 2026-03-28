const User = require("../models/User");

// Add to Wishlist
exports.addToWishlist = async (req, res) => {
    const {productId} = req.body;

    const user = await User.findById(req.user._id);

    if(!user.wishlist.includes(productId)) {
        user.wishlist.push(productId);
    }

    await user.save();
    res.json(user.wishlist);
};

// Remove from Wishlist
exports.removeFromWishlist = async (req, res) => {
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
        (item) => item.toString() !== req.params.productId
    );

    await user.save();
    res.json(user.wishlist);
};

// Get Wishlist
exports.getWishlist = async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist);
};
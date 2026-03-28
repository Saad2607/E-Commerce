const User = require("../models/User");

// Add to Cart
exports.addToCart = async (req, res) => {
    const { productId, qty } = req.body;

    const user = await User.findById(req.user._id);

    const itemExists = user.cart.find(
        (item) => item.product.toString() === productId
    );

    if (itemExists) {
        itemExists.qty += qty;
    } else {
        user.cart.push({ product: productId, qty });
    }

    await user.save();
    res.json(user.cart);
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
        (item) => item.product.toString() !== req.params.productId
    );

    await user.save();
    res.json(user.cart);
};

// Get Cart
exports.getCart = async (req, res) => {
    const user = await User.findById(req.user._id).populate("cart.product");
    res.json(user.cart);
};
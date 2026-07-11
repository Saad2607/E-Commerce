const User = require("../models/User");
const Product = require("../models/Product");

// Add to Cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, qty } = req.body;

        if (!productId) {
            return res.status(400).json({ msg: "Product ID is required" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        const qtyNum = Math.max(1, Number(qty) || 1);
        const stock = product.stock ?? product.countInStock ?? 0;

        if (stock < qtyNum) {
            return res.status(400).json({ msg: "Insufficient stock" });
        }

        const user = await User.findById(req.user._id);

        const itemExists = user.cart.find(
            (item) => item.product.toString() === productId
        );

        if (itemExists) {
            if (itemExists.qty + qtyNum > stock) {
                return res.status(400).json({ msg: "Insufficient stock" });
            }
            itemExists.qty += qtyNum;
        } else {
            user.cart.push({ product: productId, qty: qtyNum });
        }

        await user.save();
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.cart = user.cart.filter(
            (item) => item.product.toString() !== req.params.productId
        );

        await user.save();
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Get Cart
exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("cart.product");
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

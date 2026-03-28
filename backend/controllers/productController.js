const Product = require("../models/Product");

// @desc Get all products
exports.getProducts = async (req, res) => {
    const products = await Product.find();
    res.json(products);
};

// @desc Get Single Product
exports.getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) res.json(product);
    else res.status(404).json({ msg: "Product Not Found" });
};

// @desc Create Product (Admin)
exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, images, category, brand, stock } = req.body;

        const product = new Product({
            name,
            price,
            description,
            images,
            category,
            brand,
            stock,
            user: req.user._id, // admin
        });

        const createdProduct = await product.save();

        res.status(201).json({
            msg: "Product Created Successfully",
            product: createdProduct,
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// @desc Update Product
exports.updateProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: "Not Found" });

    const { name, price, description, stock, images } = req.body;

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.stock = stock || product.stock;

    if (images && images.length > 0) {
        product.images = images;
    }

    const updated = await product.save();
    res.json(updated);
};

// @desc Delete Product
exports.deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: "Not Found" });

    await product.deleteOne();
    res.json({ msg: "Product Removed Successfully" });
};

// Add review
exports.createReview = async (req, res) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        return res.status(400).json({ msg: "Already Reviewed" });
    }

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({ msg: "Review Added" });
};

exports.deleteReview = async (req, res) => {
    const product = await Product.findById(req.params.id);

    // ✅ FIXED CONDITION
    if (!product) {
        return res.status(404).json({ msg: "Product not found" });
    }

    const updatedReviews = product.reviews.filter(
        (r) => r.user.toString() !== req.user._id.toString()
    );

    if (updatedReviews.length === product.reviews.length) {
        return res.status(400).json({ msg: "Review not found" });
    }

    product.reviews = updatedReviews;

    await product.save();

    res.json({ msg: "Review removed" });
};
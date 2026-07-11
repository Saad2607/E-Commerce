const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) res.json(product);
        else res.status(404).json({ msg: "Product Not Found" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, images, category, brand, stock } = req.body;

        if (!name || price == null) {
            return res.status(400).json({ msg: "Name and price are required" });
        }

        const stockNum = Number(stock) || 0;

        const product = new Product({
            name,
            price,
            description,
            images,
            category,
            brand,
            stock: stockNum,
            countInStock: stockNum,
            user: req.user._id,
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

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ msg: "Not Found" });

        const { name, price, description, stock, images, category, brand } = req.body;

        product.name = name ?? product.name;
        product.price = price ?? product.price;
        product.description = description ?? product.description;
        product.category = category ?? product.category;
        product.brand = brand ?? product.brand;

        if (stock !== undefined) {
            product.stock = stock;
            product.countInStock = stock;
        }

        if (images && images.length > 0) {
            product.images = images;
        }

        const updated = await product.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ msg: "Not Found" });

        await product.deleteOne();
        res.json({ msg: "Product Removed Successfully" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ msg: "Rating and comment are required" });
        }

        const ratingNum = Number(rating);
        if (ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ msg: "Rating must be between 1 and 5" });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ msg: "Already Reviewed" });
        }

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: ratingNum,
            comment,
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();

        res.status(201).json({ msg: "Review Added" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

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
        product.numReviews = updatedReviews.length;
        product.rating =
            updatedReviews.length > 0
                ? updatedReviews.reduce((acc, item) => item.rating + acc, 0) /
                  updatedReviews.length
                : 0;

        await product.save();

        res.json({ msg: "Review removed" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const multer = require("multer");

const notFound = (req, res, next) => {
    res.status(404).json({ msg: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ msg: "File too large. Max size is 5MB" });
        }
        return res.status(400).json({ msg: err.message });
    }

    if (err.message === "Only image files are allowed") {
        return res.status(400).json({ msg: err.message });
    }

    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        msg: err.message || "Server error",
    });
};

module.exports = { notFound, errorHandler };

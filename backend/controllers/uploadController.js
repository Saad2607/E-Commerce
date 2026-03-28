const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    let streamUpload = () => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          { folder: "ecommerce" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    res.json({
      imageUrl: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
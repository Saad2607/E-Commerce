const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: String,
        email: {
            type: String,
            unique: true
        },
        password: String,
        isAdmin: {
            type: Boolean,
            default: false
        },
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
        ],
        cart: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                qty: { type: Number, default: 1 },
            },
        ],
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
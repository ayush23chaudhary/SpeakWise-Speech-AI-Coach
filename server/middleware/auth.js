const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            console.log('❌ Auth failed: No token provided');
            return res
                .status(401)
                .json({ message: "No token, authorization denied" });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "fallback_secret"
        );

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            console.log('❌ Auth failed: User not found for id:', decoded.userId);
            return res.status(401).json({ message: "Token is not valid" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("❌ Auth middleware error:", error.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = auth;

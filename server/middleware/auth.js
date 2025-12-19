const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const auth = async (req, res, next) => {
    try {
        console.log('🔐 Auth middleware - Headers:', {
            authorization: req.header("Authorization"),
            origin: req.header("Origin")
        });

        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            console.log('❌ Auth failed: No token provided');
            return res
                .status(401)
                .json({ message: "No token, authorization denied" });
        }

        console.log('🔑 Token received, verifying...');
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "fallback_secret"
        );
        console.log('✅ Token verified for userId:', decoded.userId);

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            console.log('❌ Auth failed: User not found for id:', decoded.userId);
            return res.status(401).json({ message: "Token is not valid" });
        }

        console.log('✅ User authenticated:', user.email);
        req.user = user;
        next();
    } catch (error) {
        console.error("❌ Auth middleware error:", error.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = auth;

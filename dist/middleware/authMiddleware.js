"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isAuthenticated = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(401).json({ message: "Not authorized, no token" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        req.user = { id: decoded.id };
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};
exports.isAuthenticated = isAuthenticated;

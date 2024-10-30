"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = exports.verifyActivationToken = exports.createActivationToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jsonwebtoken_1.default.sign({ user, activationCode }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });
    return { token, activationCode };
};
exports.createActivationToken = createActivationToken;
const verifyActivationToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyActivationToken = verifyActivationToken;
const generateAccessToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "15m",
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "5d",
    });
};
exports.generateRefreshToken = generateRefreshToken;

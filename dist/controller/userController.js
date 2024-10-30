"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSavedRecipes = exports.getUserProfile = exports.logout = exports.refreshToken = exports.login = exports.activateUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../model/userModel"));
const tokenUtils_1 = require("../utils/tokenUtils");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailService_1 = require("../utils/emailService");
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        const existingUser = yield userModel_1.default.findOne({ email });
        if (existingUser) {
            res.status(404).json({ success: false, message: "User already exists" });
            return;
        }
        const { token, activationCode } = (0, tokenUtils_1.createActivationToken)({
            name,
            email,
            password,
        });
        yield (0, emailService_1.sendEmail)(email, "Activate your account", `Your activation code is: ${activationCode}`);
        res.status(201).json({
            success: true,
            message: "Activation code sent to your email. Please verify to complete registration.",
            token,
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.registerUser = registerUser;
const activateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, activationCode } = req.body;
    try {
        const verified = (0, tokenUtils_1.verifyActivationToken)(token);
        if (!verified || verified.activationCode !== activationCode) {
            res
                .status(400)
                .json({ success: false, message: "Invalid Activation Code" });
            return;
        }
        const existingUser = yield userModel_1.default.findOne({ email: verified.user.email });
        if (existingUser) {
            res.status(400).json({ success: false, message: "User already exists" });
            return;
        }
        const hashPassword = yield bcryptjs_1.default.hash(verified.user.password, 10);
        const newUser = new userModel_1.default({
            name: verified.user.name,
            email: verified.user.email,
            password: hashPassword,
        });
        yield newUser.save();
        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            user: newUser,
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.activateUser = activateUser;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = (yield userModel_1.default.findOne({ email }));
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const userId = user._id.toString();
        const accessToken = (0, tokenUtils_1.generateAccessToken)(userId);
        const refreshToken = (0, tokenUtils_1.generateRefreshToken)(userId);
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 15 * 60 * 1000,
            sameSite: "none",
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 5 * 24 * 60 * 60 * 1000,
            sameSite: "none",
        });
        res.status(200).json({ message: "Login successful", user });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
        return;
    }
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const accessToken = (0, tokenUtils_1.generateAccessToken)(decoded.id);
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 15 * 60 * 1000,
            sameSite: "none",
        });
        res.status(200).json({ message: "Access token refreshed" });
    }
    catch (error) {
        console.error(error);
        res.status(403).json({ message: "Invalid or expired refresh token" });
    }
});
exports.refreshToken = refreshToken;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
});
exports.logout = logout;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const user = yield userModel_1.default.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ success: true, user });
        return;
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: "Server error" });
        return;
    }
});
exports.getUserProfile = getUserProfile;
const getUserSavedRecipes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const user = yield userModel_1.default.findById(userId).populate("savedRecipes");
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, savedRecipes: user.savedRecipes });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.getUserSavedRecipes = getUserSavedRecipes;

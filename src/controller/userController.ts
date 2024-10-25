import { Request, Response } from "express";
import User, { IUser } from "../model/userModel";
import {
  createActivationToken,
  generateAccessToken,
  generateRefreshToken,
  verifyActivationToken,
} from "../utils/tokenUtils";
import bcrypt from "bcryptjs";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { sendEmail } from "../utils/emailService";

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(404).json({ success: false, message: "User already exists" });
        return;
      }
  
      const { token, activationCode } = createActivationToken({
        name,
        email,
        password,
      });
  
      await sendEmail(
        email,
        "Activate your account",
        `Your activation code is: ${activationCode}`
      );
  
      res.status(201).json({
        success: true,
        message: "Activation code sent to your email. Please verify to complete registration.",
        token,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  export const activateUser = async (req: Request, res: Response) => {
    const { token, activationCode } = req.body;
  
    try {
      const verified: any = verifyActivationToken(token);
  
      if (!verified || verified.activationCode !== activationCode) {
        res.status(400).json({ success: false, message: "Invalid Activation Code" });
        return;
      }
  
      const existingUser = await User.findOne({ email: verified.user.email });
      if (existingUser) {
        res.status(400).json({ success: false, message: "User already exists" });
        return;
      }
  
      const hashPassword = await bcrypt.hash(verified.user.password, 10);
      const newUser = new User({
        name: verified.user.name,
        email: verified.user.email,
        password: hashPassword,
      });
  
      await newUser.save();
  
      res.status(201).json({
        success: true,
        message: "User Registered Successfully",
        user: newUser,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = (await User.findOne({ email })) as IUser | null;

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const userId = user._id.toString();

    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

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
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
};


export const logout = async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
};

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;

  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ success: true, user });
    return;
  } catch (e: any) {
    console.log(e);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
};

import bcryptjs from "bcryptjs";
const { hash, compare } = bcryptjs;
import jwt from "jsonwebtoken";
const { sign, verify } = jwt;
import { promisify } from "util"
import Agent from "../models/AgentModel.js";

const JWT_SECRET = "this-is-secret";
const JWT_COOKIE_EXPIRES_IN = 90;

export const signup = async (req, res, next) => {
  const { fullName, email, password, passwordConfirm } = req.body;
  if (!fullName || !email || !password || !passwordConfirm) {
    return res.status(400).json({
      success: false,
      message: "All fields are required!",
    });
  }
  if (password !== passwordConfirm) {
    return res.status(400).json({
      success: false,
      message: "Password and confirm password should be same!",
    });
  }

  try {
    let agent = await Agent.findOne({ email });
    if (agent) {
      return res.status(400).json({
        success: false,
        message: "This email already exists!",
      });
    }
    const hashedPassword = await hash(password, 12);
    agent = new Agent({
      fullName,
      email,
      password: hashedPassword,
    });
    await agent.save();
    return res.status(201).json({
      success: true,
      message: "Successfully registered!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required!",
    });
  }
  try {
    const agent = await Agent.findOne({ email });
    if (!agent || !(await compare(password, agent.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or password",
      });
    }
    const payload = {
      _id: agent._id,
      name: agent.name,
      email: agent.email,
    };
    const token = sign(payload, JWT_SECRET, { expiresIn: "90d" });
    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    });
    agent.password = undefined;
    return res.status(200).json({
      user: agent,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const logout = (req, res, next) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Loggedout successfully!",
  });
};

export const protect = async (req, res, next) => {
  let token;

  // 1) Get the token and check it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "You are not logged in, please login to get access" });
  }

  // 2) Varification of token

  const decoded = await promisify(verify)(token, JWT_SECRET);

  // 3) Check if user still exists
  const currentAgent = await Agent.findById(decoded._id);
  if (!currentAgent) {
    return res.status(401).json({ success: false, message: "The user belongs to this token does no longer exist." })
  }

  // Grant access to the prodected rout
  req.user = currentAgent;
  res.locals.user = currentAgent;

  next();
};

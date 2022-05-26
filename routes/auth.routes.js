const { Router } = require("express");
const User = require("../models/User");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const brcypt = require("bcryptjs");
const router = Router();

//  /api/auth/register
router.post(
  "/register",
  [
    check("email", "Incorrect email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Invalid email or password",
        });
      }
      const { email, password } = req.body;
      const candidate = await User.findOne({ email });

      if (candidate) {
        res
          .status(400)
          .json({ message: "There is already a user with this email" });
      }
      const hashedPassword = await brcypt.hash(password, 12);
      const user = new User({ email, password: hashedPassword });
      await user.save();
      res.status(201).json({ message: "User created" });
    } catch (e) {
      res.status(500).json({ message: "Please try again!" });
    }
  }
);

// /api/auth/login
router.post(
  "/login",
  [
    check("email", "Incorrect email").normalizeEmail().isEmail(),
    check("password", "Enter the password").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Incorrect email or password",
        });
      }
	  const { email, password } = req.body;
	  const user = await User.findOne({ email });
	  if (!user) {
		return res.status(400).json({ message: "User not found" });
	  }
	  const isMatch = await brcypt.compare(password, user.password);
	  if (!isMatch) {
		return res.status(400).json({ message: "Incorrect password" });
	  }
	  const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.modeveloper,
	  { expiresIn: "1h" }
    );
	  res.json({ token, userId: user.id });

    } catch (e) {
      res.status(500).json({ message: "Please try again!" });
    }
  }
);

module.exports = router;

import { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "../config/passport";

const router = Router();

// Google OAuth login route
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user as any;

    if (!user) {
      return res.redirect(
        `${process.env["CLIENT_URL"]}/login?error=auth_failed`
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env["JWT_SECRET"]!,
      { expiresIn: "7d" }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env["CLIENT_URL"]}/auth/callback?token=${token}`);
  }
);

// Logout route
router.post("/logout", (_req, res) => {
  // Since we're using JWT, logout is handled client-side
  // But we can add token blacklisting here if needed
  res.json({ message: "Logged out successfully" });
});

// Get current user info
router.get("/me", (req, res) => {
  // This will use the JWT middleware we'll update
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return res.json(user);
});

// Refresh token route
router.post("/refresh", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token required" });
  }

  try {
    // Verify the old token (even if expired)
    const decoded = jwt.verify(token, process.env["JWT_SECRET"]!, {
      ignoreExpiration: true,
    }) as any;

    // Create new token
    const newToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      },
      process.env["JWT_SECRET"]!,
      { expiresIn: "7d" }
    );

    return res.json({ token: newToken });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;

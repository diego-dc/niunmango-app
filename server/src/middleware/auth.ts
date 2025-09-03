import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check for development mode
  if (process.env["NODE_ENV"] === "development" && req.headers["x-dev-user"]) {
    req.user = {
      id: "dev-user-id",
      email: "dev@example.com",
      name: "Development User",
    };
    return next();
  }

  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env["JWT_SECRET"]!) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env["JWT_SECRET"]!) as any;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      };
    } catch (error) {
      // Ignore token errors for optional auth
      // Don't set req.user if token is invalid
    }
  }

  next();
};

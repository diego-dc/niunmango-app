import { Request, Response, NextFunction } from "express";

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
  _res: Response,
  next: NextFunction
) => {
  // TODO: Implement proper JWT authentication
  // For now, we'll use a mock user for development
  req.user = {
    id: "dev-user-id",
    email: "dev@example.com",
    name: "Development User",
  };

  next();
};

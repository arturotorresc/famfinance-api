import { Request, Response, NextFunction } from "express";

/**
 * Checks is the user is authenticated before passing on to handle the
 * request.
 */
export function isAuthenticated() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      next();
    } else {
      res.statusMessage = "Needs authentication";
      res.status(401).json({});
    }
  };
}

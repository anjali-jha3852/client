import jwt from "jsonwebtoken";

// Admin-only middleware
export const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token
  if (!token) return res.status(401).json({ message: "No token, access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user is admin
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    req.admin = decoded; // save admin info to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

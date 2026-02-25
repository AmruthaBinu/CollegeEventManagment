const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.json({ status: "Access denied" });
    }
    next();
  };
};

module.exports = allowRoles;

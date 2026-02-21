const jwt = require("jsonwebtoken");
const db = require("../db/db");

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      if (req.path.startsWith("/auth") || req.path === "/") return next();
      req.flash("error", "Вы еще не авторизованы");
      return res.redirect("/auth/login");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await db.query(
      "SELECT userid, username FROM users WHERE userid = $1",
      [decoded.id]
    );

    if (!rows.length) {
      res.clearCookie("token");
      req.flash("error", "Вы еще не авторизованы");
      return res.redirect("/auth/login");
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error("Ошибка аутентификации:", error);
    res.clearCookie("token");
    req.flash("error", "Вы еще не авторизованы");
    return res.redirect("/auth/login");
  }
};

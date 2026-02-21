const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/db");

router.get("/register", (req, res) => {
  res.render("register", { error: req.flash("error") });
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userExists = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (userExists.rows.length) {
      req.flash("error", "Имя пользователя занято");
      return res.redirect("/auth/register");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      username,
      hashedPassword,
    ]);
    req.flash("success", "Регистрация прошла успешно");
    res.redirect("/auth/login");
  } catch (error) {
    req.flash("error", "Ошибка сервера");
    res.redirect("/auth/register");
  }
});

router.get("/login", (req, res) => {
  res.render("login", {
    error: req.flash("error"),
    success: req.flash("success"),
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (!rows.length) {
      req.flash("error", "Неверные данные");
      return res.redirect("/auth/login");
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      req.flash("error", "Неверные данные");
      return res.redirect("/auth/login");
    }
    const token = jwt.sign({ id: user.userid }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.cookie("token", token, { httpOnly: true });
    req.flash("success", "Авторизация успешна");
    res.redirect("/");
  } catch (error) {
    req.flash("error", "Ошибка сервера");
    res.redirect("/auth/login");
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  req.flash("success", "Вы вышли из системы");
  res.redirect("/auth/login");
});

module.exports = router;

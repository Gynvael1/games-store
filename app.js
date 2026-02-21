const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const db = require("./db/db");
const authenticateJWT = require("./middleware/authMiddleware");
require("dotenv").config();

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);
app.use(flash());

// app.use(authenticateJWT);

app.use((req, res, next) => {
  // Просто пропускаем всех без проверки
  // Можно задать тестового пользователя
  req.user = { userid: 1, username: "test_user" };
  next();
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("index", {
    success: req.flash("success"),
    error: req.flash("error"),
    user: req.user || null,
  });
});

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);
app.use("/games", require("./routes/games"));
app.use("/customers", require("./routes/customers"));
app.use("/sellers", require("./routes/sellers"));
app.use("/purchases", require("./routes/purchases"));

app.use((req, res, next) => {
  res.status(404).render("404", { error: "Страница не найдена" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500", { error: "Ошибка сервера" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Сервер работает! Откройте: http://localhost:${PORT}`);
});

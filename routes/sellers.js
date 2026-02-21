const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM sellers");
    res.render("sellers", {
      sellers: rows,
      fieldErrors: req.flash("fieldErrors"),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM sellers WHERE sellerid = $1",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send("Продавец не найден");
    res.render("edit-seller", { seller: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.post("/add", async (req, res) => {
  const { firstname, lastname, age, experience } = req.body;
  const fieldErrors = {};
  if (!/^[A-Za-zА-Яа-яЁё'-]{2,}$/u.test(firstname)) {
    fieldErrors.firstname = "Некорректное имя";
  }
  if (!/^[A-Za-zА-Яа-яЁё'-]{2,}$/u.test(lastname)) {
    fieldErrors.lastname = "Некорректная фамилия";
  }
  try {
    if (Object.keys(fieldErrors).length > 0) {
      req.flash("fieldErrors", fieldErrors);
      req.flash("formdata", req.body);
      return res.redirect("/sellers");
    }
    await db.query(
      "INSERT INTO sellers (firstname, lastname, age, experience) VALUES ($1, $2, $3, $4)",
      [firstname.trim(), lastname.trim(), age, experience]
    );
    res.redirect("/sellers");
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.post("/update/:id", async (req, res) => {
  const { firstname, lastname, age, experience } = req.body;
  const fieldErrors = {};
  if (!/^[A-Za-zА-Яа-яЁё'-]{2,}$/u.test(firstname)) {
    fieldErrors.firstname = "Некорректное имя";
  }
  if (!/^[A-Za-zА-Яа-яЁё'-]{2,}$/u.test(lastname)) {
    fieldErrors.lastname = "Некорректная фамилия";
  }
  try {
    if (Object.keys(fieldErrors).length > 0) {
      req.flash("fieldErrors", fieldErrors);
      req.flash("formdata", req.body);
      return res.redirect(`/sellers/edit/${req.params.id}`);
    }
    await db.query(
      "UPDATE sellers SET firstname = $1, lastname = $2, age = $3, experience = $4 WHERE sellerid = $5",
      [firstname.trim(), lastname.trim(), age, experience, req.params.id]
    );
    res.redirect("/sellers");
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM sellers WHERE sellerid = $1", [req.params.id]);
    res.redirect("/sellers");
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

module.exports = router;

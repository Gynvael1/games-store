const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM customers ORDER BY customerid"
    );
    res.render("customers", {
      customers: rows,
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
      "SELECT * FROM customers WHERE customerid = $1",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send("Клиент не найден");
    res.render("edit-customer", { customer: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.post("/add", async (req, res) => {
  const { firstname, lastname, email } = req.body;
  const fieldErrors = {};
  if (!/^[A-Za-zА-Яа-яЁё'-]{2,}$/u.test(firstname)) {
    fieldErrors.firstname = "Некорректное имя";
  }
  if (!/^[A-Za-zА-Яа-яЁё'-]{2,}$/u.test(lastname)) {
    fieldErrors.lastname = "Некорректная фамилия";
  }
  try {
    const emailCheck = await db.query(
      "SELECT 1 FROM customers WHERE email = $1",
      [email]
    );
    if (emailCheck.rows.length > 0) {
      fieldErrors.email = "Почта уже используется";
    }
    if (Object.keys(fieldErrors).length > 0) {
      req.flash("fieldErrors", fieldErrors);
      req.flash("formdata", req.body);
      return res.redirect("/customers");
    }
    await db.query(
      "INSERT INTO customers (firstname, lastname, email) VALUES ($1, $2, $3)",
      [firstname.trim(), lastname.trim(), email]
    );
    res.redirect("/customers");
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.post("/update/:id", async (req, res) => {
  const { firstname, lastname, email } = req.body;
  const fieldErrors = {};
  if (!/^[A-Za-zА-Яа-яЁё'-]{2,}$/u.test(firstname)) {
    fieldErrors.firstname = "Некорректное имя";
  }
  if (!/^[A-Za-zА-Яа-яЁё'-]{2,}$/u.test(lastname)) {
    fieldErrors.lastname = "Некорректная фамилия";
  }
  try {
    const emailCheck = await db.query(
      "SELECT 1 FROM customers WHERE email = $1 AND customerid != $2",
      [email, req.params.id]
    );
    if (emailCheck.rows.length > 0) {
      fieldErrors.email = "Почта уже используется";
    }
    if (Object.keys(fieldErrors).length > 0) {
      req.flash("fieldErrors", fieldErrors);
      req.flash("formdata", req.body);
      return res.redirect(`/customers/edit/${req.params.id}`);
    }
    await db.query(
      "UPDATE customers SET firstname = $1, lastname = $2, email = $3 WHERE customerid = $4",
      [firstname.trim(), lastname.trim(), email, req.params.id]
    );
    res.redirect("/customers");
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM customers WHERE customerid = $1", [
      req.params.id,
    ]);
    res.redirect("/customers");
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

module.exports = router;

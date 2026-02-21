const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/", async (req, res) => {
  try {
    const { rows: purchases } = await db.query(`
      SELECT p.*, c.firstname || ' ' || c.lastname AS customername, 
             g.title AS gametitle, pl.name AS platformname, 
             s.firstname || ' ' || s.lastname AS sellername 
      FROM purchases p 
      JOIN customers c ON p.customerid = c.customerid 
      JOIN games g ON p.gameid = g.gameid 
      JOIN platforms pl ON p.platformid = pl.platformid 
      JOIN sellers s ON p.sellerid = s.sellerid
    `);
    const { rows: customers } = await db.query("SELECT * FROM customers");
    const { rows: games } = await db.query("SELECT * FROM games");
    const { rows: platforms } = await db.query("SELECT * FROM platforms");
    const { rows: sellers } = await db.query("SELECT * FROM sellers");
    res.render("purchases", {
      purchases,
      customers,
      games,
      platforms,
      sellers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    const { rows: purchase } = await db.query(
      `
      SELECT p.*, c.firstname || ' ' || c.lastname AS customername, 
             g.title AS gametitle, pl.name AS platformname, 
             s.firstname || ' ' || s.lastname AS sellername 
      FROM purchases p 
      JOIN customers c ON p.customerid = c.customerid 
      JOIN games g ON p.gameid = g.gameid 
      JOIN platforms pl ON p.platformid = pl.platformid 
      JOIN sellers s ON p.sellerid = s.sellerid 
      WHERE p.purchaseid = $1
    `,
      [req.params.id]
    );
    if (!purchase.length) return res.status(404).send("Покупка не найдена");
    const { rows: customers } = await db.query("SELECT * FROM customers");
    const { rows: games } = await db.query("SELECT * FROM games");
    const { rows: platforms } = await db.query("SELECT * FROM platforms");
    const { rows: sellers } = await db.query("SELECT * FROM sellers");
    res.render("edit-purchase", {
      purchase: purchase[0],
      customers,
      games,
      platforms,
      sellers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.post("/add", async (req, res) => {
  const { customerid, gameid, purchasedate, platformid, sellerid } = req.body;
  try {
    await db.query(
      "INSERT INTO purchases (customerid, gameid, purchasedate, platformid, sellerid) VALUES ($1, $2, $3, $4, $5)",
      [customerid, gameid, purchasedate, platformid, sellerid]
    );
    res.redirect("/purchases");
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.post("/update/:id", async (req, res) => {
  const { customerid, gameid, purchasedate, platformid, sellerid } = req.body;
  try {
    await db.query(
      "UPDATE purchases SET customerid = $1, gameid = $2, purchasedate = $3, platformid = $4, sellerid = $5 WHERE purchaseid = $6",
      [customerid, gameid, purchasedate, platformid, sellerid, req.params.id]
    );
    res.redirect("/purchases");
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM purchases WHERE purchaseid = $1", [
      req.params.id,
    ]);
    res.redirect("/purchases");
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

module.exports = router;

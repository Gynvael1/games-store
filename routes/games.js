const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT g.*, d.name as developername 
      FROM games g 
      JOIN developers d ON g.developerid = d.developerid
    `);
    res.render("games", { games: rows });
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT g.*, d.name as developername 
      FROM games g 
      JOIN developers d ON g.developerid = d.developerid 
      WHERE g.gameid = $1
    `,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send("Игра не найдена");
    res.render("edit-game", { game: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.post("/add", async (req, res) => {
  const { title, price, releasedate, developername, image_url } = req.body;
  try {
    await db.query("BEGIN");
    let developer = await db.query(
      "SELECT developerid FROM developers WHERE name = $1",
      [developername]
    );
    let developerId = developer.rows[0]?.developerid;
    if (!developerId) {
      developer = await db.query(
        "INSERT INTO developers (name) VALUES ($1) RETURNING developerid",
        [developername]
      );
      developerId = developer.rows[0].developerid;
    }
    await db.query(
      `INSERT INTO games (title, price, releasedate, developerid, image_url) 
       VALUES ($1, $2, $3, $4, $5)`,
      [title, price, releasedate, developerId, image_url || null]
    );
    await db.query("COMMIT");
    res.redirect("/games");
  } catch (error) {
    await db.query("ROLLBACK");
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.post("/update/:id", async (req, res) => {
  const { title, price, releasedate, developername, image_url } = req.body;
  try {
    await db.query("BEGIN");
    let developer = await db.query(
      "SELECT developerid FROM developers WHERE name = $1",
      [developername]
    );
    let developerId = developer.rows[0]?.developerid;
    if (!developerId) {
      developer = await db.query(
        "INSERT INTO developers (name) VALUES ($1) RETURNING developerid",
        [developername]
      );
      developerId = developer.rows[0].developerid;
    }
    await db.query(
      `UPDATE games SET 
        title = $1, price = $2, releasedate = $3, 
        developerid = $4, image_url = $5 
       WHERE gameid = $6`,
      [title, price, releasedate, developerId, image_url || null, req.params.id]
    );
    await db.query("COMMIT");
    res.redirect("/games");
  } catch (error) {
    await db.query("ROLLBACK");
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM games WHERE gameid = $1", [req.params.id]);
    res.redirect("/games");
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

module.exports = router;

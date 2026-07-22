const pool = require("../config/database");

async function createUser(name, email, passwordHash) {
  const sql = "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)";
  const [result] = await pool.execute(sql, [name, email, passwordHash]);
  return result.insertId;
}

async function findByEmail(email) {
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", [id]);
  return rows[0] || null;
}

module.exports = { createUser, findByEmail, findById };

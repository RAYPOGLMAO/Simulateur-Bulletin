const pool = require("../config/database");

async function createSimulation(userId, employeeName, data) {
  const sql = `
    INSERT INTO simulations (user_id, employee_name, data)
    VALUES (?, ?, CAST(? AS JSON))
  `;
  const [result] = await pool.execute(sql, [userId || null, employeeName, JSON.stringify(data)]);
  return result.insertId;
}

async function getAllSimulations(userId) {
  const [rows] = await pool.execute(
    "SELECT id, employee_name, data, created_at FROM simulations WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows.map(row => {
    const data = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
    return {
      id: row.id,
      employee_name: row.employee_name,
      ...data,
      created_at: row.created_at,
    };
  });
}

async function getSimulationById(userId, id) {
  const [rows] = await pool.execute(
    "SELECT id, employee_name, data, created_at FROM simulations WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  if (!rows[0]) return null;
  const row = rows[0];
  const data = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
  return {
    id: row.id,
    employee_name: row.employee_name,
    ...data,
    created_at: row.created_at,
  };
}

async function deleteSimulation(userId, id) {
  const [result] = await pool.execute(
    "DELETE FROM simulations WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return result.affectedRows > 0;
}

async function deleteAllSimulations(userId) {
  await pool.execute("DELETE FROM simulations WHERE user_id = ?", [userId]);
}

module.exports = {
  createSimulation,
  getAllSimulations,
  getSimulationById,
  deleteSimulation,
  deleteAllSimulations,
};

const pool = require("../config/database");

async function createSimulation(employeeName, data) {
  const sql = `
    INSERT INTO simulations (employee_name, data)
    VALUES (?, CAST(? AS JSON))
  `;
  const [result] = await pool.execute(sql, [employeeName, JSON.stringify(data)]);
  return result.insertId;
}

async function getAllSimulations() {
  const [rows] = await pool.execute(
    "SELECT id, employee_name, data, created_at FROM simulations ORDER BY created_at DESC"
  );
  return rows.map(row => {
    const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
    return {
      id: row.id,
      employee_name: row.employee_name,
      ...data,
      created_at: row.created_at,
    };
  });
}

async function getSimulationById(id) {
  const [rows] = await pool.execute(
    "SELECT id, employee_name, data, created_at FROM simulations WHERE id = ?",
    [id]
  );
  if (!rows[0]) return null;
  const row = rows[0];
  const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
  return {
    id: row.id,
    employee_name: row.employee_name,
    ...data,
    created_at: row.created_at,
  };
}

async function deleteSimulation(id) {
  const [result] = await pool.execute(
    "DELETE FROM simulations WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

async function deleteAllSimulations() {
  await pool.execute("DELETE FROM simulations");
}

module.exports = {
  createSimulation,
  getAllSimulations,
  getSimulationById,
  deleteSimulation,
  deleteAllSimulations,
};

const pool = require("../config/database");

async function createSimulation(data) {
  const sql = `
    INSERT INTO simulations
      (salary_brut, primes, indemnites, enfants_charge,
       cnss_salarial, cmr_salarial, amg_salarial, cotisations_salariales,
       cnss_patronal, cmr_patronal, amg_patronal, cotisations_patronales,
       impot_revenu, salary_net)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    data.salary_brut,
    data.primes,
    data.indemnites,
    data.enfants_charge,
    data.cnss_salarial,
    data.cmr_salarial,
    data.amg_salarial,
    data.cotisations_salariales,
    data.cnss_patronal,
    data.cmr_patronal,
    data.amg_patronal,
    data.cotisations_patronales,
    data.impot_revenu,
    data.salary_net,
  ];
  const [result] = await pool.execute(sql, values);
  return result.insertId;
}

async function getAllSimulations() {
  const [rows] = await pool.execute(
    "SELECT id, salary_brut, primes, indemnites, enfants_charge, salary_net, created_at FROM simulations ORDER BY created_at DESC"
  );
  return rows;
}

async function getSimulationById(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM simulations WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function deleteSimulation(id) {
  const [result] = await pool.execute(
    "DELETE FROM simulations WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createSimulation,
  getAllSimulations,
  getSimulationById,
  deleteSimulation,
};

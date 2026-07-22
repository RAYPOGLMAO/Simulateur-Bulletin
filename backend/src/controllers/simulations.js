const Simulation = require("../models/simulationModel");

async function simulate(req, res) {
  try {
    const { input, result } = req.body;
    if (!input || !result) {
      return res.status(400).json({ error: "input et result requis" });
    }
    const employeeName = input.employeeName || "Salarié(e)";
    const id = await Simulation.createSimulation(req.userId, employeeName, { input, result });
    res.status(201).json({ id, employee_name: employeeName, input, result });
  } catch (err) {
    console.error("Erreur simulation:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function getAll(req, res) {
  try {
    const simulations = await Simulation.getAllSimulations(req.userId);
    res.json(simulations);
  } catch (err) {
    console.error("Erreur recuperation:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function getById(req, res) {
  try {
    const simulation = await Simulation.getSimulationById(req.userId, req.params.id);
    if (!simulation) {
      return res.status(404).json({ error: "Simulation non trouvee" });
    }
    res.json(simulation);
  } catch (err) {
    console.error("Erreur recuperation:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function remove(req, res) {
  try {
    const deleted = await Simulation.deleteSimulation(req.userId, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Simulation non trouvee" });
    }
    res.json({ message: "Simulation supprimee" });
  } catch (err) {
    console.error("Erreur suppression:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function clearAll(req, res) {
  try {
    await Simulation.deleteAllSimulations(req.userId);
    res.json({ message: "Historique vide" });
  } catch (err) {
    console.error("Erreur vidage:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { simulate, getAll, getById, remove, clearAll };

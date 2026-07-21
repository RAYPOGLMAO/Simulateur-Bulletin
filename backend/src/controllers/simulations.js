const { calculatePayroll } = require("../services/taxCalculator");
const Simulation = require("../models/simulationModel");

async function simulate(req, res) {
  try {
    const { salary_brut, primes, indemnites, enfants_charge } = req.body;

    if (!salary_brut || salary_brut <= 0) {
      return res.status(400).json({ error: "Le salaire brut doit etre superieur a 0" });
    }

    const result = calculatePayroll({ salary_brut, primes, indemnites, enfants_charge });

    const id = await Simulation.createSimulation(result);

    res.status(201).json({ id, ...result });
  } catch (err) {
    console.error("Erreur simulation:", err);
    res.status(500).json({ error: "Erreur serveur lors de la simulation" });
  }
}

async function getAll(req, res) {
  try {
    const simulations = await Simulation.getAllSimulations();
    res.json(simulations);
  } catch (err) {
    console.error("Erreur recuperation:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function getById(req, res) {
  try {
    const simulation = await Simulation.getSimulationById(req.params.id);
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
    const deleted = await Simulation.deleteSimulation(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Simulation non trouvee" });
    }
    res.json({ message: "Simulation supprimee" });
  } catch (err) {
    console.error("Erreur suppression:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { simulate, getAll, getById, remove };

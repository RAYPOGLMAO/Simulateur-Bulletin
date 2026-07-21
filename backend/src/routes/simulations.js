const express = require("express");
const router = express.Router();
const controller = require("../controllers/simulations");

router.post("/", controller.simulate);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.delete("/:id", controller.remove);

module.exports = router;

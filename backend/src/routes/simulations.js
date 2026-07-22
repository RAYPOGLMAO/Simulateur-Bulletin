const express = require("express");
const router = express.Router();
const controller = require("../controllers/simulations");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.post("/", controller.simulate);
router.get("/", controller.getAll);
router.delete("/", controller.clearAll);
router.get("/:id", controller.getById);
router.delete("/:id", controller.remove);

module.exports = router;

const express = require("express");

const dataController = require("../controllers/data-controller");

const router = express.Router();

router.get("/sessiondata", dataController.getSessionData);

module.exports = router;

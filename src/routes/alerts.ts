import express, { Router, Request, Response } from "express";
import { getAlertById, getAllAlerts, getTypes } from "../controllers/alertes";

const router: Router = express.Router();

router.get("/all", getAllAlerts);
router.get("/types", getTypes);
router.get("/byid/:id", getAlertById);
export default router;

import express, { Router, Request, Response } from "express";
import { getAlertById, getAllAlerts } from "../controllers/alertes";

const router: Router = express.Router();

router.get("/all", getAllAlerts);
router.get("/byid/:id", getAlertById);
export default router;

import express, { Router, Request, Response } from "express";
import { getAllAlerts } from "../controllers/alertes";

const router: Router = express.Router();

router.get("/all", getAllAlerts);

export default router;

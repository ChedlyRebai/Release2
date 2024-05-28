import express, { Router, Request, Response } from "express";
import { getLettres, toggleEtatLettre } from "../controllers/lettre";

const router: Router = express.Router();

router.get("/getlettre", getLettres);
router.put("/updatelettre", toggleEtatLettre);

export default router;

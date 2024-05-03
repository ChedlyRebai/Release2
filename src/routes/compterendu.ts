import express, { Router, Request, Response } from "express";

import { getGroup } from "../controllers/groupe";
import { getAgence } from "../controllers/agence";
import compression from "compression";
import { createCompteRendu, getCompteRenduById, getCompterendu, getHistoriqueCompteRendu, getListCompte } from "../controllers/v_client_recouv";

const router: Router = express.Router();


router.get("/compteRendu",getCompterendu)
router.post("/createcompterendu",createCompteRendu);
router.get("/getbyid/:id",getCompteRenduById)
export default router;

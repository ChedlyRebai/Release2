import express, { Router, Request, Response } from "express";

import { getGroup } from "../controllers/groupe";
import { getAgence } from "../controllers/agence";
import compression from "compression";
import { createCompteRendu, getAllCompteRendu, getCompteRenduById, getCompterendu, getHistoriqueCompteRendu, getListCompte, getcompterendutypes } from "../controllers/compterendu";

const router: Router = express.Router();
router.get("/all", getAllCompteRendu);
router.get("/compterendutypes", getcompterendutypes);
router.get("/getcompterendu",getCompterendu)
router.post("/createcompterendu",createCompteRendu);
router.get("/getbyid/:id",getCompteRenduById)
export default router;

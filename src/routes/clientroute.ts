import express, { Router, Request, Response } from "express";

import { getGroup } from "../controllers/groupe";
import { getAgence } from "../controllers/agence";
import compression from "compression";
import { getCompterendu, getHistoriqueCompteRendu, getListCompte } from "../controllers/compterendu";
import { contact, getAppreciation, getMotifs, gethrdv} from "../controllers/motif";

const router: Router = express.Router();

router.get("/getgroupes", getGroup);
router.get("/getagences", getAgence);
router.get("/compteRendu",getCompterendu)
router.use("/listcompte",compression({level:9}),getListCompte)
router.use("/listhistorique",compression({level:9}),getHistoriqueCompteRendu)
router.get('/motifs',getMotifs)
router.get('/contact',contact)
router.get('/appreciation',getAppreciation)
router.get('/gethrdv',gethrdv)

export default router;

import express, { Router, Request, Response } from "express";

import { getGroup } from "../controllers/groupe";
import { getAgence } from "../controllers/agence";
import compression from "compression";
import { getCompterendu, getHistoriqueCompteRendu, getListCompte } from "../controllers/compterendu";

const router: Router = express.Router();


router.get("/getgroupes", getGroup);
router.get("/getagences", getAgence);
router.get("/compteRendu",getCompterendu)
router.use("/listcompte",compression({level:9}),getListCompte)
router.use("/listhistorique",compression({level:9}),getHistoriqueCompteRendu)

export default router;

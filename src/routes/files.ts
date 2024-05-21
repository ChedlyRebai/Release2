import express, { Router, Request, Response } from "express";

import { deleteFileById } from "../controllers/file";

const router: Router = express.Router();
router.delete("/deletefile", deleteFileById);
export default router;

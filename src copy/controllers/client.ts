import { Result } from "./../../node_modules/arg/index.d";
import { Request, Response } from "express";


import jwt, { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { db } from "../../prisma/db";
import { group } from "console";
import { ab_client } from "@prisma/client";

const getAffectation = async (matricule: string) => {
  return await db.utilisateur.findFirst({
    where: { usr_matricule: matricule },
    select: { affectation: true },
  });
};

const SELECT_FIELDS = {
  cli: true,
  nom: true,
  groupe: true,
  agence: true,
  nbre_imp: true,
  mnt_imp: true,
  nombre_jours: true,
  sd: true,
  depassement: true,
  nombre_jours_sdb: true,
  tot_creance: true,
  max_nbj: true,
  engagement: true,
  classe: true,
  tel1: true,
  tel2: true,
};

// export const getAllLinks = async (req: Request, res: Response) => {
//   try {
//     const links = await db.droit_accees.groupBy({
//       by: ["nom"],
//       where: {
//         code_fonction: 14,
//         acces: "O",
//       },
//     });

//     const linksName = links.map((link) => link.nom);

//     console.log(linksName);
//     return res.status(StatusCodes.OK).json(linksName);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ message: "Internal Server Error" });
//   }
// };

import { Result } from "arg";
import { Request, Response } from "express";

import jwt, { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { db } from "../../prisma/db";
import { group } from "console";
import { ab_client } from "@prisma/client";
import { json } from "./../../public/utils";

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

export const clientInfo = async (req: Request, res: Response) => {
  try {
    const cli = req.query.cli as string;
    const client = await db.ab_client.findFirst({
      where: {
        cli: cli,
      },
      select: {
        id: true,
        depassement: true,
        engagement: true,
        flag_trt: true,
        groupe: true,
        mnt_imp: true,
        nbre_imp: true,
        nom: true,
        phase: true,
        tot_creance: true,
        classe: true,
        cli: true,
        tel: true,
        max_nbj: true,
        tel1: true,
        tel2: true,
        sd: true,
        nombre_jours: true,
        nombre_jours_sdb: true,
        Agence: true,
        Zone: true,
      },
    });
    return res.status(StatusCodes.OK).type("json").send(json(client));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

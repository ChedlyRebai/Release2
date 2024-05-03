import { Request, Response } from "express";

import jwt, { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { db } from "../../prisma/db";
import { json } from "../../public/utils";
const getAffectation = async (matricule: string) => {
  const res = await db.utilisateur.findFirst({
    where: { usr_matricule: matricule },
    select: { affectation: true },
  });
  return res;
};

const SELECT_FIELDS = {
  cli: true,
  age: true,
  nom: true,
  groupe: true,
  nombre_jours: true,
  nombre_jours_sdb: true,
  phase: true,
  etat_lettre: true,
  susp_lr: true,
  mnt_imp: true,
  mnt_sdb: true,
  tot_creance: true,
  max_nbj: true,
  tot_eng: true,
  depassement: true,
  ncp: true,
  nbre_imp: true,
};

export const getLettres = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization as string;
    const user = jwt.decode(token) as JwtPayload;
    const perPage = Number(req.query.perPage) || 5;
    const page = Number(req.query.page) || 1;
    const search = String(req.query.search) || "";
    const group = Number(req.query.groupe) || 0;
    const agence = Number(req.query.agence) || 0;
    const from = Number(req.query.from) || 0;
    const to = Number(req.query.to) || 0;
    console.log(
      typeof user.matricule,
      perPage,
      page,
      search,
      agence,
      group,
      from,
      to
    );

    const clients = await getClientContacteByZoneAdminAgence(
      user.matricule,
      perPage,
      page,
      search,
      agence,
      group,
      from,
      to
    );

    return res.status(StatusCodes.OK).send(json(clients));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const getClientContacteByZoneAdminAgence = async (
  matricule: string,
  perPage: number,
  page: number,
  search: string,
  agence: number,
  groupe: number,
  from: number,
  to: number
) => {
  try {
    let whereClose: any = {};

    const jour = await db.ab_param.findFirst({
      where: {
        code: "LETTRE",
      },
      select: {
        jour: true,
      },
    });

    const jourf = await db.ab_param.findFirst({
      where: {
        code: "LETTRE",
      },
      select: {
        jourf: true,
      },
    });

    const montant_lettre = await db.ab_param.findFirst({
      where: {
        code: "LETTRE",
      },
      select: {
        montant_lettre: true,
      },
    });

    console.log(jour, jourf, montant_lettre);
    const montantLettreNumber = Number(
      montant_lettre?.montant_lettre?.toString()
    );
    // const montantLettreNumber=0
    // const jourNumber = 0;
    const jourNumber = Number(jour?.jour?.toString());
   const jourfNumber = Number(jourf?.jourf?.toString());
    //const jourfNumber = 0;

    if (matricule !== "1802") {
      const affectation = await getAffectation(matricule);
      
      whereClose = {
        AND: [
          {
            OR: [{ etat_lettre: null }, { etat_lettre: "N" }],
          },
          {
            OR: [{ susp_lr: "N" }, { susp_lr: null }],
          },
          // { nombre_jours: { gte: jour.jour.toString(), lte: jourf.jourf.toString() } },
          { mnt_imp: { gte: montantLettreNumber } },
          { phase: "C" },
          { groupe: { in: ["910"] } },
        ],
      };
    }
    if (matricule === "1802") {
      whereClose = {
        AND: [
          {
            OR: [{ etat_lettre: null }, { etat_lettre: "N" }],
          },
          {
            OR: [{ susp_lr: "N" }, { susp_lr: null }],
          },
          // { nombre_jours: { gte: jour.jour.toString(), lte: jourf.jourf.toString() } },

          { mnt_imp: { gte: montantLettreNumber } },
          { phase: "C" },
        ],
      };
    }

    if (to !== 0) {
      whereClose.nombre_jours = { lte: to, gte: from };
    }

    if (groupe !== 0) {
      whereClose.groupe = groupe;
    }

    if (agence !== 0) {
      whereClose.age = agence;
    }

    if (search !== "") {
      whereClose.nom = { contains: search.toLowerCase() };
    }

    const result = await db.ab_compte.findMany({
      where: whereClose,
      select: SELECT_FIELDS,
      skip: perPage * (page - 1),
      take: perPage,
    });

    const total = await db.ab_compte.aggregate({
      where: whereClose,
      _sum: {
        mnt_imp: true,
        depassement: true,
        tot_creance: true,
        tot_eng: true,
      },
      _count: true,
    });

    if (search !== "") {
      whereClose.nom = { contains: search.toLowerCase() };
    }
    const lowerCaseResult = result.map((item) => ({
      ...item,
      nom: item?.nom?.toLowerCase(),
    }));
    const totalCount = await db.ab_compte.count({
      where: whereClose,
    });
    const totalPages = Math.ceil(totalCount / perPage);
    return {
      result: lowerCaseResult,
      totalCount,
      totalPages,
      total: total._sum,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error retrieving client contacts.");
  }
};

export const toggleEtatLettre = async (req: Request, res: Response) => {
  try {
    const ncp = String(req.query.ncp);
    const { etat } = req.body;
    const lettre = await db.ab_compte.update({
      where: {
        ncp: ncp,
      },
      data: { etat_lettre: etat },
      select: {
        etat_lettre: true,
      },
    });
    return res.status(StatusCodes.OK).send(json(lettre));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};
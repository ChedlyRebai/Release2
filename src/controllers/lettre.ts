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
  Agence: true,
  ab_client: {
    select: {
      Agence: true,
      cli: true,
      id: true,
      nom: true,
      tel1: true,
      tel2: true,
      email: true,
      groupe: true,
      nombre_jours: true,
      nombre_jours_sdb: true,
      phase: true,
      etat_lettre: true,
      susp_lr: true,
      mnt_imp: true,

      Zone: true,
      tot_creance: true,
      max_nbj: true,

      depassement: true,

      nbre_imp: true,
    },
  },
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

    const clients = await getLettre(
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

const getLettre = async (
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
    let whereClose: any = {
      ab_client: {},
    };
    console.log(matricule);
    const lettre = await db.ab_param.findFirst({
      where: {
        code: "LETTRE",
      },
      select: {
        jour: true,
        jourf: true,
        montant_lettre: true,
      },
    });

    const jourf = lettre?.jourf;
    const jour = lettre?.jour;
    const montant_lettre = lettre?.montant_lettre;

    console.log(jour, jourf, montant_lettre);
    const montantLettreNumber = Number(montant_lettre?.toString());
    // const montantLettreNumber=0
    // const jourNumber = 0;
    const jourNumber = Number(jour?.toString());
    const jourfNumber = Number(jourf?.toString());
    //const jourfNumber = 0;

    const affectation = await db.affecterA.findFirst({
      where: {
        Utilisateur: {
          usr_matricule: matricule,
        },
      },
      select: {
        TypeAffectation: true,
        TypesAffectation: true,
        Agence: true,
        Zone: true,
      },
    });
    console.log(affectation, "affectation");
    console.log(affectation.Agence, "affectation");
    console.log(affectation.Zone, "affectation");

    if (Number(affectation.TypeAffectation) === 4) {
      //grooup
      console.log("group");
      whereClose = {
        AND: [
          {
            OR: [{ etat_lettre: null }, { etat_lettre: "N" }],
          },

          // { nombre_jours: { gte: jour.jour.toString(), lte: jourf.jourf.toString() } },
          { mnt_imp: { gte: montantLettreNumber } },
          { phase: "C" },
          { Zone: affectation.Zone },
          // { groupe: { in: ["910"] } },
        ],
      };
    }
    if (Number(affectation.TypeAffectation) === 1) {
      //agence
      console.log("agence");

      whereClose = {
        AND: [
          {
            OR: [{ etat_lettre: null }, { etat_lettre: "N" }],
          },

          // { nombre_jours: { gte: jour.jour.toString(), lte: jourf.jourf.toString() } },

          { mnt_imp: { gte: montantLettreNumber } },
          { phase: "C" },
          { Agence: affectation.Agence },
        ],
      };
    }

    if (Number(affectation.TypeAffectation) === 3) {
      //grooup
      console.log(search, "search before result");

      console.log("group");
      whereClose = {
        AND: [
          {
            OR: [{ etat_lettre: null }, { etat_lettre: "N" }],
          },

          // { nombre_jours: { gte: jour.jour.toString(), lte: jourf.jourf.toString() } },
          //{ mnt_imp: { gte: montantLettreNumber } },
          { phase: "C" },
          // { groupe: { in: ["910"] } },
        ],
      };
    }
    console.log(montantLettreNumber, "montantLettreNumber");
    console.log("eeee", search, "whereClose before result");

    if (search !== undefined && search !== "") {
      whereClose.cli = { equals: BigInt(search) };
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

    // if (search !== "" && !isNaN(Number(search))) {
    //   whereClose.cli = { equals: BigInt(search) };
    // }
    // if (search !== undefined || search !== "") {
    //   whereClose.cli = { contains: search };
    // }

    console.log(whereClose, "whereClose before result");
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

    // if (search !== "") {
    //   whereClose.nom = { contains: search.toLowerCase() };
    // }

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
        ncp: true,
        nom: true,
        cli: true,
        etat_lettre: true,
      },
    });
    console.log(lettre);
    return res.status(StatusCodes.OK).send(json(lettre));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

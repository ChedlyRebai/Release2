import { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { db } from "../../prisma/db";
import jwt, { JwtPayload } from "jsonwebtoken";
import { json } from "../../public/utils";

export const getAllAlerts = async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const user = jwt.decode(token) as JwtPayload;
  const perPage = Number(req.query.perpage) || 5;
  console.log("perpage:", perPage);
  const page = Number(req.query.page) || 1;
  const search = String(req.query.search) || "";

  try {
    const alertes = await db.alerte.findMany({
      select: {
        message: true,
        id: true,
        rapportid: true,
        rapporttype: true,
        ab_client: {
          select: {
            cli: true,
            Agence: true,
            nom: true,
            tel1: true,
            tel2: true,
          },
        },
        compterendutype: {
          select: {
            types: {
              select: {
                libelle: true,
              },
            },
          },
        },
      },
      skip: perPage * (page - 1),
      take: perPage,
    });
    const totalCount: number = await db.alerte.count({});
    const totalPages: number = Math.ceil(totalCount / perPage);

    const n: any = { alertes, totalCount, totalPages };
    res.status(StatusCodes.OK).type("json").send(json(n));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

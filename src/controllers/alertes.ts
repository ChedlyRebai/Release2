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
            Zone: true,
            nom: true,
            tel1: true,
            tel2: true,
            email: true,
          },
        },
        created_at: true,

        types: {
          select: {
            libelle: true,
          },
        },
        comptrendutype: true,
        suivi_agenda: {
          select: {
            compterendutype_compterendutype_compterenduidTosuivi_agenda: {
              select: {
                types: {
                  select: {
                    libelle: true,
                  },
                },
              },
            },
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
      orderBy: {
        created_at: "desc",
      },
    });

    const totalCount: number = await db.alerte.count({});
    const totalPages: number = Math.ceil(totalCount / perPage);
    console.log("Pages:", page);
    console.log("alertes:", alertes);
    const n: any = { alertes, totalCount, totalPages };
    res.status(StatusCodes.OK).type("json").send(json(n));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

export const getAlertById = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const alerte = await db.alerte.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        message: true,
        id: true,
        rapportid: true,
        rapporttype: true,
        created_at: true,
        compterendutype: {
          select: {
            types: {
              select: {
                libelle: true,
              },
            },
          },
        },
        ab_client: {
          select: {
            cli: true,
            Agence: true,
            Zone: true,
            nom: true,
            tel1: true,
            tel2: true,
            email: true,
          },
        },
        types: {
          select: {
            libelle: true,
          },
        },
        // compterendutype: {
        //   select: {
        //     types: {
        //       select: {
        //         libelle: true,
        //       },
        //     },
        //   },
        // },
      },
    });
    if (alerte) {
      res.status(StatusCodes.OK).type("json").send(json(alerte));
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Alerte not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

export const getTypes = async (req: Request, res: Response) => {
  try {
    const types = await db.alerte.findMany({
      distinct: ["rapporttype"],
      select: {
        rapporttype: true,
        types: {
          select: {
            libelle: true,
          },
        },
      },
    });

    res.status(StatusCodes.OK).type("json").send(json(types));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

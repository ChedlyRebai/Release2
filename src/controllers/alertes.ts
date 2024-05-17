import { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { db } from "../../prisma/db";

export const getAllAlerts = async (req: Request, res: Response) => {
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
    });
    return res.status(StatusCodes.OK).json(alertes);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

// export const getAlertes = async (req: Request, res: Response) => {
//   try {
//     const alertes = await db.suivi_agenda.findMany({
//         orderBy:[
//             {date_visite: 'asc'},
//             {date_cinq_ech: 'asc'},
//             {date_deuxi_ech: 'asc'},
//             {date_prem_ver: 'asc'},
//             {date_quat_ech: 'asc'},
//             {date_trois_ech: 'asc'},
//             {date_rdv: 'asc'},
//         ],
//         select: {
//             cli: true,
//             num: true,
//             date_ag: true,
//             compte_rendu: true,
//             usr_nom: true,
//             id: true,
//             date_visite: true,
//             date_cinq_ech: true,
//             date_deuxi_ech: true,
//             date_prem_ver: true,
//             date_quat_ech: true,
//             date_trois_ech: true,
//             date_rdv: true,
//         },
//     })
//     return res.status(StatusCodes.OK).json(alertes)
//   } catch (error) {
//     console.error(error);
//     res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ message: "Internal Server Error" });
//   }
// };

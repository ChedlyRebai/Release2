import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../../prisma/db";
import {json} from "../../public/utils"
export const getAgence = async (req: Request, res: Response) => {
  try {
    
    const agences = await db.agence.findMany();
    return res.status(StatusCodes.OK).type('json').send(json(agences));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

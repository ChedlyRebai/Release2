import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../../prisma/db";
import {json} from "../../public/utils"
export const getMotifs = async (req: Request, res: Response) => {
  try {
    
    const motifs = await db.agence.findMany();
    return res.status(StatusCodes.OK).type('json').send(json(motifs));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

export const listchoix = async (req: Request, res: Response) => {
  try {
    const choix = await db.listechoix.findMany();
    return res.status(StatusCodes.OK).json(choix);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
}

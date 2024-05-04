import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../../prisma/db";
import { json } from "../../public/utils";
export const getMotifs = async (req: Request, res: Response) => {
  try {
    const motifs = await db.listechoix.findMany();
    return res.status(StatusCodes.OK).type("json").send(json(motifs));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

export const contact = async (req: Request, res: Response) => {
  try {
    const choix = await db.motifimp.findMany();
    return res.status(StatusCodes.OK).json(choix);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

export const getAppreciation = async (req: Request, res: Response) => {
  try {
    const appreciations = await db.appreciation.findMany();
    return res.status(StatusCodes.OK).json(appreciations);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

export const gethrdv = async (req: Request, res: Response) => {
  try {
    const hr = await db.h_rdv.findMany();
    return res.status(StatusCodes.OK).json(hr);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

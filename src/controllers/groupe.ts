import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../../prisma/db";
import { json } from "../../public/utils";

export const getGroup = async (req: Request, res: Response) => {
  try {
    const groupes = await db.zone.findMany();
    return res.status(StatusCodes.OK).type("json").send(json(groupes));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../../prisma/db";
import { json } from "../../public/utils";

export const deleteFileById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.query.id) || 0;
    const documents = await db.files.delete({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
    return res.status(StatusCodes.OK).type("json").send(json(documents));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

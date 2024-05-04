
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../../prisma/db";
import { json } from "../../public/utils";

export default json;
export const getCompterendu = async (req: Request, res: Response) => {
  try {
    const cli = Number(req.query.cli);
    const client = await db.suivi_agenda.findFirst({
      where: {
        cli: cli,
      },
    });

    //res.status(200).type("json").send(json(users))

    console.log(client);
    return res.status(StatusCodes.OK).type("json").send(json(client));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

export const getListCompte = async (req: Request, res: Response) => {
  try {
    const cli = Number(req.query.cli);
    const listCompte = await db.ab_compte.findMany({
      where: {
        cli: cli,
      },
      select: {
        age: true,
        cli: true,
        ncp: true,
        nom: true,
        nbre_imp: true,
        mnt_imp: true,
        nombre_jours: true,
        mnt_sdb: true,
        depassement: true,
        nombre_jours_sdb: true,
        tot_creance: true,
        max_nbj: true,
      },
    });

    return res.status(StatusCodes.OK).type("json").send(json(listCompte));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

export const getHistoriqueCompteRendu = async (req: Request, res: Response) => {
  try {
    const cli = Number(req.query.cli);
    const listHistorique = await db.suivi_agenda.findMany({
      where: {
        cli: cli,
      },
      select: {
        num: true,
        date_ag: true,
        compte_rendu: true,
        usr_nom: true,
        id: true,
      },
    });

    return res.status(StatusCodes.OK).type("json").send(json(listHistorique));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};
export const createCompteRendu = async (req: Request, res: Response) => {
  try {
    const { user, suiviAgenda, compteRendu, cli, clientInjoignableId } = req.body;

    // Fetching the number of existing suivi_agenda entries for the specified client
    const num = await db.suivi_agenda.count({
      where: {
        cli: cli,
      },
    });

    // Creating the new compterendu entry
    const newCompteRendu = await db.suivi_agenda.create({
      data: {
        // Assuming id is autoincremented and unique, you don't need to specify it
        num: num + 1, // Incrementing num
        cli: cli,
        date_ag: new Date(), // Assuming you want the current date
        compte_rendu: compteRendu,
        usr_nom: user.role,
        usr_matricule: user.matricule,
        
      },
    });

    console.log(newCompteRendu);
    return res.status(StatusCodes.OK).json(newCompteRendu);
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
  }
};

export const getCompteRenduById = async (req: Request, res: Response) => {
  try {
    // const { cli, date_ag, num,compte_rendu, usr_nom, usrmatricule } = req.body;
    const id = Number(req.params.id);
    const CompteRendu = await db.suivi_agenda.findUnique({
      where: {
        id,
      },
      select: {
        num: true,
        motifimp: {
          select:{
            code: true,
            libelle: true,
          }
        },
        motifimpId: true,
        date_motif: true,
        info_motif: true,
        date_ag: true,
        compte_rendu: true,
        usr_nom: true,
        id: true,
        date_action: true,
        usr_matricule: true,
      },
    });
    console.log(CompteRendu);
    return res.status(StatusCodes.OK).type("json").send(json(CompteRendu));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};


export const getcompterendutypes = async (req: Request, res: Response) => { 
  try {
    const compterendutypes = await db.types.findMany();
    return res.status(StatusCodes.OK).type("json").send(json(compterendutypes));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
}
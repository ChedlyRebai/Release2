
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../../prisma/db";
import { json } from "../../public/utils";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Console } from "console";
import { montantfacilite } from "@prisma/client";


export const getCompterendu = async (req: Request, res: Response) => {
  try {
    const cli = Number(req.query.cli);
    const client = await db.suivi_agenda.findMany({
      where: {
        cli: cli,
      },
      select:{
        id:true,
        cli:true,
        compte_rendu:true,
         compterendutype_suivi_agenda_comptretypeidTocompterendutype:{
          select:{
            typeID:true,
            clientInjoignable: true,
            promesseregresseID:true,
            visite:true,
            FacilitePaiment:true,
            nonreconaissance:true,
            nouvellecoordonnees:true,
          }
         },
        compterendutype_compterendutype_compterenduidTosuivi_agenda:{
          select:{
            typeID:true,
            types:true,
          }
        },
      },
    });
    
    


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
    const { type, mnt_reg,observation,suiviAgenda, compteRendu, cli, clientInjoignableId } = req.body;
    
    // Fetching the number of existing suivi_agenda entries for the specified client
    // const num = await db.suivi_agenda.count({
    //   where: {
    //     cli: cli,
    //   },
    // });

    // // Creating the new compterendu entry
    // const newCompteRendu = await db.suivi_agenda.create({
    //   data: {
    //     //Assuming id is autoincremented and unique, you don't need to specify it
    //     num: num + 1,// Incrementing num
    //     cli: cli,
    //     date_ag: new Date(), // Assuming you want the current date
    //     compte_rendu: compteRendu,
    //     usr_nom: user.role,
    //     usr_matricule: user.matricule,
        
    //   },
    // });
    const token = req.headers.authorization as string;
    const user = jwt.decode(token) as JwtPayload;
    const conmpterendutypes = await db.types.findMany();
    console.log(user)
    const nouvelleCompteRendu = await db.suivi_agenda.create({
      data: {
        id:req.body.id,
        num: 1,
        cli: cli,
        date_ag: new Date(),
        compte_rendu: compteRendu,
        usr_nom: user.role,
        usr_matricule: user.matricule,
        comptretypeid:2
      },
    });
    if(type==1){
      const promesse = await db.promesseregresse.create({
        data: {
          mnt_reg: mnt_reg,
          lieu_ver: req.body.lieu_ver,
          date_ver: req.body.date_ver,
          suiviagendaid:nouvelleCompteRendu.id
        },
      });
      

      const compterendutype=await db.compterendutype.create({
        data:{
          compterenduid:nouvelleCompteRendu.id,
          promesseregresseID:promesse.id,
          typeID:1
        }
      })

      return res.status(StatusCodes.OK).json({promesse,compterendutype});

    }
    console.log(type)
    if(type==2){
      const novellecoordonnee = await db.nouvellecoordonnees.create({
        data: {
          nouv_te2: req.body.nouv_te2,
          nouv_tel: req.body.nouv_tel,
          nouv_adresse: req.body.nouv_adresse,
          suiviagendaid:nouvelleCompteRendu.id
        },
      });
      const compterendutype=await db.compterendutype.create({
        data:{
          compterenduid:nouvelleCompteRendu.id,
          nouvellecoordonneesID:novellecoordonnee.id,
          typeID:2
        }
      })

      return res.status(StatusCodes.OK).json(novellecoordonnee);
    }

    if(type==3){
      const newFacilitePaiment = await prisma.facilitePaiment.create({
        data: {
          nb_ech: req.body.nb_ech,
          mnt_rec: req.body.mnt_rec,
          lieu_rec: req.body.lieu_rec,
          suiviagendaid:nouvelleCompteRendu.id,
        },
      });

      const montantFacilites = req.body.montantFacilites;

      await Promise.all(montantFacilites.map(async (montantFacilite:montantfacilite) => {
        console.log(montantFacilite);
        await prisma.montantfacilite.create({
          data: {
            ...montantFacilite,
            facilitePaimentId: newFacilitePaiment.id,
          },
        });
      }));

      const compterendutype=await db.compterendutype.create({
        data:{
          compterenduid:nouvelleCompteRendu.id,
          facilitePaimentId:newFacilitePaiment.id,
          typeID:2
        }
      })
    }

    if(type==4){
      const nonreconaissance = await db.nonreconaissance.create({
        data: {
          observation:observation
        },
      });
      const compterendutype=await db.compterendutype.create({
        data:{
          compterenduid:nouvelleCompteRendu.id,
          nonReconnaissanceID:nonreconaissance.id,
          typeID:4
        }
      })
      return res.status(StatusCodes.OK).json(compterendutype);
    }

    if(type==5){
      const visite = await db.visite.create({
        data: {
          date_visite: req.body.date_visite,
          h_rdv: req.body.h_rdv,
          lieu_visite: req.body.lieu_visite,

        },
      });
      const compterendutype=await db.compterendutype.create({
        data:{
          compterenduid:nouvelleCompteRendu.id,
          visiteId:visite.id,
          typeID:5
        }
      })
      return res.status(StatusCodes.OK).json(visite);
    }

    if(type==6){
      const clientInjoignable = await db.clientInjoignable.create({
        data: {
          lieu_ver: "lieu_ver",
        },
      });
      const compterendutype=await db.compterendutype.create({
        data:{
          compterenduid:nouvelleCompteRendu.id,
          ClientInjoignableId:clientInjoignable.id,
          typeID:5
        }
      })
      return res.status(StatusCodes.OK).json(clientInjoignable);

    }

    console.log(req.body);
    return res.status(StatusCodes.OK).json(req.body);
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
  }
};
export const createCompteRend = async (req: Request, res: Response) => {
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
        //Assuming id is autoincremented and unique, you don't need to specify it
        num: num + 1,// Incrementing num
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
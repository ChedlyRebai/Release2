import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { db } from "../../prisma/db";
import { json } from "../../public/utils";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Console } from "console";
import { montantfacilite } from "@prisma/client";
import { randomInt, randomUUID } from "crypto";

// export const getCompterendu = async (req: Request, res: Response) => {}
export const getCompterendu = async (req: Request, res: Response) => {
  try {
    const cli = Number(req.query.cli);
    const client = await db.suivi_agenda.findMany({
      where: {
        cli: cli,
      },
      select: {
        id: true,
        created_at: true,
        num: true,
        date_ag: true,
        compte_rendu: true,
        usr_nom: true,
        compterendutype_compterendutype_compterenduidTosuivi_agenda: {
          select: {
            typeID: true,
            types: true,
          },
        },
      },
    });

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
    const cli = String(req.query.cli);
    const listCompte = await db.ab_compte.findMany({
      where: {
        ab_client: {
          cli: cli,
        },
      },
      select: {
        ab_client: {
          select: {
            cli: true,
            nom: true,
            mnt_imp: true,
            tel1: true,
            tel2: true,
            addresse: true,
            email: true,
            trt: true,
            id: true,
            Agence: true,
            Zone: true,
          },
        },
        ncp: true,
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
        created_at: true,
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
    const {
      type,
      mnt_reg,
      observation,
      suiviAgenda,
      compteRendu,
      cli,
      clientInjoignableId,
    } = req.body;

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
    const client = await db.ab_client.findFirst({
      where: {
        cli: cli,
      },
      select: {
        id: true,
      },
    });
    await db.ab_client.update({
      where: {
        cli: cli,
      },
      data: {
        trt: "O",
      },
    });

    const nouvelleCompteRendu = await db.suivi_agenda.create({
      data: {
        num: 1,
        cli: cli,
        date_ag: new Date(),
        compte_rendu: compteRendu,
        usr_nom: user.role,
        usr_matricule: user.matricule,
        UtilisateurID: Number(user.id),
        ClientID: client.id,
      },
    });

    if (type == 1) {
      const promesse = await db.promesseregresse.create({
        data: {
          mnt_reg: suiviAgenda.mnt_reg,
          lieu_ver: suiviAgenda.lieu_ver,
          date_ver: suiviAgenda.date_ver,
        },
      });

      const compterendutype = await db.compterendutype.create({
        data: {
          compterenduid: nouvelleCompteRendu.id,
          promesseregresseID: promesse.id,
          typeID: 1,
        },
      });

      return res.status(StatusCodes.OK).json({ promesse, compterendutype });
    }

    if (type == 2) {
      const novellecoordonnee = await db.nouvellecoordonnees.create({
        data: {
          nouv_te2: suiviAgenda.nouv_tel2,
          nouv_tel: suiviAgenda.nouv_tel,
          nouv_adresse: suiviAgenda.nouv_adresse,
        },
      });
      await db.ab_client.update({
        where: {
          cli: cli,
        },
        data: {
          tel1: suiviAgenda.nouv_tel,
          tel2: suiviAgenda.nouv_tel2,
          addresse: suiviAgenda.nouv_adresse,
        },
      });

      const compterendutype = await db.compterendutype.create({
        data: {
          compterenduid: nouvelleCompteRendu.id,
          nouvellecoordonneesID: novellecoordonnee.id,
          typeID: 2,
        },
      });

      return res.status(StatusCodes.OK).json(novellecoordonnee);
    }

    if (type == 3) {
      const newFacilitePaiment = await prisma.facilitePaiment.create({
        data: {
          id: randomInt(1, 1000),
          nb_ech: suiviAgenda.nb_ech,
          mnt_rec: suiviAgenda.mnt_plan,
          lieu_rec: suiviAgenda.lieu_rec,
          suiviagendaid: nouvelleCompteRendu.id,
        },
      });
      console.log("newFacilitePaiment", newFacilitePaiment);
      const montantFacilites = suiviAgenda.montantFacilites;
      console.log("mmmmmmmmmmmmmmmmmmmmmmmmm", montantFacilites);
      await Promise.all(
        montantFacilites.map(async (montantFacilite: montantfacilite) => {
          console.log(montantFacilite);
          await prisma.montantfacilite.create({
            data: {
              ...montantFacilite,
              //id: randomInt(1, 99999999),
              facilitePaimentId: newFacilitePaiment.id,
            },
          });
        })
      );

      const compterendutype = await db.compterendutype.create({
        data: {
          compterenduid: nouvelleCompteRendu.id,
          facilitePaimentId: newFacilitePaiment.id,
          typeID: 3,
        },
      });
      console.log("compterendutype", compterendutype);
    }

    if (type == 4) {
      const nonreconaissance = await db.nonreconaissance.create({
        data: {
          observation: suiviAgenda.observation,
        },
      });

      const compterendutype = await db.compterendutype.create({
        data: {
          compterenduid: nouvelleCompteRendu.id,
          nonReconnaissanceID: nonreconaissance.id,
          typeID: 4,
        },
      });
      return res.status(StatusCodes.OK).json(compterendutype);
    }

    if (type == 5) {
      const visite = await db.visite.create({
        data: {
          date_visite: suiviAgenda.date_visite,
          h_rdv: 2,
          lieu_visite: suiviAgenda.lieu_visite,
        },
      });
      const compterendutype = await db.compterendutype.create({
        data: {
          compterenduid: nouvelleCompteRendu.id,
          visiteId: visite.id,
          typeID: 5,
        },
      });
      return res.status(StatusCodes.OK).json(visite);
    }

    if (type == 6) {
      const clientInjoignable = await db.clientInjoignable.create({
        data: {
          lieu_ver: "lieu_ver",
        },
      });
      const compterendutype = await db.compterendutype.create({
        data: {
          compterenduid: nouvelleCompteRendu.id,
          ClientInjoignableId: clientInjoignable.id,
          typeID: 6,
        },
      });
      return res.status(StatusCodes.OK).json(clientInjoignable);
    }

    console.log(req.body);
    return res.status(StatusCodes.OK).json(req.body);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

export const getCompteRenduById = async (req: Request, res: Response) => {
  try {
    // const { cli, date_ag, num,compte_rendu, usr_nom, usrmatricule } = req.body;
    let CompteRendu: any = {};
    const id = Number(req.params.id);
    if (id === 0) {
      CompteRendu = await db.suivi_agenda.findFirst({
        where: {
          id,
        },
        // select: {
        //   num: true,
        //   motifimp: {
        //     select:{
        //       code: true,
        //       libelle: true,
        //     }
        //   },
        //   compterendutype_compterendutype_compterenduidTosuivi_agenda:{
        //     select:{
        //       typeID:true,
        //       types:true,
        //     }

        //   },
        //   motifimpId: true,
        //   date_motif: true,
        //   info_motif: true,
        //   date_ag: true,
        //   compte_rendu: true,
        //   usr_nom: true,
        //   id: true,
        //   date_action: true,
        //   usr_matricule: true,
        //  },
        select: {
          created_at: true,
          id: true,
          cli: true,
          compte_rendu: true,
          usr_nom: true,
          ab_client: {
            select: {
              id: true,
              nom: true,
              cli: true,
            },
          },
          compterendutype_compterendutype_compterenduidTosuivi_agenda: {
            select: {
              typeID: true,
              types: true,
              clientInjoignable: {
                select: {
                  lieu_ver: true,
                },
              },
              promesseregresse: {
                select: {
                  mnt_reg: true,
                  lieu_ver: true,
                  date_ver: true,
                },
              },

              ClientInjoignableId: true,
              promesseregresseID: true,
              visite: {
                select: {
                  date_visite: true,
                  h_rdv_visite_h_rdvToh_rdv: {
                    select: {
                      libelle: true,
                    },
                  },
                  Agence: {
                    select: {
                      libelle: true,
                    },
                  },

                  lieu_visite: true,
                  h_rdv: true,
                },
              },

              visiteId: true,
              
              nouvellecoordonnees: {
                select: {
                  nouv_te2: true,
                  nouv_tel: true,
                  nouv_adresse: true,
                },
              },

              nouvellecoordonneesID: true,
   
              facilitePaimentId: true,
              FacilitePaiment: {
                select: {
                  nb_ech: true,
                  mnt_rec: true,
                  lieu_rec: true,
                  montantFacilites: {
                    select: {
                      mntech: true,
                      date_ech: true,
                    },
                  },
                },
              },

              nonReconnaissanceID: true,
              nonreconaissance: {
                select: {
                  observation: true,
                },
              },
            },
          },
        },
      });

      return res
        .status(StatusCodes.OK)
        .type("json")
        .send(json(CompteRendu || ({} as any)));
    }

    CompteRendu = await db.suivi_agenda.findUnique({
      where: {
        id,
      },

      select: {
        created_at: true,
        id: true,
        cli: true,
        compte_rendu: true,
        usr_nom: true,
        ab_client: {
          select: {
            nom: true,
            cli: true,
          },
        },
        compterendutype_compterendutype_compterenduidTosuivi_agenda: {
          select: {
            typeID: true,
            types: true,
            clientInjoignable: {
              select: {
                lieu_ver: true,
              },
            },

            promesseregresse: {
              select: {
                mnt_reg: true,
                lieu_ver: true,
                date_ver: true,
              },
            },

            ClientInjoignableId: true,
            promesseregresseID: true,
            visite: {
              select: {
                date_visite: true,
                h_rdv_visite_h_rdvToh_rdv: {
                  select: {
                    libelle: true,
                  },
                },
                Agence: {
                  select: {
                    libelle: true,
                  },
                },

                lieu_visite: true,
                h_rdv: true,
              },
            },

            visiteId: true,
            nouvellecoordonnees: {
              select: {
                nouv_te2: true,
                nouv_tel: true,
                nouv_adresse: true,
              },
            },

            nouvellecoordonneesID: true,
            facilitePaimentId: true,
            FacilitePaiment: {
              select: {
                nb_ech: true,
                mnt_rec: true,
                lieu_rec: true,
                montantFacilites: {
                  select: {
                    mntech: true,
                    date_ech: true,
                  },
                },
              },
            },

            nonReconnaissanceID: true,
            nonreconaissance: {
              select: {
                observation: true,
              },
            },
          },
        },
      },
    });

    return res
      .status(StatusCodes.OK)
      .type("json")
      .send(json(CompteRendu || ({} as any)));
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

export const getAllCompteRendu = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    const user = jwt.decode(token) as JwtPayload;
    const perPage = Number(req.query.perpage) || 5;
    console.log("perpage:", perPage);
    const page = Number(req.query.page) || 1;
    const search = String(req.query.search) || "";
    const selectedfields: any = {
      created_at: true,
      id: true,
      cli: true,
      compte_rendu: true,
      usr_nom: true,
      ab_client: {
        select: {
          nom: true,
          cli: true,
        },
      },
      compterendutype_compterendutype_compterenduidTosuivi_agenda: {
        select: {
          typeID: true,
          types: true,
          clientInjoignable: {
            select: {
              lieu_ver: true,
            },
          },
          promesseregresse: {
            select: {
              mnt_reg: true,
              lieu_ver: true,
              date_ver: true,
            },
          },

          ClientInjoignableId: true,
          promesseregresseID: true,
          visite: {
            select: {
              date_visite: true,
              h_rdv_visite_h_rdvToh_rdv: {
                select: {
                  libelle: true,
                },
              },
              Agence: {
                select: {
                  libelle: true,
                },
              },

              lieu_visite: true,
              h_rdv: true,
            },
          },
          visiteId: true,
          nouvellecoordonnees: {
            select: {
              nouv_te2: true,
              nouv_tel: true,
              nouv_adresse: true,
            },
          },
          nouvellecoordonneesID: true,
          facilitePaimentId: true,
          FacilitePaiment: {
            select: {
              nb_ech: true,
              mnt_rec: true,
              lieu_rec: true,
              montantFacilites: {
                select: {
                  mntech: true,
                  date_ech: true,
                },
              },
            },
          },
          nonReconnaissanceID: true,
          nonreconaissance: {
            select: {
              observation: true,
            },
          },
        },
      },
    };

    const CompteRendu: any = await db.suivi_agenda.findMany({
      select: selectedfields,
      skip: perPage * (page - 1),
      take: perPage,
      orderBy: {
        created_at: "desc",
      },
    });

    const totalCount: number = await db.suivi_agenda.count({});
    const totalPages: number = Math.ceil(totalCount / perPage);
    const n: any = { CompteRendu, totalCount, totalPages };
    res.status(StatusCodes.OK).type("json").send(json(n));
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
};

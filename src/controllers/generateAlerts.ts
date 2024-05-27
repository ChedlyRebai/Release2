import moment from "moment";
import { db } from "../../prisma/db";
import { SendEmail } from "./mail";

const generateAlerts = async () => {
  const today = moment().toDate();

  try {
    const visites = await db.visite.findMany({
      where: { date_visite: today },
      select: {
        date_visite: true,
        h_rdv: true,
        lieu_visite: true,

        Agence: {
          select: {
            libelle: true,
          },
        },
        compterendutype: {
          select: {
            compterenduid: true,
            typeID: true,
            suivi_agenda_compterendutype_compterenduidTosuivi_agenda: {
              select: {
                ClientID: true,
              },
            },
          },
        },
      },
    });

    // for (const visite of visites) {
    //   console.log("vite  ", visite.compterendutype[0]);
    //   await db.alerte.create({
    //     data: {
    //       message: `Visite scheduled for today at ${visite.date_visite}`,
    //       rapportid: visite.compterendutype[0].compterenduid,
    //       rapporttype: visite.compterendutype[0].typeID,
    //     },
    //   });
    // }

    const promesses = await db.promesseregresse.findMany({
      select: {
        date_ver: true,
        mnt_reg: true,
        Agence: {
          select: {
            libelle: true,
          },
        },
        compterendutype: {
          select: {
            compterenduid: true,
            typeID: true,
            suivi_agenda_compterendutype_compterenduidTosuivi_agenda: {
              select: {
                ClientID: true,
                ab_client: {
                  select: {
                    nom: true,
                    tel1: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const promesse of promesses) {
      await db.alerte
        .create({
          data: {
            message: `Promesse de Reglement prévue : ${promesse.date_ver
              .toString()
              .substring(0, 10)} , montant : ${promesse.mnt_reg} a ${
              promesse.Agence.libelle
            }`,
            rapportid: promesse.compterendutype[0].compterenduid,
            rapporttype: promesse.compterendutype[0].typeID,
            ClientId:
              promesse.compterendutype[0]
                .suivi_agenda_compterendutype_compterenduidTosuivi_agenda
                .ClientID,
          },
        })
        .then((res) => {
          SendEmail(
            `${promesse.compterendutype[0].suivi_agenda_compterendutype_compterenduidTosuivi_agenda.ab_client.email}`,
            `Promesse de Reglement`,
            `Promesse de Reglement prévue :
              ${promesse.date_ver.toLocaleDateString()} , montant :
               ${promesse.mnt_reg} a 
               ${promesse.Agence.libelle}`
          );
        });
    }

    // const nonreconaissances = await db.nonreconaissance.findMany({
    //   where:{date_ver:today},
    //   include: { compterendutype: true },
    // });
    // for (const nonreconaissance of nonreconaissances) {
    //   console.log("Nonreconaissance  ", nonreconaissance.compterendutype[0]);
    //   await db.alerte
    //     .create({
    //       data: {
    //         message: `Nonreconaissance scheduled for today at `,
    //         //rapportid: nonreconaissance.compterendutype[0].compterenduid,
    //         //rapporttype: "nonreconaissance",
    //       },
    //     })
    //     .then((res) => {
    //       console.log("Alerts res", res);
    //     });
    // }

    const montantFacilites = await db.montantfacilite.findMany({
      select: {
        mntech: true,
        date_ech: true,
        facilitePaiment: {
          select: {
            suiviagendaid: true,
            Agence: {
              select: {
                libelle: true,
              },
            },
            compterendutype: {
              select: {
                compterenduid: true,
                typeID: true,

                suivi_agenda_compterendutype_compterenduidTosuivi_agenda: {
                  select: {
                    ClientID: true,
                    ab_client: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    // console.log("montantFacilites", montantFacilites);
    for (const montantFacilite of montantFacilites) {
      // console.log(
      //   "MontantFacilite  ",
      //   montantFacilite?.facilitePaiment.compterendutype[0].compterenduid
      // );
      await db.alerte
        .create({
          data: {
            //create alerte message for each montantFacilite
            message: `paiement d'une échéance : ${montantFacilite?.date_ech
              .toString()
              .substring(0, 10)} , montant : ${montantFacilite?.mntech} a`,
            rapportid:
              montantFacilite?.facilitePaiment.compterendutype[0].compterenduid,
            rapporttype:
              montantFacilite?.facilitePaiment.compterendutype[0].typeID,
            ClientId:
              montantFacilite?.facilitePaiment.compterendutype[0]
                .suivi_agenda_compterendutype_compterenduidTosuivi_agenda
                .ClientID,
          },
        })
        .then((res) => {
          SendEmail(
            `${montantFacilite?.facilitePaiment.compterendutype[0].suivi_agenda_compterendutype_compterenduidTosuivi_agenda.ab_client.email}`,
            `paiement d'une échéance : 
             `,
            `paiement d'une échéance :
              ${montantFacilite?.date_ech.toLocaleDateString()} , montant :
               ${montantFacilite?.mntech} a 
               ${montantFacilite?.facilitePaiment.Agence.libelle}`
          );
        });
    }
    console.log("Alerts generated successfully.");
  } catch (error) {
    console.error("Error generating alerts:", error);
  } finally {
    await db.$disconnect();
  }
};
export default generateAlerts;

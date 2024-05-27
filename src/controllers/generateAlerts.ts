import moment from "moment";
import { db } from "../../prisma/db";

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
      where: { date_ver: today },
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
              },
            },
          },
        },
      },
    });
    console.log("Promesses ", promesses);

    for (const promesse of promesses) {
      console.log("Promesse type ", promesse.compterendutype[0]);
      console.log(
        "Promesse client  ",
        promesse.compterendutype[0]
          .suivi_agenda_compterendutype_compterenduidTosuivi_agenda.ClientID
      );
      await db.alerte
        .create({
          data: {
            message: `Promesse de Reglement prévue : ${promesse.date_ver
              .toString()
              .substring(0, 10)} , montant : ${promesse.mnt_reg} a ${
              promesse.Agence.libelle
            }`,
            //rapportid: 54,
            //rapporttype: promesse.compterendutype[0].typeID,
            ClientId:
              promesse.compterendutype[0]
                .suivi_agenda_compterendutype_compterenduidTosuivi_agenda
                .ClientID,
          },
        })
        .then((res) => {
          //console.log(promesse.compterendutype[0]);
          console.log("Alerts res", res);
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
    console.log("today", today);
    const montantFacilites = await db.montantfacilite.findMany({
      where: { date_ech: today },
      select: {
        mntech: true,
        date_ech: true,
        facilitePaiment: {
          select: {
            suiviagendaid: true,

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
        },
      },
    });

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
          // console.log("Alerts res", res);
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

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

    for (const visite of visites) {
      console.log("vite  ", visite.compterendutype[0]);
      await db.alerte.create({
        data: {
          message: `Visite scheduled for today at ${visite.date_visite}`,
          rapportid: visite.compterendutype[0].compterenduid,
          rapporttype: visite.compterendutype[0].typeID,
        },
      });
    }

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
      console.log("Promesse type ", promesse.compterendutype[0].typeID);
      console.log(
        "Promesse client  ",
        promesse.compterendutype[0]
          .suivi_agenda_compterendutype_compterenduidTosuivi_agenda.ClientID
      );
      await db.alerte
        .create({
          data: {
            message: `Promesse de regresse scheduled for today at ${promesse.date_ver}`,
            rapportid: promesse.compterendutype[0].compterenduid,
            rapporttype: promesse.compterendutype[0].typeID,
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
      console.log("MontantFacilite  ", montantFacilite.facilitePaiment);
      await db.alerte
        .create({
          data: {
            message: `MontantFacilite scheduled for today at ${montantFacilite.date_ech} , montant : ${montantFacilite.mntech}`,
            rapportid:
              montantFacilite.facilitePaiment.compterendutype[0].compterenduid,
            rapporttype:
              montantFacilite.facilitePaiment.compterendutype[0].typeID,
            ClientId:
              montantFacilite.facilitePaiment.compterendutype[0]
                .suivi_agenda_compterendutype_compterenduidTosuivi_agenda
                .ClientID,
          },
        })
        .then((res) => {
          console.log("Alerts res", res);
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

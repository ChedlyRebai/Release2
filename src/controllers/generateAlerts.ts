import moment from "moment";
import { db } from "../../prisma/db";

const generateAlerts = async () => {
  const today = moment().startOf("day").toDate();

  try {
    const visites = await db.visite.findMany({
      where: { date_visite: today },
      include: { compterendutype: true },
    });

    for (const visite of visites) {
      console.log("vite  ", visite.compterendutype[0].compterenduid);
      await db.alerte.create({
        data: {
          message: `Visite scheduled for today at ${visite.date_visite}`,
          rapportid: visite.compterendutype[0].compterenduid,
          rapporttype: "visite",
        },
      });
    }

    const promesses = await db.promesseregresse.findMany({
      include: { compterendutype: true },
    });

    for (const promesse of promesses) {
      console.log("Promesse  ", promesse.compterendutype[0]);
      await db.alerte
        .create({
          data: {
            message: `Promesse de regresse scheduled for today at ${promesse.date_ver}`,
            rapportid: promesse.compterendutype[0].compterenduid,
            rapporttype: "promesseregresse",
          },
        })
        .then((res) => {
          console.log(promesse.compterendutype[0]);
          console.log("Alerts res", res);
        });
    }

    const nonreconaissances = await db.nonreconaissance.findMany({
      // where:{date_ver:today},
      include: { compterendutype: true },
    });
    for (const nonreconaissance of nonreconaissances) {
      console.log("Nonreconaissance  ", nonreconaissance.compterendutype[0]);
      await db.alerte
        .create({
          data: {
            message: `Nonreconaissance scheduled for today at `,
            //rapportid: nonreconaissance.compterendutype[0].compterenduid,
            rapporttype: "nonreconaissance",
          },
        })
        .then((res) => {
          console.log("Alerts res", res);
        });
    }

    // const montantFacilites = await db.montantfacilite.findMany({
    //   //where:{date_ech:today},
    //   select: {
    //     mntech: true,
    //     date_ech: true,
    //   },
    // });
    // for (const montantFacilite of montantFacilites) {
    //   await db.alerte
    //     .create({
    //       data: {
    //         message: `MontantFacilite scheduled for today at ${montantFacilite.date_ech} , montant : ${montantFacilite.mntech}`,
    //         // rapportid: montantFacilite.mntech,
    //         rapporttype: "montantfacilite",
    //       },
    //     })
    //     .then((res) => {
    //       console.log("Alerts res", res);
    //     });
    // }
    console.log("Alerts generated successfully.");
  } catch (error) {
    console.error("Error generating alerts:", error);
  } finally {
    await db.$disconnect();
  }
};
export default generateAlerts;

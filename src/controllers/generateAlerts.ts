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
      await db.alerte.create({
        data: {
          message: `Visite scheduled for today at ${visite.date_visite}`,
          //rapportId: visite.compterendutype[0].id,
          //rapportType: "visite",
        },
      });
    }

    const promesses = await db.promesseregresse.findMany({
      where: { date_ver: today },
      include: { compterendutype: true },
    });

    for (const promesse of promesses) {
      await db.alerte.create({
        data: {
          message: `Promesse de regresse scheduled for today at ${promesse.date_ver}`,
          //   rapportId: promesse.compterendutype.id,
          //   rapportType: "promesseregresse",
        },
      });
    }

    // Add similar blocks for other types like `nouvellecoordonnees`, `nonreconaissance`, etc.

    console.log("Alerts generated successfully.");
  } catch (error) {
    console.error("Error generating alerts:", error);
  } finally {
    await db.$disconnect();
  }
};

generateAlerts();

import moment from "moment";
import { db } from "../../prisma/db";
import { SendEmail } from "./mail";
import { log } from "console";

const generateAlerts = async () => {
  const today = moment().toDate();
  try {
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
      const message = `Une promesse de règlement est prévue le ${promesse.date_ver.toLocaleDateString()} avec un montant de ${
        promesse.mnt_reg
      } DT à ${promesse.Agence.libelle}`;

      await db.alerte
        .create({
          data: {
            message: message,
            rapportid: promesse.compterendutype[0].compterenduid,
            rapporttype: promesse.compterendutype[0].typeID,
            ClientId:
              promesse.compterendutype[0]
                .suivi_agenda_compterendutype_compterenduidTosuivi_agenda
                .ClientID,
          },
        })

        .then((res) => {
          const Clientmessage = `Cher client, une promesse de règlement est prévue le ${promesse.date_ver.toLocaleDateString()} avec un montant de ${
            promesse.mnt_reg
          }DT à ${
            promesse.Agence.libelle
          }. Veuillez vous assurer de compléter le paiement à temps. Merci.`;

          SendEmail(
            `${promesse.compterendutype[0].suivi_agenda_compterendutype_compterenduidTosuivi_agenda.ab_client.email}`,
            `Rappel de Promesse de Règlement`,
            Clientmessage
          );
        });
    }

    const montantFacilites = await db.montantfacilite.findMany({
      where: { date_ech: today },
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

    for (const montantFacilite of montantFacilites) {
      const message = `Un paiement d'une échéance est dû le ${montantFacilite?.date_ech.toLocaleDateString()} avec un montant de ${
        montantFacilite?.mntech
      } DT à ${montantFacilite?.facilitePaiment.Agence.libelle}.`;

      await db.alerte
        .create({
          data: {
            message: message,
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
          const clientMessage = `Un paiement d'une échéance est dû le ${montantFacilite?.date_ech.toLocaleDateString()} avec un montant de ${
            montantFacilite?.mntech
          } DT à ${montantFacilite?.facilitePaiment.Agence.libelle}.`;

          SendEmail(
            `${montantFacilite?.facilitePaiment.compterendutype[0].suivi_agenda_compterendutype_compterenduidTosuivi_agenda.ab_client.email}`,
            `Rappel de paiement`,
            clientMessage
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

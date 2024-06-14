import moment from "moment";
import { db } from "../../prisma/db";
import { SendEmail } from "./mail";
import { log } from "console";

const generateAlerts = async () => {
  const today = moment().toDate();

  try {
    // const visites = await db.visite.findMany({
    //   where: { date_visite: today },
    //   select: {
    //     date_visite: true,
    //     h_rdv: true,
    //     lieu_visite: true,

    //     Agence: {
    //       select: {
    //         libelle: true,
    //       },
    //     },
    //     compterendutype: {
    //       select: {
    //         compterenduid: true,
    //         typeID: true,
    //         suivi_agenda_compterendutype_compterenduidTosuivi_agenda: {
    //           select: {
    //             ClientID: true,
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

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
    // ...

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

    // ...
    console.log("Alerts generated successfully.");
  } catch (error) {
    console.error("Error generating alerts:", error);
  } finally {
    await db.$disconnect();
  }
};
export default generateAlerts;

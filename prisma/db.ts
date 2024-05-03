import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

//it would cause issues in production
// because we have something called hot
// reload which means that every time a
//  file a new prisma client instance would
//   be created nad tha would easily overflow
//    your project and it's going to crush in
//     devellopement

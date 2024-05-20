import { exec } from "child_process";
//import cron from "node-cron";
// // Schedule the script to run every day at midnight
// cron.schedule("0 0 * * *", () => {
//   console.log("Running generateAlerts.js script...");
//   exec("../controllers/generateAlerts.ts", (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error executing script: ${error.message}`);
//       return;
//     }

//     if (stderr) {
//       console.error(`Script stderr: ${stderr}`);
//       return;
//     }

//     console.log(`Script stdout: ${stdout}`);
//   });
// });

// /cron/cron.ts

import cron from "node-cron";
import generateAlerts from "../controllers/generateAlerts";

// Schedule the script to run every day at midnight
cron.schedule("0 0 * *", () => {
  console.log("Running generateAlerts.ts script...");
  generateAlerts()
    .then(() => {
      console.log("generateAlerts script finished.");
    })
    .catch((error) => {
      console.error("Error executing generateAlerts script:", error);
    });
});

console.log("Cron job scheduled to run every day at midnight.");

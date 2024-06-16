import { exec } from "child_process";

import cron from "node-cron";
import generateAlerts from "../controllers/generateAlerts";

// Schedule the script to run every day at midnight
cron.schedule("07 01 * * *", () => {
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

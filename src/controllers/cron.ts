import { exec } from "child_process";
import cron from "node-cron";
// Schedule the script to run every day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running generateAlerts.js script...");
  exec("node path/to/generateAlerts.js", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
      return;
    }

    console.log(`Script stdout: ${stdout}`);
  });
});

import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import clientroute from "./routes/clientroute";
import compterenduroute from "./routes/compterendu";
import lettreroute from "./routes/lettrerecouvrement";
import "./controllers/cron"; // Import the cron module
import moment from "moment";
import alertsroute from "./routes/alerts";
import "./controllers/mail";
import generateAlerts from "./controllers/generateAlerts";
import { cron } from "../src/controllers/cron";
const app = express();

app.use(
  cors({
    credentials: true,
  })
);
app.use(compression({ level: 9 }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use("/client", clientroute);
app.use("/compterendu", compterenduroute);
app.use("/alerts", alertsroute);
app.use("/cron", cron);
const today = moment().toDate();

console.log("today", today);
app.use("/lettre", lettreroute);

const server = http.createServer(app);

server.listen(10002, () => {
  console.log("Sprint2 running on http://localhost:10002", today);
});

export default app;

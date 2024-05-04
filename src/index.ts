import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import clientroute from "./routes/clientroute";
import compterenduroute from "./routes/compterendu";
import lettreroute from "./routes/lettrerecouvrement";

const app = express();

app.use(
  cors({
    credentials: true,
  })
);
app.use(compression(
  { level: 9 }
));

app.use(cookieParser());
app.use(bodyParser.json());
app.use("/client", clientroute);
app.use('/compterendu',compterenduroute);
// compterendu/createcompterendu

app.use('/lettre',lettreroute);

const server = http.createServer(app);

server.listen(10001, () => {
  console.log("Sprint2 running on http://localhost:10001");
});

export default app;
import express from "express";
import http from "http";
import mysql from "mysql";
import morgan from "morgan";
import { Server as SocketServer } from "socket.io";
import { resolve, dirname } from "path";

import { PORT } from "./config.js";
import cors from "cors";

// Initializations
const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  // cors: {
  //   origin: "http://localhost:3000",
  // },
});

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

app.use(express.static(resolve("frontend/dist")));

io.on("connection", (socket) => {
  const room = socket.id;
  socket.join(room);
  //console.log(socket.id);
  socket.on("message", (body) => {
    const message = {
      body,
      from: socket.id.slice(8),
    };
    //io.to(room).emit("message", message);
    // Insertar el mensaje en la base de datos MySQL
    const sql = "INSERT INTO mensajes (`cuerpo`, `remitente`,`fecha` ) VALUES (?, ?, now())";
              

    const values = [message.body, message.from];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error al insertar el mensaje en la base de datos:", err);
      } else {
        console.log("Mensaje insertado en la base de datos");
      }
    });

    // Emitir el mensaje a todos los clientes conectados
    //socket.broadcast.emit("message", message);
  });
});

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "zYMU@zjlFxQYip_xkoaO@Vs",
  database: "ods",
});

db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
    throw err;
  }
  console.log("Conexión a la base de datos MySQL establecida");
});



server.listen(PORT);
console.log(`server on port ${PORT}`);

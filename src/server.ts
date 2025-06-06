import fastify from "fastify";
import { knex } from "./database";
import { randomUUID } from "node:crypto";
import cookie from "@fastify/cookie";
import { usersRoutes } from "./routes/users";

const app = fastify();

app.register(cookie);

app.register(usersRoutes, {
  prefix: "users",
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("http server running!");
  });

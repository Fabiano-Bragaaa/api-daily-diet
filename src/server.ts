import fastify from "fastify";
import { knex } from "./database";
import { randomUUID } from "node:crypto";

const app = fastify();

app.get("/hello", async () => {
  const createUser = await knex("users")
    .select("*")
    .where("password", "123")
    .select("*");

  return createUser;
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("http server running!");
  });

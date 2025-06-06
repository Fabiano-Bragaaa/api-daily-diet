import fastify from "fastify";

import cookie from "@fastify/cookie";
import { usersRoutes } from "./routes/users";
import { mealsRoutes } from "./routes/meals";

const app = fastify();

app.register(cookie);

app.register(usersRoutes, {
  prefix: "users",
});

app.register(mealsRoutes, {
  prefix: "meals",
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("http server running!");
  });

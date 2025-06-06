import { FastifyInstance } from "fastify";
import { checkSessionIdExist } from "../middlewares/check-session-id-exist";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExist],
    },
    async (request, response) => {
      const { sessionId } = request.cookies;

      const user = await knex("users").where("session_id", sessionId).first();

      response.status(200).send(user);
    }
  );
  app.post(
    "/",
    {
      preHandler: [checkSessionIdExist],
    },
    async (request, response) => {
      const { sessionId } = request.cookies;

      const user = await knex("users").where("session_id", sessionId).first();

      const createMeal = z.object({
        name: z.string(),
        description: z.string(),
        in_diet: z.boolean(),
      });

      const { description, in_diet, name } = createMeal.parse(request.body);

      await knex("meals").insert({
        id: randomUUID(),
        name,
        description,
        in_diet,
        user_id: user?.id,
      });

      response.status(201).send();
    }
  );
}

import { FastifyInstance } from "fastify";
import { checkSessionIdExist } from "../middlewares/check-session-id-exist";
import { knex } from "../database";
import { date, string, z } from "zod";
import { randomUUID } from "node:crypto";
import { getUserIdAndId } from "../utils/getUserIdAndId";
import { getUserId } from "../utils/getUserId";

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExist],
    },
    async (request) => {
      const { user_id } = await getUserId(request);

      const list = await knex("meals").where({ user_id }).select("*");

      return { list };
    }
  );
  app.post(
    "/",
    {
      preHandler: [checkSessionIdExist],
    },
    async (request, response) => {
      const { user_id } = await getUserId(request);

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
        user_id,
      });

      response.status(201).send();
    }
  );
  app.get(
    "/:id",
    { preHandler: [checkSessionIdExist] },
    async (request, response) => {
      const { id, user_id } = await getUserIdAndId(request);

      const meal = await knex("meals")
        .where({
          id,
          user_id,
        })
        .first();

      if (!meal) {
        return response.status(404).send({ error: "Refeição não encontrada" });
      }

      return { meal };
    }
  );
  app.patch(
    "/:id",
    { preHandler: [checkSessionIdExist] },
    async (request, response) => {
      const { id, user_id } = await getUserIdAndId(request);

      const updateMealSchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        in_diet: z.boolean().optional(),
        created_at: date().optional(),
      });

      const updates = updateMealSchema.parse(request.body);

      const meal = await knex("meals").where({ id, user_id }).first();

      if (!meal) {
        return response.status(404).send({ error: "Refeição não encontrada" });
      }

      await knex("meals").where({ id, user_id }).update(updates);

      const updatedMeal = await knex("meals").where({ id, user_id }).first();

      const formattedMeal = {
        ...updatedMeal,
        in_diet: Boolean(updatedMeal?.in_diet),
      };

      return { formattedMeal };
    }
  );
  app.delete(
    "/:id",
    { preHandler: [checkSessionIdExist] },
    async (request, response) => {
      const { id, user_id } = await getUserIdAndId(request);

      const deleteMeal = await knex("meals").where({ id, user_id }).del();

      if (deleteMeal === 0) {
        return response.status(404).send({ error: "Refeição não encontrada" });
      }

      return response.status(204).send();
    }
  );
}

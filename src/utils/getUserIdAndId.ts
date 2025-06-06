import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { knex } from "../database";

export async function getUserIdAndId(request: FastifyRequest) {
  const { sessionId } = request.cookies;

  const user = await knex("users").where("session_id", sessionId).first();

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const getMealSchema = z.object({
    id: z.string().uuid(),
  });

  const { id } = getMealSchema.parse(request.params);

  if (!id) {
    throw new Error("Id não encontrado");
  }

  return {
    user_id: user.id,
    id,
  };
}

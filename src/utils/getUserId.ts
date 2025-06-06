import { FastifyRequest } from "fastify";
import { knex } from "../database";

export async function getUserId(request: FastifyRequest) {
  const { sessionId } = request.cookies;

  const user = await knex("users").where("session_id", sessionId).first();

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  return {
    user_id: user.id,
  };
}

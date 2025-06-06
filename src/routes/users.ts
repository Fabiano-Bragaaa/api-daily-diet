import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";

const SALT_ROUNDS_NUMBER = 10;

export async function usersRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const users = await knex("users").select("*");

    return users;
  });
  app.post("/signUp", async (request, response) => {
    try {
      const createUserSchema = z.object({
        email: z
          .string()
          .email("Email inválido. Por favor, insira um email válido."),
        password: z
          .string()
          .min(6, "A senha precisa ter ao menos 6 caracteres")
          .regex(/[A-Z]/, "A senha precisa conter ao menos uma letra maiúscula")
          .regex(/\d/, "A senha precisa conter ao menos um número"),
      });

      const { email, password } = createUserSchema.parse(request.body);

      const existingUser = await knex("users").where({ email }).first();

      if (existingUser) {
        return response.status(409).send({ error: "Email já cadastrado" });
      }

      const saltRounds = SALT_ROUNDS_NUMBER;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await knex("users").insert({
        id: randomUUID(),
        email,
        password: hashedPassword,
      });

      return response.status(201).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).send({ errors: error.errors });
      }
      return response.status(500).send("Erro interno no servidor");
    }
  });
  app.post("/login", async (request, response) => {
    try {
      const loginUserSchema = z.object({
        email: z
          .string()
          .email("Email inválido. Por favor, insira um email válido."),
        password: z
          .string()
          .min(6, "A senha precisa ter ao menos 6 caracteres"),
      });

      const { email, password } = loginUserSchema.parse(request.body);

      const user = await knex("users").where({ email }).first();

      if (!user) {
        return response
          .status(401)
          .send({ error: "Email ou senha inválidos." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return response
          .status(401)
          .send({ error: "Email ou senha inválidos." });
      }

      let sessionId = request.cookies.sessionId;

      if (!sessionId) {
        sessionId = randomUUID();

        response.cookie("sessionId", sessionId, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }

      await knex("users").update({
        session_id: sessionId,
      });

      return response.status(201).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).send({ errors: error.errors });
      }
      return response.status(500).send("Erro interno no servidor");
    }
  });
}

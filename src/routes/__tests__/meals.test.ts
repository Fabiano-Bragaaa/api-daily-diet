import { afterAll, beforeAll, describe, expect, test } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { beforeEach } from "node:test";
import { execSync } from "node:child_process";

async function getCookie() {
  await request(app.server).post("/users/signUp").send({
    email: "fabianobraga@gmail.com",
    password: "Abc123",
  });

  const signInResponse = await request(app.server).post("/users/login").send({
    email: "fabianobraga@gmail.com",
    password: "Abc123",
  });

  const cookies = signInResponse.get("Set-Cookie") ?? [];

  return {
    cookies,
  };
}

async function createMealAndGetId() {
  const { cookies } = await getCookie();

  await request(app.server).post("/meals").set("Cookie", cookies).send({
    name: "Almoço",
    description: "Arroz e feijão",
    in_diet: true,
  });

  const list = await request(app.server).get("/meals").set("Cookie", cookies);

  const id = list.body.list[0].id;

  return { cookies, id };
}

describe("meals routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  test("user can create your meals", async () => {
    const { cookies } = await getCookie();

    const create = await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({ name: "Almoço", description: "Arroz e feijão", in_diet: true });

    expect(create.statusCode).toEqual(201);
  });
  test("user can list your meals", async () => {
    const { cookies } = await getCookie();

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({ name: "Almoço", description: "Arroz e feijão", in_diet: true });

    const list = await request(app.server).get("/meals").set("Cookie", cookies);

    expect(list.body.list[0]).toMatchObject({
      name: "Almoço",
      description: "Arroz e feijão",
      in_diet: 1,
    });
  });

  test("user can get meal by id", async () => {
    const { cookies, id } = await createMealAndGetId();

    const getList = await request(app.server)
      .get(`/meals/${id}`)
      .set("Cookie", cookies);

    expect(getList.body.meal).toMatchObject({
      id,
      name: "Almoço",
      description: "Arroz e feijão",
      in_diet: 1,
    });
  });

  test("user can delete meal by id", async () => {
    const { cookies, id } = await createMealAndGetId();

    const deleteMeal = await request(app.server)
      .delete(`/meals/${id}`)
      .set("Cookie", cookies);

    expect(deleteMeal.statusCode).toEqual(204);
  });

  test("user can patch meal by id", async () => {
    const { cookies, id } = await createMealAndGetId();

    const patchMeal = await request(app.server)
      .patch(`/meals/${id}`)
      .set("Cookie", cookies)
      .send({
        name: "Jantar",
        description: "Peixe e salada",
        in_diet: false,
      });

    expect(patchMeal.statusCode).toBe(200);

    const getList = await request(app.server)
      .get(`/meals/${id}`)
      .set("Cookie", cookies);

    expect(getList.body.meal).toMatchObject({
      id,
      name: "Jantar",
      description: "Peixe e salada",
      in_diet: 0,
    });
  });
});

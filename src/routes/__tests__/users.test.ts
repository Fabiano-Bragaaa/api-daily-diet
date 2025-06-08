import { afterAll, beforeAll, expect, test, describe } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { randomUUID } from "node:crypto";

describe("users route", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("user can create account", async () => {
    const resonse = await request(app.server).post("/users/signUp").send({
      email: "fabianobragaaaaa@gmail.com",
      password: "Abc123",
    });

    expect(resonse.statusCode).toEqual(201);
  });
});

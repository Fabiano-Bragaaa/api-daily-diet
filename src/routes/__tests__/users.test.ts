import {
  afterAll,
  beforeAll,
  expect,
  test,
  describe,
  beforeEach,
} from "vitest";
import request from "supertest";
import { app } from "../../app";
import { execSync } from "node:child_process";

describe("users route", () => {
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

  test("user can create account", async () => {
    const resonse = await request(app.server).post("/users/signUp").send({
      email: "fabianobraga@gmail.com",
      password: "Abc123",
    });

    expect(resonse.statusCode).toEqual(201);
  });

  test("user can login with your account", async () => {
    await request(app.server).post("/users/signUp").send({
      email: "fabianobraga@gmail.com",
      password: "Abc123",
    });

    const signInUser = await request(app.server).post("/users/login").send({
      email: "fabianobraga@gmail.com",
      password: "Abc123",
    });

    expect(signInUser.statusCode).toEqual(201);
  });
});

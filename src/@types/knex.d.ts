import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      id: string;
      email: string;
      password: string;
      created_at: string;
      session_id?: string;
    };
    meals: {
      id: string;
      user_id: string;
      name?: string;
      description?: string;
      created_at?: Date;
      in_diet?: boolean;
    };
  }
}

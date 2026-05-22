import { db } from "@hesapport-api/db";
import { todo } from "@hesapport-api/db/schema/todo";
import { eq } from "drizzle-orm";
import z from "zod";

import { requirePermission } from "../middleware/permission";
import { router } from "../index";

export const todoRouter = router({
  getAll: requirePermission({ todo: ["list"] }).query(async () => {
    return await db.select().from(todo);
  }),

  create: requirePermission({ todo: ["create"] })
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input }) => {
      return await db.insert(todo).values({
        text: input.text,
      });
    }),

  toggle: requirePermission({ todo: ["update"] })
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .mutation(async ({ input }) => {
      return await db.update(todo).set({ completed: input.completed }).where(eq(todo.id, input.id));
    }),

  delete: requirePermission({ todo: ["delete"] })
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.delete(todo).where(eq(todo.id, input.id));
    }),
});

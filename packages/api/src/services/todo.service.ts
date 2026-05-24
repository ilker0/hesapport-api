import { db } from "@hesapport-api/db";
import { todo } from "@hesapport-api/db/schema/todo";
import { eq } from "drizzle-orm";

import type { createTodoSchema, updateTodoSchema } from "../schemas/todo.schema";
import type { z } from "zod";

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

export async function listTodos() {
  return db.select().from(todo);
}

export async function createTodo(input: CreateTodoInput) {
  const [created] = await db.insert(todo).values({ text: input.text }).returning();
  return created;
}

export async function updateTodo(id: number, input: UpdateTodoInput) {
  const [updated] = await db
    .update(todo)
    .set({ completed: input.completed })
    .where(eq(todo.id, id))
    .returning();
  return updated;
}

export async function deleteTodo(id: number) {
  await db.delete(todo).where(eq(todo.id, id));
}

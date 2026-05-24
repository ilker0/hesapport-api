import { z } from "zod";

export const createTodoSchema = z.object({
  text: z.string().min(1),
});

export const updateTodoSchema = z.object({
  completed: z.boolean(),
});

export const todoIdParamSchema = z.coerce.number();

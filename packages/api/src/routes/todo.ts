import { Router } from "express";

import { asyncHandler } from "../lib/async-handler";
import { requireAuth } from "../middleware/require-auth";
import {
  createTodoSchema,
  todoIdParamSchema,
  updateTodoSchema,
} from "../schemas/todo.schema";
import * as todoService from "../services/todo.service";

export const todoRouter = Router();

todoRouter.use(requireAuth);

todoRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await todoService.listTodos();
    res.json({ todos: items });
  }),
);

todoRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createTodoSchema.parse(req.body);
    const created = await todoService.createTodo(body);
    res.status(201).json({ todo: created });
  }),
);

todoRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const body = updateTodoSchema.parse(req.body);
    const id = todoIdParamSchema.parse(req.params.id);
    const updated = await todoService.updateTodo(id, body);
    res.json({ todo: updated });
  }),
);

todoRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = todoIdParamSchema.parse(req.params.id);
    await todoService.deleteTodo(id);
    res.status(204).send();
  }),
);

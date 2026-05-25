import { action, page, query, route, type Part } from "@wasp.sh/spec";

import { group } from "../../main.wasp";
import { DemoAppPage } from "./DemoAppPage" with { type: "ref" };
import {
  createTask,
  deleteTask,
  generateGptResponse,
  getAllTasksByUser,
  getGptResponses,
  updateTask,
} from "./operations" with { type: "ref" };

export const demoAiAppParts: Part[] = [
  route("DemoAppRoute", "/demo-app", page(DemoAppPage, { authRequired: true })),

  query(getGptResponses, { entities: ["User", "GptResponse"] }),
  action(generateGptResponse, { entities: ["User", "Task", "GptResponse"] }),

  ...group({ entities: ["Task"] }, [
    query(getAllTasksByUser),
    action(createTask),
    action(updateTask),
    action(deleteTask),
  ]),
];

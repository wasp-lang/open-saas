import { action, page, query, route, type Part } from '@wasp.sh/spec'

import { DemoAppPage } from './DemoAppPage' with { type: 'ref' }
import {
  generateGptResponse,
  createTask,
  deleteTask,
  updateTask,
  getGptResponses,
  getAllTasksByUser,
} from './operations' with { type: 'ref' }

export const demoAiParts: Part[] = [
  route('DemoAppRoute', '/demo-app', page(DemoAppPage, { authRequired: true })),
  action(generateGptResponse, { entities: ['User', 'Task', 'GptResponse'] }),
  action(createTask, { entities: ['Task'] }),
  action(deleteTask, { entities: ['Task'] }),
  action(updateTask, { entities: ['Task'] }),
  query(getGptResponses, { entities: ['User', 'GptResponse'] }),
  query(getAllTasksByUser, { entities: ['Task'] }),
]

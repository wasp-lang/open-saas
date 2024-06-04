export type StripePaymentResult = {
  sessionUrl: string | null;
  sessionId: string;
};

export type SubscriptionStatusOptions = 'past_due' | 'canceled' | 'active' | 'deleted' | null;

export type Subtask = {
  description: string; // detailed breakdown and description of sub-task
  time: number; // total time it takes to complete given main task in hours, e.g. 2.75
  mainTaskName: string; // name of main task related to subtask
};

export type MainTask = {
  name: string;
  priority: 'low' | 'medium' | 'high';
};

export type GeneratedSchedule = {
  mainTasks: MainTask[]; // Main tasks provided by user, ordered by priority
  subtasks: Subtask[]; // Array of subtasks
};

export type FunctionCallResponse = {
  schedule: GeneratedSchedule[];
};

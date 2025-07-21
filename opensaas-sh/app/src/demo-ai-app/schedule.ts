export type TaskPriority = 'low' | 'medium' | 'high';

export type GeneratedSchedule = {
  tasks: Task[]; // Main tasks provided by user, ordered by priority
  taskItems: TaskItem[];
};

export type Task = {
  name: string;
  priority: TaskPriority;
};

export type TaskItem = {
  description: string;
  time: number; // total time it takes to complete given main task in hours, e.g. 2.75
  taskName: string; // name of main task related to subtask
};

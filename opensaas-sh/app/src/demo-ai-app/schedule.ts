export type GeneratedSchedule = {
  mainTasks: MainTask[]; // Main tasks provided by user, ordered by priority
  subtasks: SubTask[];
};

export type MainTask = {
  name: string;
  priority: 'low' | 'medium' | 'high';
};

export type SubTask = {
  description: string;
  time: number; // total time it takes to complete given main task in hours, e.g. 2.75
  mainTaskName: string; // name of main task related to subtask
};
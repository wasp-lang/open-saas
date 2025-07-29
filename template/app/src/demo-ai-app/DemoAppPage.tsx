import { type Task } from 'wasp/entities';

import {
  createTask,
  deleteTask,
  generateGptResponse,
  getAllTasksByUser,
  updateTask,
  useQuery,
} from 'wasp/client/operations';

import { Loader2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { cn } from '../lib/utils';
import type { GeneratedSchedule, Task as ScheduleTask, TaskItem, TaskPriority } from './schedule';

export default function DemoAppPage() {
  return (
    <div className='py-10 lg:mt-10'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
            <span className='text-primary'>AI</span> Day Scheduler
          </h2>
        </div>
        <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground'>
          This example app uses OpenAI's chat completions with function calling to return a structured JSON
          object. Try it out, enter your day's tasks, and let AI do the rest!
        </p>
        {/* begin AI-powered Todo List */}
        <Card className='my-8 bg-muted/10'>
          <CardContent className='sm:w-[90%] md:w-[70%] lg:w-[50%] py-10 px-6 mx-auto my-8 space-y-10'>
            <NewTaskForm handleCreateTask={createTask} />
          </CardContent>
        </Card>
        {/* end AI-powered Todo List */}
      </div>
    </div>
  );
}

function NewTaskForm({ handleCreateTask }: { handleCreateTask: typeof createTask }) {
  const [description, setDescription] = useState<string>('');
  const [todaysHours, setTodaysHours] = useState<number>(8);
  const [response, setResponse] = useState<GeneratedSchedule | null>({
    tasks: [
      {
        name: 'Respond to emails',
        priority: 'high' as TaskPriority,
      },
      {
        name: 'Learn WASP',
        priority: 'low' as TaskPriority,
      },
      {
        name: 'Read a book',
        priority: 'medium' as TaskPriority,
      },
    ],
    taskItems: [
      {
        description: 'Read introduction and chapter 1',
        time: 0.5,
        taskName: 'Read a book',
      },
      {
        description: 'Read chapter 2 and take notes',
        time: 0.3,
        taskName: 'Read a book',
      },
      {
        description: 'Read chapter 3 and summarize key points',
        time: 0.2,
        taskName: 'Read a book',
      },
      {
        description: 'Check and respond to important emails',
        time: 1,
        taskName: 'Respond to emails',
      },
      {
        description: 'Organize and prioritize remaining emails',
        time: 0.5,
        taskName: 'Respond to emails',
      },
      {
        description: 'Draft responses to urgent emails',
        time: 0.5,
        taskName: 'Respond to emails',
      },
      {
        description: 'Watch tutorial video on WASP',
        time: 0.5,
        taskName: 'Learn WASP',
      },
      {
        description: 'Complete online quiz on the basics of WASP',
        time: 1.5,
        taskName: 'Learn WASP',
      },
      {
        description: 'Review quiz answers and clarify doubts',
        time: 1,
        taskName: 'Learn WASP',
      },
    ],
  });
  const [isPlanGenerating, setIsPlanGenerating] = useState<boolean>(false);

  const { data: tasks, isLoading: isTasksLoading } = useQuery(getAllTasksByUser);

  const handleSubmit = async () => {
    try {
      await handleCreateTask({ description });
      setDescription('');
    } catch (err: any) {
      window.alert('Error: ' + (err.message || 'Something went wrong'));
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setIsPlanGenerating(true);
      const response = await generateGptResponse({
        hours: todaysHours,
      });
      if (response) {
        setResponse(response as unknown as GeneratedSchedule);
      }
    } catch (err: any) {
      window.alert('Error: ' + (err.message || 'Something went wrong'));
    } finally {
      setIsPlanGenerating(false);
    }
  };

  return (
    <div className='flex flex-col justify-center gap-10'>
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between gap-3'>
          <Input
            type='text'
            id='description'
            className='flex-1'
            placeholder='Enter task description'
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          <Button
            type='button'
            onClick={handleSubmit}
            disabled={!description}
            variant='default'
            size='default'
          >
            Add Task
          </Button>
        </div>
      </div>

      <div className='space-y-10 col-span-full'>
        {isTasksLoading && <div className='text-muted-foreground'>Loading...</div>}
        {tasks!! && tasks.length > 0 ? (
          <div className='space-y-4'>
            {tasks.map((task: Task) => (
              <Todo
                key={task.id}
                id={task.id}
                isDone={task.isDone}
                description={task.description}
                time={task.time}
              />
            ))}
            <div className='flex flex-col gap-3'>
              <div className='flex items-center justify-between gap-3'>
                <Label htmlFor='time' className='text-sm text-muted-foreground text-nowrap font-semibold'>
                  How many hours will you work today?
                </Label>
                <Input
                  type='number'
                  id='time'
                  step={0.5}
                  min={1}
                  max={24}
                  className='min-w-[7rem] text-center'
                  value={todaysHours}
                  onChange={(e) => setTodaysHours(+e.currentTarget.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className='text-muted-foreground text-center'>Add tasks to begin</div>
        )}
      </div>

      <Button
        type='button'
        disabled={isPlanGenerating || tasks?.length === 0}
        onClick={() => handleGeneratePlan()}
        variant='default'
        size='default'
        className='w-full'
      >
        {isPlanGenerating ? (
          <>
            <Loader2 className='inline-block mr-2 animate-spin' />
            Generating...
          </>
        ) : (
          'Generate Schedule'
        )}
      </Button>

      {!!response && (
        <div className='flex flex-col'>
          <h3 className='text-lg font-semibold text-foreground mb-4'>Today's Schedule</h3>
          <Schedule schedule={response} />
        </div>
      )}
    </div>
  );
}

type TodoProps = Pick<Task, 'id' | 'isDone' | 'description' | 'time'>;

function Todo({ id, isDone, description, time }: TodoProps) {
  const handleCheckboxChange = async (checked: boolean) => {
    await updateTask({
      id,
      isDone: checked,
    });
  };

  const handleTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateTask({
      id,
      time: e.currentTarget.value,
    });
  };

  const handleDeleteClick = async () => {
    await deleteTask({ id });
  };

  return (
    <Card className='p-4'>
      <div className='flex items-center justify-between w-full'>
        <div className='flex items-center justify-between gap-5 w-full'>
          <div className='flex items-center gap-3'>
            <Checkbox
              checked={isDone}
              onCheckedChange={handleCheckboxChange}
              className='data-[state=checked]:bg-primary data-[state=checked]:border-primary'
            />
            <span
              className={cn('text-foreground', {
                'line-through text-muted-foreground': isDone,
              })}
            >
              {description}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Input
              id='time'
              type='number'
              min={0.5}
              step={0.5}
              className={cn('w-18 h-8 text-center text-xs', {
                'pointer-events-none opacity-50': isDone,
              })}
              value={time}
              onChange={handleTimeChange}
            />
            <span
              className={cn('italic text-muted-foreground text-xs', {
                'text-muted-foreground': isDone,
              })}
            >
              hrs
            </span>
          </div>
        </div>
        <div className='flex items-center justify-end w-15'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleDeleteClick}
            title='Remove task'
            className='p-1 h-auto text-destructive hover:text-destructive/80'
          >
            <Trash2 size='20' />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Schedule({ schedule }: { schedule: GeneratedSchedule }) {
  return (
    <div className='flex flex-col gap-6 py-6'>
      <div className='space-y-4'>
        {!!schedule.tasks ? (
          schedule.tasks
            .map((task) => <TaskCard key={task.name} task={task} taskItems={schedule.taskItems} />)
            .sort((a, b) => {
              const priorityOrder: TaskPriority[] = ['low', 'medium', 'high'];
              if (a.props.task.priority && b.props.task.priority) {
                return (
                  priorityOrder.indexOf(b.props.task.priority) - priorityOrder.indexOf(a.props.task.priority)
                );
              } else {
                return 0;
              }
            })
        ) : (
          <div className='text-muted-foreground text-center'>OpenAI didn't return any Tasks. Try again.</div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, taskItems }: { task: ScheduleTask; taskItems: TaskItem[] }) {
  const taskPriorityToColorMap: Record<TaskPriority, string> = {
    high: 'bg-destructive/20 border-destructive/40 text-red-500',
    medium: 'bg-warning/10 border-warning/20 text-warning',
    low: 'bg-success/10 border-success/20 text-success',
  };

  return (
    <Card className={cn('border-2', taskPriorityToColorMap[task.priority])}>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between text-base'>
          <span>{task.name}</span>
          <span className='text-xs font-medium italic'> {task.priority} priority</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        {!!taskItems ? (
          <ul className='space-y-2'>
            {taskItems.map((taskItem) => {
              if (taskItem.taskName === task.name) {
                return <TaskCardItem key={taskItem.description} {...taskItem} />;
              }
              return null;
            })}
          </ul>
        ) : (
          <div className='text-muted-foreground text-center'>
            OpenAI didn't return any Task Items. Try again.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TaskCardItem({ description, time }: TaskItem) {
  const [isDone, setIsDone] = useState<boolean>(false);

  const formattedTime = useMemo(() => {
    if (time === 0) return '0min';
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}hr`);
    if (minutes > 0) parts.push(`${minutes}min`);

    return parts.join(' ');
  }, [time]);

  const handleCheckedChange = (checked: boolean | 'indeterminate') => {
    setIsDone(checked === true);
  };

  return (
    <li className='flex items-center justify-between gap-4 p-2 rounded-md'>
      <div className='flex items-center gap-3 flex-1'>
        <Checkbox
          checked={isDone}
          onCheckedChange={handleCheckedChange}
          className='data-[state=checked]:bg-primary data-[state=checked]:border-primary'
        />
        <span
          className={cn('leading-tight text-sm', {
            'line-through text-muted-foreground opacity-50': isDone,
          })}
        >
          {description}
        </span>
      </div>
      <span
        className={cn('text-sm text-muted-foreground', {
          'line-through opacity-50': isDone,
        })}
      >
        {formattedTime}
      </span>
    </li>
  );
}

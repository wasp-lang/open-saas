import { useState, useEffect, useMemo } from 'react';
import generateGptResponse from '@wasp/actions/generateGptResponse';
import deleteTask from '@wasp/actions/deleteTask';
import updateTask from '@wasp/actions/updateTask';
import createTask from '@wasp/actions/createTask';
import { useQuery } from '@wasp/queries';
import getAllTasksByUser from '@wasp/queries/getAllTasksByUser';
import { Task } from '@wasp/entities';
import { CgSpinner } from 'react-icons/cg';

export default function DemoAppPage() {
  return (
    <div className='my-10 lg:mt-20'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white'>
            Create your AI-powered <span className='text-yellow-500'>SaaS</span>
          </h2>
        </div>
        <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-white'>
          Below is an example of integrating the OpenAI API into your SaaS.
        </p>
        {/* begin AI-powered Todo List */}
        <div className='my-8 border rounded-3xl border-gray-900/10'>
          <div className='sm:w-[90%] md:w-[70%] lg:w-[50%] py-10 px-6 mx-auto my-8 space-y-10'>
            <NewTaskForm handleCreateTask={createTask} />
          </div>
        </div>
        {/* end AI-powered Todo List */}
      </div>
    </div>
  );
}

type TodoProps = Pick<Task, 'id' | 'isDone' | 'description' | 'time'>;

function Todo({ id, isDone, description, time }: TodoProps) {
  const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateTask({ id, isDone: e.currentTarget.checked });
  };

  const handleTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateTask({ id, time: e.currentTarget.value });
  };

  const handleDeleteClick = async () => {
    await deleteTask({ id });
  };

  return (
    <div className='flex items-center justify-between bg-purple-50 rounded-lg border border-gray-200 p-2 w-full'>
      <div className='flex items-center justify-between gap-5 w-full'>
        <div className='flex items-center gap-3'>
          <input
            type='checkbox'
            className='ml-1 form-checkbox bg-purple-500 checked:bg-purple-300 rounded border-purple-600 duration-200 ease-in-out hover:bg-purple-600 hover:checked:bg-purple-600 focus:ring focus:ring-purple-300 focus:checked:bg-purple-400 focus:ring-opacity-50'
            checked={isDone}
            onChange={handleCheckboxChange}
          />
          <span className={`text-slate-600 ${isDone ? 'line-through text-slate-500' : ''}`}>{description}</span>
        </div>
        <div className='flex items-center gap-2'>
          <input
            id='time'
            type='number'
            min={0.5}
            step={0.5}
            className={`w-15 h-8 text-center text-slate-600 text-xs rounded border border-gray-200 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50 ${
              isDone && 'pointer-events-none opacity-50'
            }`}
            value={time}
            onChange={handleTimeChange}
          />
          <span className={`italic text-slate-600 text-xs ${isDone ? 'text-slate-500' : ''}`}>hrs</span>
        </div>
      </div>
      <div className='flex items-center justify-end w-15'>
        <button className={`p-1 ${!isDone ? 'hidden' : ''}`} onClick={handleDeleteClick}>
          ❌
        </button>
      </div>
    </div>
  );
}

function NewTaskForm({ handleCreateTask }: { handleCreateTask: typeof createTask }) {
  const [description, setDescription] = useState<string>('');
  const [todaysHours, setTodaysHours] = useState<string>('8');
  const [response, setResponse] = useState<any>(null);
  const [isPlanGenerating, setIsPlanGenerating] = useState<boolean>(false);

  const { data: tasks, isLoading: isTasksLoading } = useQuery(getAllTasksByUser);

  useEffect(() => {
    console.log('response', response);
  }, [response]);

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
      const response = await generateGptResponse({ hours: todaysHours });
      if (response) {
        console.log('response', response);
        setResponse(JSON.parse(response));
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
          <input
            type='text'
            id='description'
            className='text-sm text-gray-600 w-full rounded-md border border-gray-200 bg-[#f5f0ff] shadow-md focus:outline-none focus:border-transparent focus:shadow-none duration-200 ease-in-out hover:shadow-none'
            placeholder='Enter task description'
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />
          <button
            type='button'
            onClick={handleSubmit}
            className='min-w-[7rem] font-medium text-gray-800/90 bg-yellow-50 shadow-md ring-1 ring-inset ring-slate-200 py-2 px-4 rounded-md hover:bg-yellow-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none'
          >
            Add Task
          </button>
        </div>
      </div>

      <div className='space-y-10 col-span-full'>
        {isTasksLoading && <div>Loading...</div>}
        {tasks!! && tasks.length > 0 ? (
          <div className='space-y-4'>
            {tasks.map((task: Task) => (
              <Todo key={task.id} id={task.id} isDone={task.isDone} description={task.description} time={task.time} />
            ))}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between gap-3'>
          <label htmlFor='time' className='text-sm text-gray-600 text-nowrap font-semibold'>
            How many hours will you work today?
          </label>
          <input
            type='number'
            id='time'
            step={0.5}
            min={1}
            max={24}
            className='min-w-[7rem] text-gray-800/90 text-center font-medium rounded-md border border-gray-200 bg-yellow-50 hover:bg-yellow-100 shadow-md focus:outline-none focus:border-transparent focus:shadow-none duration-200 ease-in-out hover:shadow-none'
            value={todaysHours}
            onChange={(e) => setTodaysHours(e.currentTarget.value)}
          />
        </div>
      </div>
          </div>
        ) : (
          <div className='text-gray-600 text-center'>Add tasks to begin</div>
        )}
      </div>


      <button
        type='button'
        disabled={ isPlanGenerating || tasks?.length === 0 }
        onClick={() => handleGeneratePlan()}
        className='flex items-center justify-center min-w-[7rem] font-medium text-gray-800/90 bg-yellow-50 shadow-md ring-1 ring-inset ring-slate-200 py-2 px-4 rounded-md hover:bg-yellow-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none disabled:opacity-70 disabled:cursor-not-allowed'
      >
        {isPlanGenerating ? 
        <>
          <CgSpinner className='inline-block mr-2 animate-spin' />
          Generating...
        </>
          : 
          'Generate Schedule'}
      </button>

      {!!response && (
        <div className='flex flex-col'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Today's Schedule</h3>

          <TaskTable schedule={response.schedule} />
        </div>
      )}
    </div>
  );
}

function TaskTable({ schedule }: { schedule: any[] }) {
  return (
    <div className='flex flex-col gap-6 py-6'>
      {schedule.map((task: any) => (
        <table
          key={task.name}
          className='table-auto w-full border-separate border border-spacing-2 rounded-md border-slate-200 shadow-sm'
        >
          <thead>
            <tr>
              <th
                className={`flex items-center justify-between gap-5 py-4 px-3 text-slate-800 border rounded-md border-slate-200 ${
                  task.priority === 'high' ? 'bg-red-50' : task.priority === 'low' ? 'bg-green-50' : 'bg-yellow-50'
                }`}
              >
                <span>{task.name}</span>
                <span className='opacity-70 text-xs font-medium italic'> {task.priority} priority</span>
              </th>
            </tr>
          </thead>
          <tbody className=''>
            {task.subtasks.map((subtask: { description: any; time: any }) => (
              <tr>
                <td
                  className={`flex items-center justify-between py-2 px-3 text-slate-600 border rounded-md border-purple-100 bg-purple-50`}
                >
                  <Subtask description={subtask.description} time={subtask.time} />
                </td>
              </tr>
            ))}

            {task.breaks.map((breakItem: { description: any; time: any }) => (
              <tr key={breakItem.description}>
                <td
                  className={`flex items-center justify-between py-2 px-3 text-slate-600 border rounded-md border-purple-100 bg-purple-50`}
                >
                  <Subtask description={breakItem.description} time={breakItem.time} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}

function Subtask({ description, time }: { description: string; time: number }) {
  const [isDone, setIsDone] = useState<boolean>(false);

  const convertHrsToMinutes = (time: number) => {
    if (time === 0) return 0;
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours > 0 ? hours + 'hr' : ''} ${minutes > 0 ? minutes + 'min' : ''}`;
  }

  const minutes = useMemo(() => convertHrsToMinutes(time), [time]);

  return (
    <>
      <input
        type='checkbox'
        className='ml-1 form-checkbox bg-purple-500 checked:bg-purple-300 rounded border-purple-600 duration-200 ease-in-out hover:bg-purple-600 hover:checked:bg-purple-600 focus:ring focus:ring-purple-300 focus:checked:bg-purple-400 focus:ring-opacity-50'
        checked={isDone}
        onChange={(e) => setIsDone(e.currentTarget.checked)}
      />
      <span className={`text-slate-600 ${isDone ? 'line-through text-slate-500 opacity-50' : ''}`}>{description}</span>
      <span className={`text-slate-600 ${isDone ? 'line-through text-slate-500 opacity-50' : ''}`}>{minutes}</span>
    </>
  );
}

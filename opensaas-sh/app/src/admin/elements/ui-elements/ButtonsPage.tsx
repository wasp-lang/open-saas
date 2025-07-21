import { type AuthUser } from 'wasp/auth';
import { Button } from '../../../components/ui/button';
import Breadcrumb from '../../layout/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';

const Buttons = ({ user }: { user: AuthUser }) => {
  useRedirectHomeUnlessUserIsAdmin({ user });

  return (
    <DefaultLayout user={user}>
      <Breadcrumb pageName='Buttons' />

      {/* Button Variants */}
      <div className='mb-10 rounded-sm border border-border bg-card shadow-default'>
        <div className='border-b border-border px-7 py-4'>
          <h3 className='font-medium text-foreground'>Button Variants</h3>
        </div>

        <div className='p-4 md:p-6 xl:p-9'>
          <div className='flex flex-wrap gap-4'>
            <Button variant='default'>Default</Button>
            <Button variant='destructive'>Destructive</Button>
            <Button variant='outline'>Outline</Button>
            <Button variant='secondary'>Secondary</Button>
            <Button variant='ghost'>Ghost</Button>
            <Button variant='link'>Link</Button>
          </div>
        </div>
      </div>

      {/* Button Sizes */}
      <div className='mb-10 rounded-sm border border-border bg-card shadow-default'>
        <div className='border-b border-border px-7 py-4'>
          <h3 className='font-medium text-foreground'>Button Sizes</h3>
        </div>

        <div className='p-4 md:p-6 xl:p-9'>
          <div className='flex flex-wrap items-center gap-4'>
            <Button size='sm'>Small</Button>
            <Button size='default'>Default</Button>
            <Button size='lg'>Large</Button>
            <Button size='icon'>
              <svg
                className='h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Button with Icon */}
      <div className='mb-10 rounded-sm border border-border bg-card shadow-default'>
        <div className='border-b border-border px-7 py-4'>
          <h3 className='font-medium text-foreground'>Button with Icon</h3>
        </div>

        <div className='p-4 md:p-6 xl:p-9'>
          <div className='flex flex-wrap gap-4'>
            <Button>
              <svg
                className='mr-2 h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
              Add Item
            </Button>
            <Button variant='outline'>
              <svg
                className='mr-2 h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                />
              </svg>
              Like
            </Button>
            <Button variant='destructive'>
              <svg
                className='mr-2 h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Buttons;

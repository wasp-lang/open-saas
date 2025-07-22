import { Heart, Plus, Trash2 } from 'lucide-react';
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
            <Button variant='outline'>Outline</Button>
            <Button variant='secondary'>Secondary</Button>
            <Button variant='ghost'>Ghost</Button>
            <Button variant='link'>Link</Button>
            <Button variant='destructive'>Destructive</Button>
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
              <Plus />
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
              <Plus />
              Add Item
            </Button>
            <Button variant='outline'>
              <Heart />
              Like
            </Button>
            <Button variant='destructive'>
              <Trash2 />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Buttons;

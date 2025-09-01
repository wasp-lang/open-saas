import { Heart, Plus, Trash2 } from 'lucide-react';
import { type AuthUser } from 'wasp/auth';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/button';
import Breadcrumb from '../../layout/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';

const Buttons = ({ user }: { user: AuthUser }) => {
  useRedirectHomeUnlessUserIsAdmin({ user });
  const { t } = useTranslation();

  return (
    <DefaultLayout user={user}>
      <Breadcrumb pageName={t('admin.buttons')} />

      {/* Button Variants */}
      <div className='mb-10 rounded-sm border border-border bg-card shadow-default'>
        <div className='border-b border-border px-7 py-4'>
          <h3 className='font-medium text-foreground'>{t('admin.buttonVariants')}</h3>
        </div>

        <div className='p-4 md:p-6 xl:p-9'>
          <div className='flex flex-wrap gap-4'>
            <Button variant='default'>{t('admin.default')}</Button>
            <Button variant='outline'>{t('admin.outline')}</Button>
            <Button variant='secondary'>{t('admin.secondary')}</Button>
            <Button variant='ghost'>{t('admin.ghost')}</Button>
            <Button variant='link'>{t('admin.link')}</Button>
            <Button variant='destructive'>{t('admin.destructive')}</Button>
          </div>
        </div>
      </div>

      {/* Button Sizes */}
      <div className='mb-10 rounded-sm border border-border bg-card shadow-default'>
        <div className='border-b border-border px-7 py-4'>
          <h3 className='font-medium text-foreground'>{t('admin.buttonSizes')}</h3>
        </div>

        <div className='p-4 md:p-6 xl:p-9'>
          <div className='flex flex-wrap items-center gap-4'>
            <Button size='sm'>{t('admin.small')}</Button>
            <Button size='default'>{t('admin.default')}</Button>
            <Button size='lg'>{t('admin.large')}</Button>
            <Button size='icon'>
              <Plus />
            </Button>
          </div>
        </div>
      </div>

      {/* Button with Icon */}
      <div className='mb-10 rounded-sm border border-border bg-card shadow-default'>
        <div className='border-b border-border px-7 py-4'>
          <h3 className='font-medium text-foreground'>{t('admin.buttonWithIcon')}</h3>
        </div>

        <div className='p-4 md:p-6 xl:p-9'>
          <div className='flex flex-wrap gap-4'>
            <Button>
              <Plus />
              {t('admin.addItem')}
            </Button>
            <Button variant='outline'>
              <Heart />
              {t('admin.like')}
            </Button>
            <Button variant='destructive'>
              <Trash2 />
              {t('admin.delete')}
            </Button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Buttons;

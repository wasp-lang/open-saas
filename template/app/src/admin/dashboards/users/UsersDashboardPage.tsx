import { type AuthUser } from 'wasp/auth';
import { useTranslation } from 'react-i18next';
import UsersTable from './UsersTable';
import Breadcrumb from '../../layout/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';

const Users = ({ user }: { user: AuthUser }) => {
  useRedirectHomeUnlessUserIsAdmin({user})
  const { t } = useTranslation();

  return (
    <DefaultLayout user={user}>
      <Breadcrumb pageName={t('admin.users')} />
      <div className='flex flex-col gap-10'>
        <UsersTable />
      </div>
    </DefaultLayout>
  );
};

export default Users;

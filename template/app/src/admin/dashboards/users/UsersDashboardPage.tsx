import { type AuthUser } from 'wasp/auth';
import UsersTable from './UsersTable';
import Breadcrumb from '../../layout/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useIsUserAdmin } from '../../useIsUserAdmin';

const Users = ({ user }: { user: AuthUser }) => {
  useIsUserAdmin({user})

  return (
    <DefaultLayout user={user}>
      <Breadcrumb pageName='Users' />
      <div className='flex flex-col gap-10'>
        <UsersTable />
      </div>
    </DefaultLayout>
  );
};

export default Users;

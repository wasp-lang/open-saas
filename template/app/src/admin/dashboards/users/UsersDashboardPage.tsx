import { type AuthUser } from 'wasp/auth';
import UsersTable from './UsersTable';
import Breadcrumb from '../../layout/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';

const Users = ({ user }: { user: AuthUser }) => {
  useRedirectHomeUnlessUserIsAdmin({user})

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

import { type AuthUser } from "wasp/auth";
import Breadcrumb from "../../layout/Breadcrumb";
import DefaultLayout from "../../layout/DefaultLayout";
import UsersTable from "./UsersTable";

const Users = ({ user }: { user: AuthUser }) => {
  return (
    <DefaultLayout user={user}>
      <Breadcrumb pageName="Users" />
      <div className="flex flex-col gap-10">
        <UsersTable />
      </div>
    </DefaultLayout>
  );
};

export default Users;

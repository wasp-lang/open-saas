import { type AuthUser } from "wasp/auth";
import { Breadcrumb } from "../../../admin/layout/Breadcrumb";
import { DefaultLayout } from "../../../admin/layout/DefaultLayout";
import { UsersTable } from "../../../admin/dashboards/users/UsersTable";

export default function UsersDashboardPage({ user }: { user: AuthUser }) {
  return (
    <DefaultLayout user={user}>
      <Breadcrumb pageName="Users" />
      <div className="flex flex-col gap-10">
        <UsersTable />
      </div>
    </DefaultLayout>
  );
}

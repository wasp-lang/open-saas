import SwitcherOne from "./SwitcherOne";
import DropdownEditDelete from "./DropdownEditDelete";

const UsersTable = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Users
        </h4>
      </div>

      <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-2 flex items-center">
          <p className="font-medium">Email</p>
        </div>
        <div className="col-span-1 hidden items-center sm:flex">
          <p className="font-medium">Last Active</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Has Paid</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Subscription Status</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Total Paid</p>
        </div>

      </div>

      <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-2 flex items-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <p className="text-sm text-black dark:text-white">
              Apple Watch Series 7
            </p>
          </div>
        </div>
        <div className="col-span-1 hidden items-center sm:flex">
          <p className="text-sm text-black dark:text-white">Electronics</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="text-sm text-black dark:text-white">
            <SwitcherOne />
          </p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="text-sm text-black dark:text-white">22</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="text-sm text-meta-3">$45</p>
        </div>
        <div className="col-span-1 flex items-center">
          <DropdownEditDelete />
        </div>
      </div>
    </div>
  );
};

export default UsersTable;

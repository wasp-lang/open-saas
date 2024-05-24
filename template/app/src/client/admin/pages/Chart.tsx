import Breadcrumb from '../components/Breadcrumb';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import DataStats from '../components/DataStats';
import DefaultLayout from '../layout/DefaultLayout';

const Chart = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Chart" />

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <DataStats />
        <div className="col-span-12">
          <BarChart />
        </div>
        <PieChart />
      </div>
    </DefaultLayout>
  );
};

export default Chart;

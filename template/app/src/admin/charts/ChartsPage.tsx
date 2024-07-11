import Breadcrumb from '../layout/Breadcrumb';
import BarChart from './BarChart';
import PieChart from './PieChart';
import DataStats from './DataStatsChart';
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

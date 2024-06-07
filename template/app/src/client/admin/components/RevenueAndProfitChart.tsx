import { ApexOptions } from 'apexcharts';
import React, { useState, useMemo, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { DailyStatsProps } from '../common/types';

const options: ApexOptions = {
  legend: {
    show: false,
    position: 'top',
    horizontalAlign: 'left',
  },
  colors: ['#3C50E0', '#80CAEE'],
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    height: 335,
    type: 'area',
    dropShadow: {
      enabled: true,
      color: '#623CEA14',
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1,
    },

    toolbar: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          height: 300,
        },
      },
    },
    {
      breakpoint: 1366,
      options: {
        chart: {
          height: 350,
        },
      },
    },
  ],
  stroke: {
    width: [2, 2],
    curve: 'straight',
  },
  // labels: {
  //   show: false,
  //   position: "top",
  // },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 4,
    colors: '#fff',
    strokeColors: ['#3056D3', '#80CAEE'],
    strokeWidth: 3,
    strokeOpacity: 0.9,
    strokeDashArray: 0,
    fillOpacity: 1,
    discrete: [],
    hover: {
      size: undefined,
      sizeOffset: 5,
    },
  },
  xaxis: {
    type: 'category',
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    title: {
      style: {
        fontSize: '0px',
      },
    },
    min: 0,
    max: 100,
  },
};

interface ChartOneState {
  series: {
    name: string;
    data: number[];
  }[];
}

const RevenueAndProfitChart = ({ weeklyStats, isLoading }: DailyStatsProps) => {
  const dailyRevenueArray = useMemo(() => {
    if (!!weeklyStats && weeklyStats?.length > 0) {
      const sortedWeeks = weeklyStats?.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      return sortedWeeks.map((stat) => stat.totalRevenue);
    }
  }, [weeklyStats]);

  const daysOfWeekArr = useMemo(() => {
    if (!!weeklyStats && weeklyStats?.length > 0) {
      const datesArr = weeklyStats?.map((stat) => {
        // get day of week, month, and day of month
        const dateArr = stat.date.toString().split(' ');
        return dateArr.slice(0, 3).join(' ');
      });
      return datesArr;
    }
  }, [weeklyStats]);

  const [state, setState] = useState<ChartOneState>({
    series: [
      {
        name: 'Profit',
        data: [4, 7, 10, 11, 13, 14, 17],
      },
    ],
  });
  const [chartOptions, setChartOptions] = useState<ApexOptions>(options);

  useEffect(() => {
    if (dailyRevenueArray && dailyRevenueArray.length > 0) {
      setState((prevState) => {
        // Check if a "Revenue" series already exists
        const existingSeriesIndex = prevState.series.findIndex((series) => series.name === 'Revenue');

        if (existingSeriesIndex >= 0) {
          // Update existing "Revenue" series data
          return {
            ...prevState,
            series: prevState.series.map((serie, index) => {
              if (index === existingSeriesIndex) {
                return { ...serie, data: dailyRevenueArray };
              }
              return serie;
            }),
          };
        } else {
          // Add "Revenue" series as it does not exist yet
          return {
            ...prevState,
            series: [
              ...prevState.series,
              {
                name: 'Revenue',
                data: dailyRevenueArray,
              },
            ],
          };
        }
      });
    }
  }, [dailyRevenueArray]);

  useEffect(() => {
    if (!!daysOfWeekArr && daysOfWeekArr?.length > 0 && !!dailyRevenueArray && dailyRevenueArray?.length > 0) {
      setChartOptions({
        ...options,
        xaxis: {
          ...options.xaxis,
          categories: daysOfWeekArr,
        },
        yaxis: {
          ...options.yaxis,
          // get the min & max values to the neareast hundred 
          max: Math.ceil(Math.max(...dailyRevenueArray) / 100) * 100,
          min: Math.floor(Math.min(...dailyRevenueArray) / 100) * 100,
        },
      });
    }
  }, [daysOfWeekArr, dailyRevenueArray]);

  return (
    <div className='col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8'>
      <div className='flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap'>
        <div className='flex w-full flex-wrap gap-3 sm:gap-5'>
          <div className='flex min-w-47.5'>
            <span className='mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary'>
              <span className='block h-2.5 w-full max-w-2.5 rounded-full bg-primary'></span>
            </span>
            <div className='w-full'>
              <p className='font-semibold text-primary'>Total Profit</p>
              <p className='text-sm font-medium'>Last 7 Days</p>
            </div>
          </div>
          <div className='flex min-w-47.5'>
            <span className='mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary'>
              <span className='block h-2.5 w-full max-w-2.5 rounded-full bg-secondary'></span>
            </span>
            <div className='w-full'>
              <p className='font-semibold text-secondary'>Total Revenue</p>
              <p className='text-sm font-medium'>Last 7 Days</p>
            </div>
          </div>
        </div>
        <div className='flex w-full max-w-45 justify-end'>
          <div className='inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4'>
            <button className='rounded bg-white py-1 px-3 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark'>
              Day
            </button>
            <button className='rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark'>
              Week
            </button>
            <button className='rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark'>
              Month
            </button>
          </div>
        </div>
      </div>

      <div>
        <div id='chartOne' className='-ml-5'>
          <ReactApexChart options={chartOptions} series={state.series} type='area' height={350} />
        </div>
      </div>
    </div>
  );
};

export default RevenueAndProfitChart;

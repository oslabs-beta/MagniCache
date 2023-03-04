import React, { SetStateAction, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';

interface CacheProps {
  usage: number | string;
  size: string | number;
  resTime: number;
  avgCached: number | string;
  avgUncached: number | string;

  // possibly need state update doubt it but adding just in case
  // setUsage: React.Dispatch<SetStateAction<string | number>>
  // setSize: React.Dispatch<SetStateAction<number>>
  // setResTime: React.Dispatch<SetStateAction<number>>
  // setCached: React.Dispatch<SetStateAction<number>>
  // setUncached: React.Dispatch<SetStateAction<number>>
}

const CacheMetrics = (props: CacheProps) => {
  const { usage, size, resTime, avgCached, avgUncached } = props;

  const usageData = {
    labels: ['Space Used', 'Space Left'],
    datasets: [
      {
        labels: ['Space Used', 'Space Left'],
        data: [usage, size],
        backgroundColor: ['#5b2af0', '#00CC99'],
        borderColor: ['white'],
        borderWidth: 1,
      },
    ],
  };

  const avgData = {
    labels: ['Avg. Cached in ms', 'Avg. Uncached in ms'],
    datasets: [
      {
        data: [avgCached, avgUncached],
        backgroundColor: ['#5b2af0', '#b3001b'],
        borderColor: ['white'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="cache-metric-container">
      <div className="cache-metric">Cache Capacity Used: {usage}</div>
      <br></br>

      <div className="cache-metric">Remaining Capacity: {size} </div>
      <br></br>

      <div className="cache-metric">Total Average Response Time: {resTime}</div>
      <br></br>

      <div className="cache-metric">
        Average Cached Response Time: {avgCached}
      </div>
      <br></br>

      <div className="cache-metric">
        Average Uncached Response Time: {avgUncached}
      </div>
      <br></br>
      {/* Possibly add a chart of sorts here? Maybe 2 or 3?  Line graph? bar? Pie?  */}
      <div className='chart-container'> 
      <Doughnut  data={usageData} style={{position: 'absolute', left: '50%', right: '50%', marginRight:'1%'}}/>
      <Pie  data={avgData} style={{position: 'absolute', right: 0}}/>
      </div>
    </div>
  );
};

export default CacheMetrics;

import React, { SetStateAction } from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Metrics } from '../../types';


interface CacheProps {
  usage: number | string;
  size: string | number;
  resTime: number;
  avgCached: number | string;
  avgUncached: number | string;

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
      <div className="cache-metric">
        {/* TIme it takes cache to retrieve data of any type */}
        Cache Latency: 
      </div>
      <br></br>

      <div className="cache-metric">
        {/* Average hits over total number of queries */}
        Average Memory Access Time: 0ms
      </div>
      <br></br>

      <div className="cache-metric">Cache Capacity Used: {usage}</div>
      <br></br>

      <div className="cache-metric">Remaining Capacity: {size} </div>
      <br></br>

      <div className="cache-metric">
        Average Cached Response Time: {avgCached}ms
      </div>
      <br></br>

      <div className="cache-metric">
        Average Uncached Response Time: {avgUncached}ms
      </div>
      <br></br>
      {/* Possibly add a chart of sorts here? Maybe 2 or 3?  Line graph? bar? Pie?  */}
        <Pie
          data={usageData}
        />
        <Doughnut data={avgData}></Doughnut>
    </div>
  );
};

export default CacheMetrics;

import React from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { CacheMetricsType } from '../../types';

interface CacheProps {
  metrics: CacheMetricsType;
}
const CacheMetrics = (props: CacheProps) => {
  const { metrics } = props;
  const {
    cacheUsage,
    sizeLeft,
    totalHits,
    totalMisses,
    AvgCacheTime,
    AvgMissTime,
    AvgMemAccTime,
  } = metrics;

  const usageData = {
    labels: ['Space Used', 'Space Left'],
    datasets: [
      {
        labels: ['Space Used', 'Space Left'],
        data: [cacheUsage, sizeLeft],
        backgroundColor: ['#5b2af0', '#00CC99'],
        borderColor: ['white'],
        borderWidth: 1,
        maintainAspectRatio: true,
        responsive: true,
      },
    ],
  };

  const avgData = {
    labels: ['Avg. Cached in ms', 'Avg. Uncached in ms'],
    datasets: [
      {
        data: [AvgCacheTime, AvgMissTime],
        backgroundColor: ['#5b2af0', '#b3001b'],
        borderColor: ['white'],
        borderWidth: 1,
        maintainAspectRatio: true,
        responsive: true,
      },
    ],
  };

  return (
    <div className="cache-metric-container">
      <div className="cache-metric">Cache Capacity Used: {cacheUsage}</div>
      <br></br>

      <div className="cache-metric">
        Remaining Capacity: {sizeLeft - cacheUsage}
      </div>
      <br></br>

      <div className="cache-metric">Total Hits: {totalHits}</div>
      <br></br>
      <div className="cache-metric">Total Misses: {totalMisses}</div>
      <br></br>
      <div className="half-metrics">
        <div className="cache-metric">Average Cache Time: {AvgCacheTime}ms</div>
        <br></br>

        <div className="cache-metric">
          Average Miss Response Time: {AvgMissTime}ms
        </div>
        <br></br>

        <div className="cache-metric">
          Average Memory Access Time: {AvgMemAccTime}ms
        </div>
        <br></br>
      </div>
      <Pie data={usageData} className="xtra-pie" />
      <Doughnut data={avgData} className="xtra-dough" />
    </div>
  );
};

export default CacheMetrics;

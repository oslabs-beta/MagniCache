import React from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { CacheMetricsType } from '../../types';

// Define interface for the props that will be passed to the component
interface CacheProps {
  // Specify the type of the metrics prop to be used in this component
  metrics: CacheMetricsType;
}

// Create a new component named CacheMetrics which takes the CacheProps object as an input and returns JSX (template)
const CacheMetrics = (props: CacheProps) => {
  // Destructure the metrics object from CacheProps object to avoid unnecessary repetition
  const { metrics } = props;

  // Deconstruct different properties from the metrics object to use later on
  const {
    cacheUsage,
    sizeLeft,
    totalHits,
    totalMisses,
    AvgCacheTime,
    AvgMissTime,
    AvgMemAccTime,
  } = metrics;

  // Define usageData object used to create data representation using chart.js library
  const usageData = {
    labels: ['Space Used', 'Space Left'],
    datasets: [
      {
        labels: ['Space Used', 'Space Left'],
        data: [cacheUsage, sizeLeft - cacheUsage],
        backgroundColor: ['#5b2af0', '#00CC99'],
        borderColor: ['white'],
        borderWidth: 1,
        maintainAspectRatio: true,
        responsive: true,
      },
    ],
  };

  // Define avgData object used to create data representation using chart.js library
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

  // Return JSX template to display metrics data in the HTML structure with dynamically updated data based on the data passed
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
      <div className="half-metrics">
      <div className="cache-metric">Total Misses: {totalMisses}</div>
      <br></br>

        <div className="cache-metric">
          Average Miss Response Time: {Math.round(AvgMissTime)}ms
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

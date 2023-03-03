import React, { SetStateAction } from 'react';

interface CacheProps {
  usage: number | string;
  size: string;
  resTime: number;
  avgCached: number;
  avgUncached: number;
  currentPolicy: string;

  // possibly need state update doubt it but adding just in case
    // setUsage: React.Dispatch<SetStateAction<string | number>>
    // setSize: React.Dispatch<SetStateAction<number>>
    // setResTime: React.Dispatch<SetStateAction<number>>
    // setCached: React.Dispatch<SetStateAction<number>>
    // setUncached: React.Dispatch<SetStateAction<number>>
    // setPolicy: React.Dispatch<SetStateAction<string>>
}

const CacheMetrics = (props: CacheProps) => {
  const { usage, size, resTime, avgCached, avgUncached, currentPolicy } = props;
  return (
    <div className="cache-metric-container">
      <div className="cache-metric">Cache Usage: {usage}</div>
      <br></br>

      <div className="cache-metric">Cache Size: {size} </div>
      <br></br>

      <div className="cache-metric">
        Total Average Response Time: {resTime}{' '}
      </div>
      <br></br>

      <div className="cache-metric">
        Average Cached Response Time: {avgCached}{' '}
      </div>
      <br></br>

      <div className="cache-metric">
        Average Uncached Response Time: {avgUncached}{' '}
      </div>
      <br></br>
      {/* Possibly add a chart of sorts here? Maybe 2 or 3?  Line graph? bar? Pie?  */}
    </div>
  );
};

export default CacheMetrics;

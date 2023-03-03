import React from 'react';

const CacheMetric = () => {
  return (
    <div className="cache-metric-container">
      <div className="cache-metric">Cache Usage: </div>
      <br></br>

      <div className="cache-metric">Cache Size: </div>
      <br></br>

      <div className="cache-metric">Average Cached Response Time: </div>
      <br></br>

      <div className="cache-metric">Average Uncached Response Time: </div>
      <br></br>
      {/* Possibly add a chart of sorts here? Maybe 2 or 3?  */}
    </div>
  );
};

export default CacheMetric;

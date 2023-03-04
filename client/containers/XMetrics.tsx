import React, { useState, useEffect } from 'react';
import CacheMetrics from '../components/CacheMetrics';

const XMetrics = () => {
  const [usage, setUsage] = useState<number | string>(84);
  const [size, setSize] = useState<string | number>(16);
  const [resTime, setResTime] = useState<number>(275.3);
  const [avgCached, setCached] = useState<number | string>(31.3);
  const [avgUncached, setUncached] = useState<number | string>(520.4);

  // Send a request and populate proper values to be passed down to CacheMetrics
  fetch('/some endpoint')
    .then((res) => res.json())
    .then((data) => data);
    // usage will be a number possibly converted to Bytes, same with size
    // ResTime will be the total average response time of uncached and cached
    // AvgCached and AvgUncached will be the averages for each result

  return (
    <div className="extra-metrics-container">
      <h1 className="cache-metrics-title">Cache Metrics</h1>
      <CacheMetrics
        usage={usage}
        size={size}
        resTime={resTime}
        avgCached={avgCached}
        avgUncached={avgUncached}
      />
    </div>
  );
};

export default XMetrics;

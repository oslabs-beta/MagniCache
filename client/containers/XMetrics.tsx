import React, { useState } from 'react';
import { CacheMetricsType } from '../../types';
import CacheMetrics from '../components/CacheMetrics';

// Component for creating and rendering container for extra metrics(CacheMetrics)
const XMetrics = () => {
  // Declare and type(Very specific) properties onto our metrics object
  const [metrics, setMetrics] = useState<CacheMetricsType>({
    cacheUsage: 0,
    sizeLeft: 0,
    totalHits: 0,
    totalMisses: 0,
    AvgCacheTime: 0,
    AvgMissTime: 0,
    AvgMemAccTime: 0,
  });

  // long polling function to send a request to retrieve the metrics from the server
  setTimeout(() => {
    fetch(`/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{getMetrics}',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data);
      });
  }, 10000);
  return (
    <>
      <div className="extra-metrics-container">
        <h1 className="cache-metrics-title">Cache Metrics</h1>
        <CacheMetrics metrics={metrics} />
      </div>
    </>
  );
};

export default XMetrics;

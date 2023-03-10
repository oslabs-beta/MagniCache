import React, { useState, useEffect } from 'react';
import CacheMetrics from '../components/CacheMetrics';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { CacheMetricsType } from '../../types';

const XMetrics = () => {
  const [metrics, setMetrics] = useState<CacheMetricsType>({
    cacheUsage: 0,
    sizeLeft: 0,
    totalHits: 0,
    totalMisses: 0,
    AvgCacheTime: 0,
    AvgMissTime: 0,
    AvgMemAccTime: 0,
  });


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

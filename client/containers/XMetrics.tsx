import React, { useState, useEffect } from 'react';
import CacheMetrics from '../components/CacheMetrics';

const XMetrics = () => {
  const [usage, setUsage] = useState<number | string>('');
  const [size, setSize] = useState<string>('');
  const [resTime, setResTime] = useState<number>(0);
  const [avgCached, setCached] = useState<number>(0);
  const [avgUncached, setUncached] = useState<number>(0);
  const [currentPolicy, setPolicy] = useState<string>('');

  // Send a request and populate proper values to be passed down to CacheMetrics
  fetch('some endpoint')

  return (
    <div className="extra-metrics-container">
      <h1 className="cache-metrics-title">Cache Metrics</h1>
      <CacheMetrics
        usage={usage}
        size={size}
        resTime={resTime}
        avgCached={avgCached}
        avgUncached={avgUncached}
        currentPolicy={currentPolicy}
      />
    </div>
  );
};

export default XMetrics;

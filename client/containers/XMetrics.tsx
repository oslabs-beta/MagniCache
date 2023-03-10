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

  const getMetrics = () => {
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
  };
  return (
    <>
      <div className="extra-metrics-container">
        <h1 className="cache-metrics-title">Cache Metrics</h1>
        <CacheMetrics metrics={metrics} />
        <ToggleButtonGroup
          type="radio"
          name="options"
          defaultValue={1}
          className="toggle-button-group-rc"
        >
          <ToggleButton
            id="tb5"
            value={1}
            style={{
              borderRadius: '14px',
              backgroundColor: '#1a8fe3',
              color: '#d6fbff',
              marginRight: '5px',
              border: 'none',
            }}
            onClick={getMetrics}
          >
            Get Metrics
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    </>
  );
};

export default XMetrics;

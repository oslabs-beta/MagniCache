import React, { useState, useEffect } from 'react';
import CacheMetrics from '../components/CacheMetrics';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { Metrics } from '../../types';


const XMetrics = () => {
  // Possibly use an object to store all the state
  const [usage, setUsage] = useState<number | string>(0);
  const [size, setSize] = useState<string | number>(0);
  const [resTime, setResTime] = useState<number>(0);
  const [avgCached, setCached] = useState<number | string>(0);
  const [avgUncached, setUncached] = useState<number | string>(0);
  const [memTime, setMemtime] = useState<number>(0);
  // AMAT FORMULA => (hit time) + (miss rate) × (miss time)

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
        setUsage(data.usage);
        setSize(data.sizeLeft);
      });
  };


  // Send a request and populate proper values to be passed down to CacheMetrics

  //TODO: Create averages for both fetch times, cached and uncached

  // usage will be a number possibly converted to Bytes, same with size
  // ResTime will be the total average response time of uncached and cached
  // AvgCached and AvgUncached will be the averages for each result

  return (
    <>
      <div className="extra-metrics-container">
        <h1 className="cache-metrics-title">Cache Metrics</h1>
        <CacheMetrics
          usage={usage}
          size={size}
          resTime={resTime}
          avgCached={avgCached}
          avgUncached={avgUncached}
        />
        {/* <button className="getMetrics" onClick={getMetrics}>
          HIASDNASD
        </button> */}
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

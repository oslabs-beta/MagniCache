import React, { useState, useEffect, useContext } from 'react';
import { Metrics } from '../../types';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
interface ResponseProps {
  hits: number;
  misses: number;
  metrics: Metrics[];
  // fetchTime: number;
}

const Response = (props: ResponseProps) => {
  const { hits, misses, metrics } = props;
  return (
    <div className="res-metrics">
      <div className="single-metric" id="hits">
        Hits: <span className='metric-result-numbers'>{hits}</span>
      </div>
      <div className="single-metric" id="misses">
        Misses: <span className='metric-result-numbers'>{misses}</span>
      </div>
      <div className="single-metric" id="response-time">
        Response Time: <span className='metric-result-numbers'>{''}</span>
        {!metrics[0] ? '' : metrics[metrics.length - 1].fetchTime + 'ms'}
      </div>
    </div>
  );
};

export default Response;

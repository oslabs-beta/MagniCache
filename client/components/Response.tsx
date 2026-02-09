import React from 'react';
import { Metrics } from '../../types';

// Declare an interface for props to be destructured
interface ResponseProps {
  hits: number;
  misses: number;
  metrics: Metrics[];
}

const Response = (props: ResponseProps) => {
  // Destructure hits misses and metrics from the props object
  const { hits, misses, metrics } = props;
  return (
    <div className="res-metrics">
      <div className="single-metric" id="hits">
        Hits: <span className="metric-result-numbers">{hits}</span>
      </div>
      <div className="single-metric" id="misses">
        Misses: <span className="metric-result-numbers">{misses}</span>
      </div>
      <div className="single-metric" id="response-time">
        Response Time: <span className="metric-result-numbers">{''}</span>
        {!metrics[0] ? '' : metrics[metrics.length - 1].fetchTime + 'ms'}
      </div>
    </div>
  );
};

export default Response;

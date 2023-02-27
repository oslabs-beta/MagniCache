import React, { useState, useEffect, useContext } from 'react';
import { Metrics } from '../../types';
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
        Hits: {hits}
      </div>
      <div className="single-metric" id="misses">
        Misses: {misses}
      </div>
      <div className="single-metric" id="response-time">
        Response Time:{' '}
        {!metrics[0] ? '' : metrics[metrics.length - 1].fetchTime + 'ms'}
      </div>
    </div>
  );
};

export default Response;

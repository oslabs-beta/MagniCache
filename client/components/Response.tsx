import React, { useState, useEffect, useContext } from 'react';

interface ResponseProps {
  hits: number,
  misses: number,
  fetchTime: number,
}

const Response = (props: ResponseProps) => {
  const { hits, misses, fetchTime } = props;
  return (
    <div className="res-metrics">
      <div className="single-metric">Hits: {hits}</div>
      <div className="single-metric">Misses: {misses}</div>
      <div className="single-metric">Response Time: {fetchTime}ms</div>
    </div>
  );
};

export default Response;

import React, { useState, useEffect, useContext } from 'react';

const Response: React.FC = () => {
  return (
    <div className="res-metrics">
      <div className="single-metric">Hits:</div>
      <div className="single-metric">Misses:</div>
      <div className="single-metric">Response Time:</div>
    </div>
  );
};

export default Response;

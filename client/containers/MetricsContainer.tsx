import React, { useState, useEffect, useContext } from 'react';
import QueryContainer from './QueryContainer';
// import ResultContainer from './ResultContainer';
import VisualsContainer from './VisualsContainer';

const MetricsContainer: React.FC = () => {
  return (
    <div className="metrics-flex">
      <div className="metrics-container">
        <div className="query-result">
          <QueryContainer />
          {/* <ResultContainer /> */}
        </div>
        <VisualsContainer />
      </div>
    </div>
  );
};

export default MetricsContainer;

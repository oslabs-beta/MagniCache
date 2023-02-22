import React, { useState, useEffect, useContext } from 'react';
import QueryContainer from './QueryContainer';
import ResultContainer from './ResultContainer';
import VisualsContainer from './VisualsContainer';

const MetricsContainer: React.FC = () => {
  return (
    <>
      <QueryContainer />
      <ResultContainer />
      <VisualsContainer />
    </>
  );
};

export default MetricsContainer;

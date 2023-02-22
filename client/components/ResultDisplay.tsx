import React from 'react';
import Result from './Result'

const ResultDisplay: React.FC = () => {
  return (
    <div className='query-display-flex'>
      <h1 className='res-title'>Query</h1>
      <div className='fields-container-result'>
       <Result />
      </div>
    </div>
  );
};

export default ResultDisplay;

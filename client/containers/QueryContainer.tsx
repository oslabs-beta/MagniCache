import React, { useState, useEffect, useContext } from 'react';
import QueryDisplay from '../components/QueryDisplay';

const QueryContainer: React.FC = () => {
  return (
    <div className="query-container">
      <QueryDisplay />
    </div>
  );
};

export default QueryContainer;

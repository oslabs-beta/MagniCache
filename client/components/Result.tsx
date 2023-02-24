import React, { useState, useEffect } from 'react';

interface ResultProps {
  queryResponse: object;
}

const Result: React.FC<ResultProps> = ({ queryResponse }) => {
  return (
    <>
      <div className="single-result">{JSON.stringify(queryResponse)}</div>
    </>
  );
};

export default Result;

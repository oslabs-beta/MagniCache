import React, { useState, useEffect } from 'react';

interface ResultProps {
  queryResponse: object;
}

const Result: React.FC<ResultProps> = ({ queryResponse }) => {
  return (
    <>
      <p className="single-result">{JSON.stringify(queryResponse)}</p>
    </>
  );
};

export default Result;

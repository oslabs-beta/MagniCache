import React, { useState, useEffect } from 'react';

interface ResultProps {
  queryResponse: object;
}

const Result: React.FC<ResultProps> = ({ queryResponse }) => {
  const parseResult = () => {};

  return (
    <>
      {/* <p className="single-result">{JSON.stringify(queryResponse)}</p> */}
      <p className="single-result">
        {JSON.stringify(
          queryResponse,
          //  (key, value) => value || '', 4).replace(
          //   /"([^"]+)":/g,
          //   '$1:'
          null,
          1.5
        )}
      </p>
    </>
  );
};

export default Result;

import React from 'react';

interface ResultProps {
  queryResponse: object;
}

const Result: React.FC<ResultProps> = ({ queryResponse }) => {

  return (
    <>
      <p className="single-result">
        {JSON.stringify(
          queryResponse,
          null,
          1.5
        )}
      </p>
    </>
  );
};

export default Result;

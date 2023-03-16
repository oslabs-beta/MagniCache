import React from 'react';

// Create interface for single prop to be passed down, queryResponse
interface ResultProps {
  queryResponse: object;
}

const Result: React.FC<ResultProps> = ({ queryResponse }) => {

  return (
    <>
    {/* Return a 'single' result on to the page. */}
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

import React, { useState, useEffect, useContext } from 'react';
import QueryDisplay from '../components/QueryDisplay';
import VisualsDisplay from '../components/VisualsDisplay';

const MetricsContainer: React.FC = () => {
  const [queryValue, setQueryValue] = useState('');
  const [queryResponse, setQueryResponse] = useState({});
  const [fetchTime, setFetchTime] = useState(0);


  const handleClickRun = () => {
    const resourceTimings = window.performance.getEntriesByType('resource');

    for (let i = 0; i < resourceTimings.length; i++) {
      const timing = resourceTimings[i];
      setFetchTime(timing.duration);
    }
    console.log(fetchTime);
    //TODO: Have it fetch the query in the input
    fetch(`/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: queryValue,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setQueryResponse(data);
        console.log(fetchTime);
      })
      .catch((err) => console.log(err));
  };

  const handleClickClear = () => {
    setQueryResponse({});
  };
  return (
    <div className="metrics-flex">
      <div className="metrics-container">
        <div className="query-result">
          <div className="query-container">
            <QueryDisplay
              queryResponse={queryResponse}
              setQueryValue={setQueryValue}
              queryValue={queryValue}
              fetchTime={fetchTime}
              handleClickClear={handleClickClear}
              handleClickRun={handleClickRun}
            />
          </div>
          {/* <ResultContainer /> */}
        </div>
        <div className="visuals-container">
          <VisualsDisplay
            queryValue={queryValue}
            queryResponse={queryResponse}
            fetchTime={fetchTime}
          />
        </div>
      </div>
    </div>
  );
};

export default MetricsContainer;

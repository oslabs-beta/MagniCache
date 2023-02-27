import React, { useState, useEffect, useContext } from 'react';
import QueryDisplay from '../components/QueryDisplay';
import VisualsDisplay from '../components/VisualsDisplay';

const MetricsContainer: React.FC = () => {
  const [queryValue, setQueryValue] = useState('');
  const [queryResponse, setQueryResponse] = useState({});
  const [fetchTime, setFetchTime] = useState(0);
  const [cacheData, setCacheData] = useState(['']); // need to figure how to type this so TS stops bitching

  const handleClickRun = () => {
    //TODO: Have the backend send the cache hits and misses in some way. possibly here or visual display
    if (queryValue !== '' && queryValue !== null) {
      fetch(`/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryValue,
        }),
      })
        .then((res) => {
          if (
            document.cookie
              .split(';')
              .some((cookie: string): boolean =>
                cookie.includes('cacheStatus=hit')
              )
          ) {
            setCacheData([...cacheData, 'hit']);
          }
          if (
            document.cookie
              .split(';')
              .some((cookie: string): boolean =>
                cookie.includes('cacheStatus=miss')
              )
          ) {
            setCacheData([...cacheData, 'miss']);
          }

          return res.json();
        })
        .then((data) => {
          /*query{messageById(id:12){message message_id}} */
          setQueryResponse(data);
        })
        .catch((err) => console.log(err));

      const resourceTimings = window.performance.getEntriesByType('resource');
      for (let i = 0; i < resourceTimings.length; i++) {
        const timing = resourceTimings[i];
        // setFetchTime(Math.floor(timing.duration) + 1);
        setFetchTime(Math.floor(timing.duration) + 1);
      }
    } else {
      setQueryResponse('Query field cannot be empty');
    }
  };

  const handleClickClear = () => {
    // TODO: should clear button should also clear the query value?
    // setQueryValue('');
    setQueryResponse({});
  };
  return (
    <div className="metrics-container">
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
      <div className="visuals-container">
        <VisualsDisplay
          queryValue={queryValue}
          queryResponse={queryResponse}
          fetchTime={fetchTime}
          cacheData={cacheData}
        />
      </div>
    </div>
  );
};

export default MetricsContainer;

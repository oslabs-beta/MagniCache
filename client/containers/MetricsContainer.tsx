import React, { useState, useEffect, useContext } from 'react';
import QueryDisplay from '../components/QueryDisplay';
import VisualsDisplay from '../components/VisualsDisplay';
import { Metrics } from '../../types';

const MetricsContainer: React.FC = () => {
  const [queryValue, setQueryValue] = useState('');
  const [queryResponse, setQueryResponse] = useState({});
  const [cacheData, setCacheData] = useState(['']); // TODO:need to figure how to type this so TS stops shouting
  const [fetchTime, setFetchTime] = useState<number>(0);
  const [lineGraphTimes, setLineGraphTimes] = useState<number[]>([]);
  const [lineGraphLabels, setLineGraphLabels] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Metrics[]>([]);

  const handleClickRun = () => {
    if (queryValue !== '' && queryValue !== null) {
      const startTime = performance.now();
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
          //sett all the metrics in this 'then' block
          let cacheStatus!: 'hit' | 'miss';
          if (
            document.cookie
              .split(';')
              .some((cookie: string): boolean =>
                cookie.includes('cachestatus=hit')
              )
          ) {
            // setCacheData([...cacheData, 'hit']);
            // setMetrics([...metrics, {cacheStatus: 'hit', }])
            cacheStatus = 'hit';
          }
          if (
            document.cookie
              .split(';')
              .some((cookie: string): boolean =>
                cookie.includes('cachestatus=miss')
              )
          ) {
            // setCacheData([...cacheData, 'miss']);
            cacheStatus = 'miss';
          }
          const endTime = performance.now();
          // setFetchTime(Math.floor(endTime - startTime - 1)); // 20ms
          let fetchTime = Math.floor(endTime - startTime - 1);
          setMetrics([...metrics, { cacheStatus, fetchTime }]);
          return res.json();
        })
        .then((data) => {
          setQueryResponse(data);
        })
        // .then(() => {
        //   setLineGraphTimes([...lineGraphTimes, fetchTime]); // [0, 20]
        //   let newLabel = fetchTime < 100 ? 'Cached' : 'Uncached';
        //   setLineGraphLabels([...lineGraphLabels, newLabel]);
        // })
        .catch((err) => console.log(err));
    } else {
      setQueryResponse('Query field cannot be empty');
    }
  };

  const handleClickClear = () => {
    // TODO: should clear button should also clear the query value?
    setQueryValue('');
    setQueryResponse({});
  };
  return (
    <div className="metrics-container">
      <div className="query-container">
        <QueryDisplay
          key={'A1'}
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
          key={'B1'}
          queryValue={queryValue}
          queryResponse={queryResponse}
          // fetchTime={fetchTime}
          // cacheData={cacheData}
          // lineGraphTimes={lineGraphTimes}
          // setLineGraphTimes={setLineGraphTimes}
          // lineGraphLabels={lineGraphLabels}
          // setLineGraphLabels={setLineGraphLabels}
          metrics={metrics}
          setMetrics={setMetrics}
        />
      </div>
    </div>
  );
};

export default MetricsContainer;

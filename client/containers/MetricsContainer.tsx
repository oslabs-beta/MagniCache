import React, { useState, useEffect, useContext } from 'react';
import QueryDisplay from '../components/QueryDisplay';
import VisualsDisplay from '../components/VisualsDisplay';
import { Metrics } from '../../types';

// Import and create a new instance of the magnicache client function
const MagniClient = require('../magnicache-client.js');
const magniClient = new MagniClient();

const MetricsContainer: React.FC = () => {
  // Create state variables for the query, the response, the metrics, and if it is on client or server mode
  const [queryValue, setQueryValue] = useState('');
  const [queryResponse, setQueryResponse] = useState({});
  const [metrics, setMetrics] = useState<Metrics[]>([]);
  const [clientMode, setClientMode] = useState<boolean>(false);
  // Globally scope fetchtime variable
  let fetchTime = 0;


  // inside handleclickrun, proceed with functionality depending on whether server mode or client mode is activated
  const handleClickRun = () => {
    if (queryValue !== '' && queryValue !== null) {
      if (clientMode) {
        const startTime = performance.now();
        magniClient
          .query(queryValue, '/graphql')
          .then((res: any): any => {
            //set all the metrics in this 'then' block
            let cacheStatus!: 'hit' | 'miss';


            const endTime = performance.now();

            let fetchTime = Math.abs(
              Math.round((endTime - startTime - 1) * 100) / 100
            );
            res[1].uncached === true
              ? (cacheStatus = 'miss')
              : (cacheStatus = 'hit');

            setMetrics([...metrics, { cacheStatus, fetchTime }]);
            return res[0].json();
          })
          .then((data: string) => {
            setQueryResponse(data);
          })
          .catch((err: {}) => console.log(err));
      } else {
        const startTime = performance.now();
        // this fetch should only be invoked if server mode is activated
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
                  cookie.includes('cacheStatus=hit')
                )
            ) {
              cacheStatus = 'hit';
            }
            if (
              document.cookie
                .split(';')
                .some((cookie: string): boolean =>
                  cookie.includes('cacheStatus=miss')
                )
            ) {
              cacheStatus = 'miss';
            }
            const endTime = performance.now();
            let fetchTime = Math.floor(endTime - startTime - 1);
            setMetrics([...metrics, { cacheStatus, fetchTime }]);
            return res.json();
          })
          .then((data) => {
            setQueryResponse(data);
          })
          .catch((err) => console.log(err));
      }
    } else {
      setQueryResponse('Query field cannot be empty');
    }
  };

  // Function to handle switching between client and server side caching
  const handleSwitchMode = () => {
    setClientMode(!clientMode);
    setMetrics([]);
    setQueryResponse({});
  };

  // Function to clear query response from display
  const handleClickClear = () => {
    setQueryValue('');
    setQueryResponse({});
  };

  // Function for clearing cache at the click of a clear cache button
  const handleClearCache = () => {
    fetch(`/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{clearCache}',
      }),
    });
  };

  return (
    <div className="metrics-container">
      <div className="query-container">
        <QueryDisplay
          metrics={metrics}
          key={'A1'}
          queryResponse={queryResponse}
          setQueryValue={setQueryValue}
          queryValue={queryValue}
          fetchTime={fetchTime}
          handleClickClear={handleClickClear}
          handleClickRun={handleClickRun}
          handleClearCache={handleClearCache}
          clientMode={clientMode}
          setClientMode={setClientMode}
          handleSwitchMode={handleSwitchMode}
        />
      </div>
      <div className="visuals-container">
        <VisualsDisplay
          key={'B1'}
          queryValue={queryValue}
          queryResponse={queryResponse}
          metrics={metrics}
          setMetrics={setMetrics}
        />
      </div>
    </div>
  );
};

export default MetricsContainer;

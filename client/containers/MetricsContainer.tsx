import React, { useState } from 'react';
import QueryDisplay from '../components/QueryDisplay';
import VisualsDisplay from '../components/VisualsDisplay';
import { Metrics } from '../../types';

// Import and create a new instance of the magnicache client function
const MagniClient = require('../magnicache-client.js');
const magniClient = new MagniClient();

const MetricsContainer: React.FC = () => {
  // Create state variables for the query, the response, the metrics, and if it is on client or server mode
  const [queryValue, setQueryValue] = useState(`query{
    allMessages{
      message
      message_id
      sender_id
    }
  }`);
  const [queryResponse, setQueryResponse] = useState({});
  const [metrics, setMetrics] = useState<Metrics[]>([]);
  const [clientMode, setClientMode] = useState<boolean>(false);
  const [isThrottled, setThrottle] = useState<boolean>(false);
  // Globally scope fetchtime variable
  let fetchTime = 0;

  // inside handleclickrun, proceed with functionality depending on whether server mode or client mode is activated
  const handleClickRun = () => {
    if (queryValue !== '' && queryValue !== null) {
      if (clientMode) {
        console.log('first response', queryResponse);

        const startTime = performance.now();
        magniClient
          .query(queryValue, '/graphql')
          // TODO: to clean up, try destructuring array in .then parameters
          .then((res: any): any => {
            //set all the metrics in this 'then' block
            let cacheStatus!: 'hit' | 'miss';

            const endTime = performance.now();

            let fetchTime = Math.round((endTime - startTime) * 100) / 100;

            res[1].uncached === true
              ? (cacheStatus = 'miss')
              : (cacheStatus = 'hit');

            setMetrics([...metrics, { cacheStatus, fetchTime }]);

            return res[0];
          })
          .then((data: {}) => {
            setQueryResponse(data);
          })
          .catch((err: {}) => console.log(err));
        console.log('second response', queryResponse);
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
          .then((data: {}) => {
            setQueryResponse(data);
          })
          .catch((err) => console.log(err));
      }
    } else {
      setQueryResponse('Query field cannot be empty');
    }
  };

  const handleRunThrottle = () => {
    // If the function is still in a throttle return
    if (isThrottled) {
      return;
    }
    // Reassign throttle to be true if 'if' statement fails
    setThrottle(true);

    // AFter one second se tthe throttle back to false
    setTimeout(() => {
      setThrottle(false);
    }, 1000);

    // Invoke handle click run
    handleClickRun();
  };

  // Function to handle switching between client and server side caching
  const handleSwitchMode = () => {
    console.log('mode switched');
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
      <div className="visuals-container">
        <VisualsDisplay
          key={'B1'}
          queryValue={queryValue}
          queryResponse={queryResponse}
          metrics={metrics}
          setMetrics={setMetrics}
        />
      </div>
      <div className="query-container">
        <QueryDisplay
          metrics={metrics}
          key={'A1'}
          queryResponse={queryResponse}
          setQueryValue={setQueryValue}
          queryValue={queryValue}
          fetchTime={fetchTime}
          handleClickClear={handleClickClear}
          handleClickRun={handleRunThrottle}
          handleClearCache={handleClearCache}
          clientMode={clientMode}
          setClientMode={setClientMode}
          handleSwitchMode={handleSwitchMode}
        />
      </div>
    </div>
  );
};

export default MetricsContainer;

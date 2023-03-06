import React, { useState, useEffect, useContext, SetStateAction } from 'react';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Result from './Result';
import XMetrics from '../containers/XMetrics';

interface QueryProps {
  queryValue: string;
  setQueryValue: React.Dispatch<React.SetStateAction<string>>;
  queryResponse: Object;
  fetchTime: number;
  handleClickRun: () => void;
  handleClickClear: () => void;
  handleClearCache: () => void;
  key: string;
}

const QueryDisplay = (props: QueryProps) => {
  const {
    queryValue,
    setQueryValue,
    queryResponse,
    fetchTime,
    handleClickClear,
    handleClickRun,
    handleClearCache,
  } = props;

  return (
    <div className="query-display-flex">
      <div className="query-display-child" id="query-box">
        <h1 className="query-display-title">Query</h1>
        <div className="fields-container">
          <textarea
            className="query-input"
            value={queryValue}
            onChange={(e) => setQueryValue(e.target.value)}
          />
        </div>
        <ToggleButtonGroup
          type="radio"
          name="options"
          defaultValue={1}
          className="toggle-button-group-rc"
        >
          <ToggleButton
            id="tb3"
            value={1}
            style={{
              borderRadius: '14px',
              backgroundColor: '#1a8fe3',
              color: '#d6fbff',
              marginRight: '5px',
              border: 'none',
            }}
            onClick={handleClickRun}
          >
            Run
          </ToggleButton>
          &nbsp;
          <ToggleButton
            id="tb4"
            value={2}
            style={{
              borderRadius: '14px',
              backgroundColor: '#1a8fe3',
              color: '#d6fbff',
              border: 'none',
            }}
            onClick={handleClickClear}
          >
            Clear
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
       <XMetrics 
       fetchTime = {fetchTime}
       queryValue={queryValue}
       />
      <div id="result-display" className="query-display-child">
        <h1 className="query-result-title">Results</h1>
        <div className="fields-container-result">
          <Result queryResponse={queryResponse} />
        </div>
        <ToggleButtonGroup
          type="radio"
          name="options"
          defaultValue={1}
          id="toggle-button-cache"
        >
          <ToggleButton
            id="tb5"
            value={2}
            style={{
              borderRadius: '14px',
              backgroundColor: '#1a8fe3',
              color: '#d6fbff',
              border: 'none',
            }}
            onClick={handleClearCache}
          >
            Clear Cache
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      {/* Cache metrics container. Cache usage %, cache size, cache eviction policy, cache response time, avg server response time for cached/uncached queries. Use websockets or long polling to fetch said metrics.  */}
    </div>
  );
};

export default QueryDisplay;

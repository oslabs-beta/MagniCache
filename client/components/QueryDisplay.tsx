import React, { useState, useEffect, useContext, SetStateAction } from 'react';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Result from './Result';

interface QueryProps {
  queryValue: string;
  setQueryValue: React.Dispatch<React.SetStateAction<string>>;
  queryResponse: Object;
  fetchTime: number;
  handleClickRun: () => void;
  handleClickClear: () => void;
}

const QueryDisplay = (props: QueryProps) => {
  const {
    queryValue,
    setQueryValue,
    queryResponse,
    fetchTime,
    handleClickClear,
    handleClickRun,
  } = props;

  return (
    <div className="query-display-flex">
      <div className="query-display-child" id="query-box">
        <h1 className="query-display-title">Query</h1>
        <div className="fields-container">
          <textarea
            className="query-input"
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
            }}
            onClick={handleClickClear}
          >
            Clear
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div id="result-display" className="query-display-child">
        <h1 className="query-display-title">Results</h1>
        <div className="fields-container-result">
          <Result queryResponse={queryResponse} />
        </div>
      </div>
    </div>
  );
};

export default QueryDisplay;

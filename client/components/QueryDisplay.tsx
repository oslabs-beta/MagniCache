import React from 'react';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Result from './Result';
import XMetrics from '../containers/XMetrics';
import { Metrics } from '../../types';


interface QueryProps {
  metrics: Metrics[]
  queryValue: string;
  setQueryValue: React.Dispatch<React.SetStateAction<string>>;
  queryResponse: Object;
  fetchTime: number;
  handleClickRun: () => void;
  handleClickClear: () => void;
  handleClearCache: () => void;
  key: string;
  clientMode: boolean;
  setClientMode: React.Dispatch<React.SetStateAction<boolean>>;
  handleSwitchMode: () => void;
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
    metrics,
    handleSwitchMode,
    clientMode,
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
       <XMetrics />
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
            id="tb6"
            value={1}
            style={{
              borderRadius: '14px',
              backgroundColor: '#1a8fe3',
              color: '#d6fbff',
              border: 'none',
              marginRight: '10px',
            }}
            onClick={handleSwitchMode}
          >
            Switch to{' '}
            {clientMode ? 'Server-side caching' : 'Client-side caching'}
          </ToggleButton>
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
    </div>
  );
};

export default QueryDisplay;

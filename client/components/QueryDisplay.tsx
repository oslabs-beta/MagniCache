import React, { useState, useEffect, useContext } from 'react';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Result from './Result';

const QueryDisplay: React.FC = () => {
  const [queryValue, setQueryValue] = useState('');
  const [queryResponse, setQueryResponse] = useState({});

  const handleClickRun = () => {
    //TODO: Have it fetch the query in the input
    //TODO pass down the queryResponse as a prop to the Result container
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
      .then((data) => setQueryResponse(data))
      .catch((err) => console.log(err));
  };

  const handleClickClear = () => {
    setQueryResponse({});
  };

  return (
    <div className="query-display-flex">
      <h1 className="API-title">Swapi</h1>
      <div className="fields-container">
        {/* Library for creating a mini code editor(possible use GraphiQL itself......) */}
        <input
          className="query-input"
          type="text"
          onChange={(e) => setQueryValue(e.target.value)}
          style={{ color: '#1a8fe3' }}
        />
      </div>
      <div className="run-clear">
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
      <h1 className="res-title">Results</h1>
      <div className="fields-container-result">
        <Result queryResponse={queryResponse} />
      </div>
    </div>
  );
};

export default QueryDisplay;

import React, { useState, useEffect, useContext } from 'react';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import Field from './Field';

const QueryDisplay: React.FC = () => {
  return (
    <div className='query-display-flex'>
      <div className='query-result-container'>
        <ToggleButtonGroup type='radio' name='options' defaultValue={1} className='toggle-button-group'>
          <ToggleButton id='tb1' value={1} style={{ borderRadius: '14px', color: '#d6fbff' }}>
            Query
          </ToggleButton>
          &nbsp;
          <ToggleButton id='tb2' value={2} style={{ borderRadius: '14px', color: '#d6fbff' }}>
            Mutation
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <h1 className='API-title'>Swapi</h1>
      <div className='fields-container'>
        <Field />
      </div>
      <div className='run-clear'>
        <ToggleButtonGroup type='radio' name='options' defaultValue={1} className='toggle-button-group-rc'>
          <ToggleButton id='tb3' value={1} style={{ borderRadius: '14px', backgroundColor: '#1a8fe3', color: '#d6fbff' }}>
            Run
          </ToggleButton>
          &nbsp;
          <ToggleButton id='tb4' value={2} style={{ borderRadius: '14px', backgroundColor: '#1a8fe3', color: '#d6fbff' }}>
            Clear
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    </div>
  );
};

export default QueryDisplay;

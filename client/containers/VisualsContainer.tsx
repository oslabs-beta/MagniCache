import React, { useState, useEffect, useContext } from 'react';
import VisualsDisplay from '../components/VisualsDisplay';

const VisualsContainer: React.FC = () => {
  return (
    <div className='visuals-container'>
      <VisualsDisplay />
    </div>
  );
};

export default VisualsContainer;

import React from 'react';
import { useState, useEffect, useContext } from 'react';
import NavBar from '../components/NavBar';
import MetricsContainer from './MetricsContainer';
import '../scss/styles.scss';

const MainContainer: React.FC = () => {
  return (
    <div className="maintainer">
      <NavBar />
      <MetricsContainer />
    </div>
  );
};

export default MainContainer;

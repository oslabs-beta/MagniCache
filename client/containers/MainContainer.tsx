import React from 'react';
import { useState, useEffect, useContext } from 'react';
import NavBar from '../components/NavBar';
import MetricsContainer from './MetricsContainer';

const MainContainer: React.FC = () => {
  return (
    <>
      <NavBar />
      <MetricsContainer />
    </>
  );
};

export default MainContainer;

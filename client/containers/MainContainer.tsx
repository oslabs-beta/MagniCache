import React from 'react';
import { useState, useEffect, useContext } from 'react';
import NavBar from '../components/NavBar';
import MetricsContainer from './MetricsContainer';
import '../scss/styles.scss';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';

const MainContainer: React.FC = () => {
  return (
    <div className="maintainer">
      <NavBar />
      <MetricsContainer />
      {/* <Routes>
        <Route path="/" element={<MetricsContainer />} />
      </Routes> */}
    </div>
  );
};

export default MainContainer;

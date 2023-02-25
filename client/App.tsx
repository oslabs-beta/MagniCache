import React from 'react';
import { useState, useEffect, useContext } from 'react';
import NavBar from './components/NavBar';
import MetricsContainer from './containers/MetricsContainer';
import AboutPage from './containers/AboutPage';
import DocsPage from './containers/DocsPage';
import TeamPage from './containers/TeamPage';
import './scss/styles.scss';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';

// Create a type to easily add types to variables
type Rtype = React.FC;

const App: Rtype = () => {
  return (
    <div className="maintainer">
      <NavBar />
      {/* <MetricsContainer /> */}
      {/* <AboutPage /> */}
      <Routes>
        <Route path="/" element={<MetricsContainer />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/team" element={<TeamPage />} />
      </Routes>
    </div>
  );
};

export default App;

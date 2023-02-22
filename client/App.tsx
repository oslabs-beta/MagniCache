import React from 'react';
import MainContainer from './containers/MainContainer';

// Create a type to easily add types to variables 
type Rtype = React.FC;

const App: Rtype = () => {
  return (
    <>
      <MainContainer />
    </>
  );
};

export default App;

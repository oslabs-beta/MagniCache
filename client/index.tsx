import React from 'react';
import ReactDOM from 'react-dom';
// import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Create a type to easily add to variables  
type NodeType = HTMLElement | null;

const domNode: NodeType = document.getElementById('root');

 ReactDOM.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    domNode
  );


import React, { useState, useEffect, useContext } from 'react';
import Response from './Response';

// Create the charts within this file, response.tsx will take care of the metrics for the cache response
const VisualsDisplay: React.FC = () => {
  return (
    <div className='visuals-display'>
      <div className='left-visual'>
        Line Graph {<br></br>}
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam hic eligendi blanditiis odio quae nostrum, ex corrupti architecto quam provident esse. Porro cupiditate accusantium, mollitia totam magni rerum fuga hic.
      </div>
      <div className='right-visual'>
        <div className='right-metric'>
          <Response />
        </div>
        <div className='right-chart'>
          CHART WILL GO HERE
        </div>
      </div>
    </div>
  );
};

export default VisualsDisplay;

import React, { useState, useEffect, useContext } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import Response from './Response';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VisualProps {
  queryValue: string,
  queryResponse: Object,
  fetchTime: number,
}

// Create the charts within this file, response.tsx will take care of the metrics for the cache response
const VisualsDisplay= (props: VisualProps) => {
  const [hits, setHits] = useState(Number);
  const [misses, setMisses] = useState(Number);
  //TODO: Use queryresponse and fetch time to populate data inside visuals 
  const { queryResponse, fetchTime } = props;
  // console.log(new Date(window.performance.timing.fetchStart).toDateString())
  const dataDo = {
    labels: ['Hits', 'Misses'],
    datasets: [
      {
        label: 'Cache Hits/Misses',
        data: [10, 4],
        backgroundColor: ['#5b2af0', '#b3001b'],
        borderColor: ['white'],
        borderWidth: 1,
      },
    ],
  };
  const dataLine = {
    labels: ['Cached', 'Uncached', 'Cached', 'Cached'],
    datasets: [
      {
        label: 'Response Time',
        data: [120, 400, 60, 90],
        borderColor: '#5b2af0',
        backgroundColor: '#5b2af0',
      },
    ],
  };
  return (
    <div>
      <h1>Metrics</h1>
      <div className="visuals-display">
        <div className="left-visual">
          <Line
            id="line-graph"
            width={800}
            height={300}
            // datasetIdKey="id"
            color="#5b2af0"
            data={dataLine}
          />
        </div>
        <div className="right-visual">
          <div className="right-metric">
            {/* Props passed here are for the response container being able to render the metrics associated with the hits and misses from the cache */}
            <Response 
            hits ={hits}
            misses = {misses}
            fetchTime = {fetchTime}
            />
          </div>
          <div className="right-chart">
            <Doughnut id="doughnut" data={dataDo} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualsDisplay;

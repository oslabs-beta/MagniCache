import React, { useState, useEffect, useContext, SetStateAction } from 'react';
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
import { Metrics } from '../../types';

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
  queryValue: string;
  queryResponse: Object;
  // fetchTime: number;
  // cacheData: string[];
  // lineGraphTimes: number[];
  // setLineGraphTimes: React.Dispatch<SetStateAction<number[]>>;
  // lineGraphLabels: string[];
  // setLineGraphLabels: React.Dispatch<SetStateAction<string[]>>;
  metrics: Metrics[];
  setMetrics: React.Dispatch<SetStateAction<Metrics[]>>;
}

// Create the charts within this file, response.tsx will take care of the metrics for the cache response
const VisualsDisplay = (props: VisualProps) => {
  // const [hits, setHits] = useState(5);
  // const [misses, setMisses] = useState(5);
  //TODO: Use queryresponse and fetch time to populate data inside visuals
  const {
    queryResponse,
    metrics,
    // fetchTime,
    // cacheData,
    // lineGraphTimes,
    // lineGraphLabels,
  } = props;
  //TODO: refactor this mess
  // console.log('cache me ousside', cacheData);
  const hits = metrics.reduce((acc: number, curr: Metrics): number => {
    if (curr.cacheStatus === 'hit') {
      acc++;
    }
    return acc;
  }, 0);
  const misses = metrics.reduce((acc: number, curr: Metrics): number => {
    if (curr.cacheStatus === 'miss') {
      acc++;
    }
    return acc;
  }, 0);
  // const misses = cacheData.filter((status) => status === 'misses');

  // console.log(new Date(window.performance.timing.fetchStart).toDateString())

  const dataDo = {
    labels: ['Hits', 'Misses'],
    datasets: [
      {
        label: 'Cache Hits/Misses',
        data: [hits, misses],
        backgroundColor: ['#5b2af0', '#b3001b'],
        borderColor: ['white'],
        borderWidth: 1,
      },
    ],
  };
  // if first response is 0, replace it/slice the array
  const dataLine = {
    labels: metrics.map((obj) => {
      if (obj.cacheStatus === 'hit') {
        return 'Cached';
      } else if (obj.cacheStatus === 'miss') {
        return 'Uncached'
      } 
    }),
    datasets: [
      {
        label: 'Response Time',
        data: metrics.map((obj) => obj.fetchTime),
        borderColor: '#5b2af0',
        backgroundColor: '#5b2af0',
      },
    ],
  };
  return (
    <>
      <h1 id="visuals-header">Metrics</h1>
      <div className="visuals-display">
        <div className="left-visual">
          <Line
            id="line-graph"
            width={1000}
            height={400}
            options={{ responsive: true, maintainAspectRatio: true }}
            // datasetIdKey="id"
            color="#5b2af0"
            data={dataLine}
          />
        </div>
        <div className="right-visual">
          <div className="hits-misses">
            {/* Props passed here are for the response container being able to render the metrics associated with the hits and misses from the cache */}
            <Response hits={hits} misses={misses} metrics={metrics} />
          </div>
          <div className="donut-chart">
            <Doughnut id="doughnut" data={dataDo} />
          </div>
        </div>
      </div>
    </>
  );
};

export default VisualsDisplay;

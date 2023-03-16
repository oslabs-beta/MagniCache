import { Response, Request, NextFunction } from 'express';

export type Metrics = {
  // queryMetrics
  fetchTime: number;
  cacheStatus: 'hit' | 'miss';
};

export type CacheMetricsType = {
  cacheUsage: number;
  sizeLeft: number;
  totalHits: number;
  totalMisses: number;
  AvgCacheTime: number;
  AvgMissTime: number;
  AvgMemAccTime: number;
};

export type MagnicacheType = {
  schema: {};
  maxSize: number;
  query: (req: Request, res: Response, next: NextFunction) => void;
  cache: {};
  metrics: CacheMetricsType;
  schemaTree: {
    mutations: {};
    queries: {
      //name:type
      //messageById:Message
      //schemaTree.queries[messageById] -> Message
    };
  };
  schemaParser: (
    schema: MagnicacheType['schema']
  ) => MagnicacheType['schemaTree'];
  schemaIsValid: (schema: MagnicacheType['schema']) => boolean;
};

/*
     this.metrics = { //type this to be a cacheMetrics type 
    cacheUsage: 0,
    sizeLeft: this.maxSize,
    totalHits: 0,
    totalMisses: 0,
    AvgCacheTime: 0, //for atomic queries only, can change to query as a whole later on
    AvgMissTime: 0,
    AvgMemAccTime: 0, // hit rate * cacheTime + miss rate * missTIme
  };
    */

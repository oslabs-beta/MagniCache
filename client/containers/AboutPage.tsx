import React from 'react';

// Component to render about pages and info for MagniCache
const AboutPage: React.FC = () => {
  return (
    <div id="about-page">
      <h1>About Magnicache</h1>
      <div className="about-magnicache">
        <p>
          MagniCache is a lightweight Express middleware caching solution.
          Imported as a package from npm, MagniCache can be inserted into the
          middleware chain for a GraphQL endpoint to intercept GraphQL requests
          and scan the cache for previously executed queries. Queries present in
          the cache will return the cached result to the client, improving
          response speeds and overall GraphQL performance.
        </p>
      </div>
      <p>Server-side caching with MagniCache is an effortless process.</p>
      <p className="install-steps">
        1. Install MagniCache <br />
        <code className="about-code">npm i @magnicache/server</code>
      </p>
      <p className="install-steps">
        2. Import MagniCache <br />
        <code className="about-code">
          const MagniCache = require('@magnicache/server');
        </code>
      </p>
      <p className="install-steps">
        3. Declare a new instance of MagniCache, passing in your GraphQL schema
        <br />
        <code className="about-code">
          const magnicache = new MagniCache(schema);
        </code>
      </p>
      <p className="install-steps">
        4. Insert magnicache.query into the middleware chain for your '/graphql'
        route
        <br />
        <code className="about-code">
          app.use('/graphql', magnicache.query, (req, res) ={'>'} {'{'} &nbsp;
          {'return'} {'res'}.status(200).send(res.locals.queryResponse);
          {'}'}
          );
        </code>
      </p>
    </div>
  );
};

export default AboutPage;

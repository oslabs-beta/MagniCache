import React from 'react';

const DocsPage: React.FC = () => {
  return (
    <div id="docs-page">
      <h1>Installation</h1>
      <div className="docs-flexbox">
        <div className="docs-server docs-item">
          <h5 className="docs-title">Server-Side Caching</h5>
          <p className="install-steps">
            1. Install MagniCache Server. <br />
            <code className="about-code">npm i @magnicache/server</code>
          </p>
          <p className="install-steps">
            2. Import MagniCache.
            <br />
            <code className="about-code">
              const MagniCache = require('@magnicache/server');
            </code>
          </p>
          <p className="install-steps">
            3. Declare a new instance of MagniCache, passing in your GraphQL
            schema
            <br />
            <code className="about-code">
              const magnicache = new MagniCache(schema);
            </code>
          </p>
          <p className="install-steps">
            4. Insert magnicache.query into the middleware chain for your
            '/graphql' route, while ensuring that all request bodies are parsed.
            <br />
            <code className="about-code">
              app.use(express.json()); <br />
              app.use('/graphql', magnicache.query, (req, res) ={'>'} {'{'}{' '}
              &nbsp;
              {'return'} {'res'}.status(200).send(res.locals.queryResponse)
              {'}'}
              );
            </code>
          </p>
        </div>
        <div className="docs-client docs-item">
          <h5 className="docs-title">Client-Side Caching</h5>
          <p className="install-steps">
            1. Install MagniCache Client. <br />
            <code className="about-code">npm i @magnicache/client</code>
          </p>
          <p className="install-steps">
            2. Import MagniCache.
            <br />
            <code className="about-code">
              const MagniClient = require('@magnicache/client');
            </code>
          </p>
          <p className="install-steps">
            3. Declare a new instance of MagniClient, optionally passing in a
            cache capacity.
            <br />
            <code className="about-code">
              const magniclient = new MagniClient(maxSize);
            </code>
          </p>
          <p className="install-steps">
            4. Invoke magniclient.query, passing in the query string and the
            graphql endpoint.
            <br />
            <code className="about-code">
              magniclient.query(queryString, '/graphql');
            </code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;

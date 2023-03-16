import React from 'react';
import { Link } from 'react-router-dom';

// Component to render about pages and info for MagniCache
const AboutPage: React.FC = () => {
  return (
    <div id="about-page">
      <div className="about-magnicache">
        <p>
          MagniCache is a lightweight and performant GraphQL caching solution.
          Packaged and shipped as two separate npm packages, MagniCache can be
          implemented seamlessly into projects as an Express middleware for
          server-side caching of queries and mutations, or as a localStorage
          manipulation device for client-side caching.
        </p>
        <p>
          Try it out{' '}
          <Link to="/demo" style={{ textDecoration: 'none' }}>
            here
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default AboutPage;

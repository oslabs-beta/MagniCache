import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import logo from '../assets/Logo.png';

// Component to render about pages and info for MagniCache

const AboutPage = () => {
  return (
    <>
      <Container className="my-5">
        <Row>
          <Col md={6} className="mb-4 mb-md-0">
            <h1>Cache quickly and efficiently with MagniCache</h1>
            <p>
              MagniCache is a lightweight and performant GraphQL caching
              solution. Packaged and shipped as two separate npm packages,
              MagniCache can be implemented seamlessly into projects as an
              Express middleware for server-side caching of queries and
              mutations, or as a localStorage manipulation device for
              client-side caching.
            </p>
          </Col>
          <Col md={6}>
            <img src={logo} className="img-fluid" />
          </Col>
        </Row>
      </Container>

      <Container className="my-5">
        <Row>
          <Col md={6}>
            <h2>Server-Side Caching</h2>
            <p>
              @magnicache/server is a lightweight GraphQL caching solution.
              <br></br>
              <br></br>
              Imported as a package from npm, @magnicache/server can be inserted
              into the middleware chain for a GraphQL endpoint to intercept
              GraphQL requests and scan the cache for previously executed
              queries.
              <br></br>
              <br></br>
              Queries present in the cache will return the cached result to the
              client, improving response speeds and overall GraphQL performance.
            </p>
          </Col>
          <Col md={6}>
            <h2>Client-Side Caching</h2>
            <p>
              @magnicache/client is a powerful library designed to significantly
              improve response times for GraphQL queries by leveraging the
              browser's localStorage.
              <br></br>
              <br></br>A lightweight client-side GraphQL caching solution that
              optimizes queries by atomizing complex queries and caching them
              individually.
              <br></br>
              <br></br>
              MagniClient utilizes localStorage to cache query results across
              sessions. Configurable cache size.
              <br></br>
              <br></br>
            </p>
          </Col>
        </Row>
      </Container>

      {/* <Container className="my-5">
        <h2 className="text-center mb-5">WHat else can we add here?</h2>
        <Row className="justify-content-center">
          <Col md={8}></Col>
        </Row>
      </Container> */}

      <Row className="py-5">
        <Col
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h3>Support Us!</h3>
          <p>
            Follow us on social media to stay up-to-date with our latest news
            and articles:
          </p>
          <div className="d-flex justify-content-center">
            <Button
              variant="outline-primary"
              className="m-2"
              href="https://www.linkedin.com/company/magnicache/about/"
            >
              <div className="mr-2" /> LinkedIn
            </Button>
            <Button
              variant="outline-primary"
              className="m-2"
              href="https://github.com/oslabs-beta/MagniCache"
            >
              <div className="mr-2" /> Github
            </Button>
            <Button
              variant="outline-primary"
              className="m-2"
              href="https://medium.com/@achami8799/magnicache-a-caching-solution-for-graphql-a0a9de353a42"
            >
              <div className="mr-2" /> Medium
            </Button>
            <Button
              variant="outline-primary"
              className="m-2"
              href="https://twitter.com/"
            >
              <div className="mr-2" /> Twitter
            </Button>
          </div>
        </Col>
      </Row>
      <Row className="bg-dark text-white py-3">
        <Col className="d-flex justify-content-between">
          <div>
            <span className="mr-2">© 2023 MagniCache</span>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default AboutPage;

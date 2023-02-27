import React, { useState, useEffect, useContext } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';

const NavBar: React.FC = () => {
  let nightMode = false;
  // Navbar.Brand is currently using href, which reloads home page onClicking magniCache --> not sure whether this is better or do we want to make it a router link
  return (
    <Navbar className="nav">
      <Container>
        <Navbar.Brand id="nav-title" href="/">
          MagniCache
        </Navbar.Brand>
        <Nav className="all-nav-links">
          <Nav.Link as={Link} id="about-nav-link" to="/about">
            About
          </Nav.Link>
          <Nav.Link as={Link} id="docs-nav-link" to="/docs">
            Docs
          </Nav.Link>
          <Nav.Link as={Link} id="team-nav-link" to="/team">
            Team
          </Nav.Link>
          {/* <Nav.Link>
            <i
              id="moon"
              className="fas fa-moon"
              style={nightMode ? { color: '#1a8fe3' } : { color: 'black' }}
            ></i>
          </Nav.Link> */}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavBar;

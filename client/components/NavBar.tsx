import React, { useState, useEffect, useContext } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';

const NavBar: React.FC = () => {
  // Navbar.Brand is currently using href, which reloads home page onClicking magniCache
  return (
    <Navbar fixed="top" className="nav">
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
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavBar;

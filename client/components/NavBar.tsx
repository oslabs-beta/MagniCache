import React, { useState, useEffect, useContext } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import '../scss/styles.scss';
import { useNavigate } from 'react-router-dom';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Navbar fixed="top" className="nav">
      <Container>
        <Navbar.Brand id="nav-title" href="/">
          MagniCache
        </Navbar.Brand>
        <Nav className="all-nav-links">
          <Nav.Link id="nav-link" onClick={() => navigate('/about')}>
            About
          </Nav.Link>
          <Nav.Link id="nav-link" onClick={() => navigate('/docs')}>
            Docs
          </Nav.Link>
          <Nav.Link id="nav-link" onClick={() => navigate('/team')}>
            Team
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavBar;

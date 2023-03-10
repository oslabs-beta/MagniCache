import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import logo from '../assets/Logo.png';

const NavBar: React.FC = () => {
  return (
    <Navbar className="nav">
      <Container>
        <Navbar.Brand id="nav-title" href="/">
          MagniCache
          <img src={logo} className="logo" />
        </Navbar.Brand>
        <Nav className="all-nav-links">
          <Nav.Link as={Link} id="about-nav-link" to="/about">
            About
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

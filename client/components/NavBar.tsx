import React, { useState, useEffect, useContext } from 'react';
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import '../scss/styles.scss';

const NavBar: React.FC = () => {
  return (
    <Navbar fixed ="top" className="nav"> 
      <Container>
        <Navbar.Brand id='nav-title' href='#home'>MagniCache</Navbar.Brand>
        <Nav className="all-nav-links" >
          <Nav.Link id="nav-link" href="#about">About</Nav.Link>
          <Nav.Link id="nav-link" href="#docs">Docs</Nav.Link>
          <Nav.Link id="nav-link" href="#team">Team</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  )
};

export default NavBar;

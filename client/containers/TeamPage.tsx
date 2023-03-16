import React from 'react';
import ahmed from '../assets/ahm.png';
import aria from '../assets/aria.png';
import truman from '../assets/tru.png';
import yousuf from '../assets/you.png';

// Component for adding and rendering team page
const TeamPage: React.FC = () => {
  return (
    <div id="team-page">
      <h1>Our Team</h1>
      <p id="team-description">The team that contributed to MagniCache.</p>
      <div id="team-members">
        <div className="member">
          <img className="member-img" src={ahmed} alt="" />
          <p className="member-name">Ahmed Chami</p>
          <p>
            <a
              target={'_blank'}
              rel="noopener noferrer"
              href="https://github.com/Achami64"
              className="member-links"
            >
              GitHub
            </a>
          </p>
          <p>
            <a
              target={'_blank'}
              rel="noopener noferrer"
              href="https://www.linkedin.com/in/ahmed-chami-dev/"
              className="member-links"
            >
              LinkedIn
            </a>
          </p>
        </div>
        <div className="member">
          <img className="member-img" src={aria} alt="" />
          <p className="member-name">Aria Soltankhah</p>
          <p>
            <a
              target={'_blank'}
              rel="noopener noferrer"
              href="https://github.com/ariasoltank"
              className="member-links"
            >
              GitHub
            </a>
          </p>
          <p>
            <a
              target={'_blank'}
              rel="noopener noferrer"
              href="https://www.linkedin.com/in/ariasol/"
              className="member-links"
            >
              LinkedIn
            </a>
          </p>
        </div>
        <div className="member">
          <img className="member-img" src={truman} alt="" />
          <p className="member-name">Truman Miller</p>
          <p>
            <a
              target={'_blank'}
              rel="noopener noferrer"
              href="https://github.com/trumanmiller"
              className="member-links"
            >
              GitHub
            </a>
          </p>
          <p>
            <a
              target={'_blank'}
              rel="noopener noferrer"
              href="https://www.linkedin.com/in/truman-miller/"
              className="member-links"
            >
              LinkedIn
            </a>
          </p>
        </div>
        <div className="member">
          <img className="member-img" src={yousuf} alt="" />
          <p className="member-name">Yousuf Elkhoga</p>
          <p>
            <a
              target={'_blank'}
              rel="noopener noferrer"
              href="https://github.com/yousuf-e"
              className="member-links"
            >
              GitHub
            </a>
          </p>
          <p>
            <a
              target={'_blank'}
              rel="noopener noferrer"
              href="https://www.linkedin.com/in/yousufelkhoga/"
              className="member-links"
            >
              LinkedIn
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;

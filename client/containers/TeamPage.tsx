import React from 'react';

const TeamPage: React.FC = () => {
  return (
    <div id="team-page">
      <h1>Our Team</h1>
      <p id="team-description">The team that made MagniCache possible.</p>
      <div id="team-members">
        <div className="member">
          <img
            className="member-img"
            src="https://news.artnet.com/app/news-upload/2021/09/Yuga-Labs-Bored-Ape-Yacht-Club-4466.jpg"
            alt=""
          />
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
              href="https://www.linkedin.com/in/willsentance/"
              className="member-links"
            >
              LinkedIn
            </a>
          </p>
        </div>
        <div className="member">
          <img
            className="member-img"
            src="https://images.wsj.net/im-491396?width=700&height=700"
            alt=""
          />
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
          <img
            className="member-img"
            src="https://dmn-dallas-news-prod.cdn.arcpublishing.com/resizer/S4M0CdQhrn3l6L5kKA0--avlY00=/930x0/smart/filters:no_upscale()/cloudfront-us-east-1.images.arcpublishing.com/dmn/VDA2OKJUXJDSRNL76H44LQFNWY.jpg"
            alt=""
          />
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
          <img
            className="member-img"
            src="https://www.artnews.com/wp-content/uploads/2022/01/unnamed-2.png?w=631"
            alt=""
          />
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

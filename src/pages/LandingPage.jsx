import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleAddLinkClick = () => {
    navigate('/link');
  };

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>
          세상의 모든 정보를
          <br />
          쉽게 저장하고 관리해 보세요
        </h1>
        <button onClick={handleAddLinkClick} className="add-link-button">
          링크 보기
        </button>
      </div>
    </div>
  );
};

export default LandingPage;

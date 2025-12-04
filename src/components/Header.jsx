import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { isLoggedIn, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          <div className="logo-text">Linkbrary</div>
        </Link>
        {isLoggedIn ? (
          <button onClick={logout} className="logout-button">
            로그아웃
          </button>
        ) : (
          <Link to="/login" className="login-button">
            로그인
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;

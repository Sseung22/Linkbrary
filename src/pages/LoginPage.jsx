import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, socialLogin } = useAuth(); // Use the new login function

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    const result = await login(email, password);
    if (result.success) {
      navigate('/link'); // Navigate to the link page on successful login
    } else {
      setError(result.error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await socialLogin('google', tokenResponse.access_token);
        navigate('/link'); // Navigate to the link page on successful social login
      } catch (error) {
        console.error('Google login failed:', error);
        setError('Google login failed.');
      }
    },
    onError: (error) => {
      console.error('Google login failed:', error);
      setError('Google login failed.');
    },
  });

  const handleGoogleLogin = () => {
    googleLogin();
  };

  return (
    <div className="login-page-container">
      <div className="login-form">
        <h2>로그인</h2>
        <form onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="email-login-button">
            이메일로 로그인
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <div className="social-login-buttons">
          <button onClick={handleGoogleLogin} className="social-login-button google">
            Google로 로그인
          </button>
        </div>
        <div className="signup-link">
          회원이 아니신가요? <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
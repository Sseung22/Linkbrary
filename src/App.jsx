import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SharePage from './pages/SharePage';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

import LinkPage from './pages/LinkPage';
import SignupPage from './pages/SignupPage'; // Import SignupPage

const Layout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            {/* The login and signup routes are typically outside the layout */}
            <Route path="share" element={<SharePage />} />
            <Route path="link" element={<LinkPage />} />
          </Route>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} /> {/* Add SignupPage route */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
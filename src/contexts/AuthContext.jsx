import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../apis/api'; // Import the apiClient

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      const fetchUserData = async () => {
        try {
          // Guessing a user endpoint, adjust if needed
          const response = await apiClient.get('/users/me'); 
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setToken(null); // Clear token if user data fetch fails
          localStorage.removeItem('token');
        }
      };
      fetchUserData();
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password }); // Changed endpoint
      // Assuming the token is in response.data.accessToken
      const accessToken = response.data.accessToken; 
      setToken(accessToken);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (email, password, name) => {
    try {
      // Corrected signup endpoint to '/auth/register' with 'name' in body
      await apiClient.post('/auth/register', { email, password, name });
      return { success: true };
    } catch (error) {
      console.error("Signup failed:", error);
      return { success: false, error: error.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = () => {
    setToken(null);
    // User data is cleared by useEffect when token becomes null
  };

  const auth = {
    token,
    user,
    login, // Provide the new login function
    signup, // Provide the new signup function
    logout,
    isLoggedIn: !!token,
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
